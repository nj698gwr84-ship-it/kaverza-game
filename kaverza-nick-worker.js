"use strict";

const ROOT = new URL("./", self.location.href);
const SAMPLE_RATE = 22050;
let engine;

async function file(name, gzip = false) {
  const url = new URL(name, ROOT).href;
  const cache = await self.caches
    ?.open("kaverza-nickname-voice-v1")
    .catch(() => null);
  const cached = await cache?.match(url).catch(() => null);
  const response = cached || (await fetch(url));
  if (!response.ok) throw Error("Voice asset " + name + ": " + response.status);
  if (!cached && cache) cache.put(url, response.clone()).catch(() => {});
  if (!gzip) return response.arrayBuffer();
  return new Response(
    response.body.pipeThrough(new DecompressionStream("gzip")),
  ).arrayBuffer();
}

function unpackWeights(parts) {
  const count = parts.reduce((total, part) => total + part.byteLength / 2, 0);
  const floats = new Float32Array(count);
  const bits = new Uint32Array(floats.buffer);
  let index = 0;
  for (const part of parts) {
    for (const half of new Uint16Array(part)) {
      const exponent = (half >>> 10) & 31;
      const fraction = half & 1023;
      if (exponent === 0) {
        floats[index] = (half & 0x8000 ? -1 : 1) * fraction * 2 ** -24;
      } else {
        bits[index] =
          ((half & 0x8000) << 16) |
          ((exponent === 31 ? 255 : exponent + 112) << 23) |
          (fraction << 13);
      }
      index++;
    }
  }
  return new Uint8Array(floats.buffer);
}

async function initialize() {
  if (!self.DecompressionStream) throw Error("Gzip voice assets unsupported");
  importScripts(new URL("piper_phonemize.js", ROOT).href);
  const [ort, model, offsets, phonemeData, phonemeWasm, first, second] = await Promise.all([
    import(new URL("ort.wasm.min.mjs", ROOT).href),
    file("kaverza-voice.onnx.gz", true),
    fetch(new URL("kaverza-voice-offsets.json", ROOT)).then((r) => r.json()),
    file("piper_phonemize.data.gz", true),
    file("piper_phonemize.wasm"),
    file("kaverza-weights-1.gz", true),
    file("kaverza-weights-2.gz", true),
  ]);
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.wasmPaths = ROOT.href;
  const weights = unpackWeights([first, second]);
  const modelBytes = new Uint8Array(model);
  let offset = 0;
  for (const [start, size] of offsets) {
    modelBytes.set(weights.subarray(offset, offset + size), start);
    offset += size;
  }
  if (offset !== weights.byteLength)
    throw Error("Voice weights length mismatch");
  const session = await ort.InferenceSession.create(model, {
    executionProviders: ["wasm"],
  });
  return {ort, session, phonemeData, phonemeWasm};
}

function normalizeNickname(value) {
  const words = value
    .normalize("NFC")
    .replace(/([\p{Ll}\d])([\p{Lu}])/gu, "$1 $2")
    .replace(/[_./\\-]+/gu, " ")
    .replace(/[^\p{L}\p{N}\p{M} !?+]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words.slice(0, 42);
}

async function synthesize(nickname) {
  const text = normalizeNickname(nickname);
  const spoken = /[\p{L}\p{N}]/u.test(text) ? text : "Ник из символов";
  const {ort, session, phonemeData, phonemeWasm} = await (engine ??= initialize().catch(
    (error) => {
      throw Error("Voice initialization: " + error);
    },
  ));
  const phonemeIds = [];
  let phonemeError = "";
  // The bundled CLI keeps per-run allocations, so reuse its bytes, not its heap.
  const phonemizer = await self.createPiperPhonemize({
    locateFile: name => new URL(name, ROOT).href,
    getPreloadedPackage: () => phonemeData,
    wasmBinary: phonemeWasm,
    print: line => {
      const ids = JSON.parse(line).phoneme_ids;
      if (Array.isArray(ids)) phonemeIds.push(...ids);
    },
    printErr: line => { phonemeError = line; },
  });
  try {
    phonemizer.callMain([
      "-l",
      "ru",
      "--input",
      JSON.stringify([{ text: spoken + "!" }]),
      "--espeak_data",
      "/espeak-ng-data",
    ]);
  } catch (error) {
    throw Error("Phonemizer: " + error + " " + phonemeError);
  }
  if (phonemeIds.length < 4)
    throw Error(phonemeError || "No nickname phonemes");
  const ids = BigInt64Array.from(phonemeIds, BigInt);
  const results = await session
    .run({
      input: new ort.Tensor("int64", ids, [1, ids.length]),
      input_lengths: new ort.Tensor(
        "int64",
        BigInt64Array.of(BigInt(ids.length)),
        [1],
      ),
      scales: new ort.Tensor("float32", Float32Array.of(0.55, 0.95, 0.333), [
        3,
      ]),
    })
    .catch((error) => {
      throw Error("Voice inference: " + error);
    });
  const data = results.output.data;
  let first = data.findIndex((sample) => Math.abs(sample) > 0.008);
  if (first < 0) {
    results.output.dispose();
    return null;
  }
  let last = data.length - 1;
  while (last > first && Math.abs(data[last]) <= 0.008) last--;
  first = Math.max(0, first - Math.round(SAMPLE_RATE * 0.045));
  last = Math.min(data.length, last + Math.round(SAMPLE_RATE * 0.07));
  const samples = data.slice(first, last);
  const peak = samples.reduce(
    (max, sample) => Math.max(max, Math.abs(sample)),
    0.2,
  );
  for (let i = 0; i < samples.length; i++) samples[i] *= 0.72 / peak;
  results.output.dispose();
  return samples;
}

let queue = Promise.resolve();
self.onmessage = ({ data: { id, name } }) => {
  queue = queue.then(async () => {
    try {
      const samples = await synthesize(name);
      if (samples)
        self.postMessage({ id, samples, sampleRate: SAMPLE_RATE }, [
          samples.buffer,
        ]);
      else self.postMessage({ id });
    } catch (error) {
      self.postMessage({ id, error: String(error?.message || error) });
    }
  });
};
