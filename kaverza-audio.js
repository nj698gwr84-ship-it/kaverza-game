"use strict";

const KaverzaAudio = (() => {
  const cues = {
    click: [[493, 0.06]],
    add: [
      [392, 0.08],
      [587, 0.12, 0.06],
    ],
    start: [
      [262, 0.12],
      [392, 0.14, 0.1],
      [523, 0.22, 0.21],
    ],
    spin: [
      [196, 0.15],
      [330, 0.15, 0.08],
    ],
    wheel: [[240, 0.052]],
    slow: [[184, 0.075]],
    stop: [
      [140, 0.15],
      [440, 0.13, 0.06],
    ],
    category: [[740, 0.12, 0.13]],
    reveal: [
      [622, 0.15],
      [932, 0.2, 0.09],
      [1175, 0.23, 0.17],
    ],
    timer: [[466, 0.09, 0.36]],
    tick: [[528, 0.075]],
    timeout: [
      [310, 0.16],
      [196, 0.26, 0.12],
    ],
    success: [
      [523, 0.14],
      [659, 0.16, 0.09],
      [784, 0.22, 0.17],
    ],
    score: [[988, 0.13, 0.31]],
    skip: [
      [247, 0.11],
      [185, 0.15, 0.075],
    ],
    next: [[294, 0.09]],
    round: [
      [349, 0.09],
      [523, 0.15, 0.075],
    ],
    end: [[277, 0.14]],
    win: [
      [392, 0.16, 0.13],
      [523, 0.18, 0.26],
      [659, 0.18, 0.39],
      [784, 0.25, 0.52],
      [1047, 0.36, 0.67],
    ],
  };
  // Offsets in the local voice track. Piper Denis, CC0 dataset.
  // https://huggingface.co/rhasspy/piper-voices/blob/main/ru/ru_RU/denis/medium/MODEL_CARD
  const clips = {
    start1: [0.0, 2.9149],
    start2: [2.9149, 3.2674],
    turn1: [6.1823, 1.0895],
    turn2: [7.2718, 1.2411],
    turn3: [8.5129, 1.1104],
    round: [9.6233, 1.3524],
    end: [10.9756, 1.6503],
    win: [12.6259, 2.151],
    tie: [14.7769, 2.3579],
    preview: [17.1348, 3.8499],
    вопрос: [20.9847, 2.2496],
    действие: [23.2343, 2.44],
    вызов: [25.6743, 2.4974],
    откровение: [28.1717, 2.5732],
    каверза: [30.7449, 2.5216],
    бонус: [33.2665, 2.5861],
    partner: [35.8527, 1.0706],
    partners: [36.9232, 1.3522],
    "name:артём": [38.2754, 0.6971],
    "name:артем": [38.9725, 0.7092],
    "name:вася": [39.6817, 0.664],
    "name:василий": [40.3458, 0.85],
    "name:андрей": [41.1957, 0.7864],
    "name:настя": [41.9821, 0.7124],
    "name:анастасия": [42.6945, 1.1297],
    "name:тимофей": [43.8242, 0.9429],
    "name:максим": [44.767, 0.785],
    "name:алина": [45.552, 0.7344],
    "name:катя": [46.2864, 0.6472],
    "name:екатерина": [46.9336, 1.0449],
    "name:дима": [47.9785, 0.7059],
    "name:дмитрий": [48.6844, 0.815],
    "name:саша": [49.4994, 0.6318],
    "name:александр": [50.1312, 0.925],
    "name:александра": [51.0562, 0.955],
    "name:элина": [52.0112, 0.7513],
    "name:света": [52.7625, 0.6751],
    "name:светлана": [53.4377, 0.8762],
    "name:маша": [54.3139, 0.6829],
    "name:мария": [54.9968, 0.81],
    "name:миша": [55.8068, 0.7747],
    "name:михаил": [56.5816, 0.7471],
    "name:никита": [57.3287, 0.8156],
    "name:олег": [58.1443, 0.6424],
    "name:ирина": [58.7867, 0.7454],
    "name:юрий": [59.5322, 0.6861],
    "name:ксения": [60.2182, 0.7812],
    "name:анна": [60.9995, 0.6475],
    "name:аня": [61.647, 0.6765],
    "name:иван": [62.3234, 0.6123],
    "name:ваня": [62.9357, 0.661],
    "name:серёжа": [63.5967, 0.799],
    "name:сергей": [64.3957, 0.8114],
    "name:алексей": [65.2071, 0.8354],
    "name:лёша": [66.0425, 0.6851],
    "name:денис": [66.7276, 0.7049],
    "name:рома": [67.4325, 0.6724],
    "name:роман": [68.1049, 0.7463],
    "name:вика": [68.8513, 0.7224],
    "name:виктория": [69.5737, 0.9292],
    "name:илья": [70.5029, 0.6551],
    "name:женя": [71.158, 0.7032],
    "name:евгений": [71.8612, 0.8608],
    "name:полина": [72.722, 0.7253],
    "name:юля": [73.4473, 0.7007],
    "name:юлия": [74.1479, 0.7177],
    "name:даша": [74.8656, 0.6507],
    "name:дарья": [75.5163, 0.802],
    "name:марина": [76.3184, 0.7885],
    "name:оля": [77.1069, 0.7],
    "name:ольга": [77.8068, 0.6518],
    round1: [78.4587, 0.9744],
    round2: [79.4331, 0.9308],
    round3: [80.3639, 0.9744],
    round4: [81.3383, 1.1364],
    round5: [82.4747, 0.938],
    round6: [83.4127, 1.0327],
    round7: [84.4454, 1.0434],
    round8: [85.4887, 1.0147],
    round9: [86.5034, 1.0907],
    round10: [87.5941, 1.1689],
    round11: [88.763, 1.3628],
    round12: [90.1258, 1.3221],
    round13: [91.4479, 1.316],
    round14: [92.7639, 1.383],
    round15: [94.1469, 1.3405],
    round16: [95.4874, 1.3667],
    round17: [96.8541, 1.3051],
    round18: [98.1592, 1.4257],
    round19: [99.5849, 1.4351],
    round20: [101.02, 1.1736],
    round21: [102.1937, 1.4707],
    round22: [103.6643, 1.4828],
    round23: [105.1471, 1.485],
    round24: [106.6321, 1.5951],
    round25: [108.2272, 1.4564],
  };
  const media = { host: "kaverza-host.mp3", music: "kaverza-party.mp3", nicknames: "kaverza-nicknames-v207.mp3" };

  const nameKey = (name) =>
    name.trim().toLocaleLowerCase("ru-RU").normalize("NFC");
  const nicknameClips = {
  "член": [
    0.12,
    0.55229
  ],
  "жопа": [
    0.77229,
    0.57878
  ],
  "вагина": [
    1.45107,
    0.68612
  ],
  "пизда": [
    2.23719,
    0.64313
  ],
  "хуй": [
    2.98032,
    0.4917
  ],
  "членосос": [
    3.57202,
    0.75043
  ],
  "хуесос": [
    4.42245,
    0.71728
  ],
  "сперма": [
    5.23973,
    0.67669
  ],
  "хер": [
    6.01642,
    0.48676
  ],
  "хрен": [
    6.60317,
    0.55705
  ],
  "пенис": [
    7.26023,
    0.57937
  ],
  "писюн": [
    7.93959,
    0.69406
  ],
  "писюнец": [
    8.73365,
    0.79052
  ],
  "писька": [
    9.62417,
    0.59968
  ],
  "пиписька": [
    10.32385,
    0.73061
  ],
  "пипирка": [
    11.15447,
    0.79438
  ],
  "пипка": [
    12.04884,
    0.62086
  ],
  "залупа": [
    12.76971,
    0.69179
  ],
  "залупка": [
    13.5615,
    0.69714
  ],
  "мошонка": [
    14.35864,
    0.77533
  ],
  "яйца": [
    15.23397,
    0.6059
  ],
  "яйцо": [
    15.93986,
    0.679
  ],
  "яички": [
    16.71887,
    0.85406
  ],
  "яичко": [
    17.67293,
    0.74839
  ],
  "сиська": [
    18.52132,
    0.61982
  ],
  "сиськи": [
    19.24113,
    0.67138
  ],
  "титька": [
    20.01252,
    0.5898
  ],
  "титьки": [
    20.70231,
    0.68345
  ],
  "титя": [
    21.48576,
    0.60853
  ],
  "тити": [
    22.19429,
    0.66544
  ],
  "сосок": [
    22.95973,
    0.7166
  ],
  "соски": [
    23.77633,
    0.73873
  ],
  "попа": [
    24.61506,
    0.52698
  ],
  "попка": [
    25.24204,
    0.62653
  ],
  "жопка": [
    25.96857,
    0.69224
  ],
  "жопища": [
    26.76082,
    0.72413
  ],
  "задница": [
    27.58494,
    0.75193
  ],
  "зад": [
    28.43687,
    0.45379
  ],
  "задок": [
    28.99066,
    0.60603
  ],
  "очко": [
    29.69669,
    0.7019
  ],
  "анус": [
    30.49859,
    0.53959
  ],
  "анал": [
    31.13819,
    0.58698
  ],
  "клитор": [
    31.82517,
    0.68943
  ],
  "клитер": [
    32.6146,
    0.6683
  ],
  "киска": [
    33.3829,
    0.59143
  ],
  "манда": [
    34.07433,
    0.69215
  ],
  "мандовошка": [
    34.86649,
    0.92018
  ],
  "вульва": [
    35.88667,
    0.52934
  ],
  "промежность": [
    36.51601,
    0.77052
  ],
  "конча": [
    37.38653,
    0.65546
  ],
  "спермач": [
    38.142,
    0.74404
  ],
  "сперматозоид": [
    38.98603,
    1.02467
  ],
  "оргазм": [
    40.1107,
    0.69678
  ],
  "секс": [
    40.90748,
    0.57365
  ],
  "дилдо": [
    41.58113,
    0.63401
  ],
  "дилдак": [
    42.31515,
    0.62517
  ],
  "дилдакос": [
    43.04032,
    0.73542
  ],
  "вибратор": [
    43.87574,
    0.76231
  ],
  "фаллос": [
    44.73805,
    0.5751
  ],
  "фаллоимитатор": [
    45.41315,
    0.98698
  ],
  "стояк": [
    46.50014,
    0.65864
  ],
  "говно": [
    47.25878,
    0.67986
  ],
  "говнюк": [
    48.03864,
    0.72263
  ],
  "говнючка": [
    48.86127,
    0.83025
  ],
  "говноед": [
    49.79152,
    0.70785
  ],
  "какашка": [
    50.59937,
    0.77283
  ],
  "какашки": [
    51.4722,
    0.81868
  ],
  "какаха": [
    52.39088,
    0.71524
  ],
  "пердун": [
    53.20612,
    0.64721
  ],
  "пердунец": [
    53.95333,
    0.7615
  ],
  "пердёж": [
    54.81483,
    0.67927
  ],
  "пук": [
    55.5941,
    0.45873
  ],
  "пукалка": [
    56.15283,
    0.6868
  ],
  "засранец": [
    56.93964,
    0.77424
  ],
  "засранка": [
    57.81388,
    0.79646
  ],
  "срака": [
    58.71034,
    0.57188
  ],
  "сракер": [
    59.38222,
    0.64268
  ],
  "жопошник": [
    60.1249,
    0.87628
  ],
  "жопогрыз": [
    61.10118,
    0.76508
  ],
  "жополиз": [
    61.96626,
    0.73007
  ],
  "жопастик": [
    62.79633,
    0.83519
  ],
  "жопастый": [
    63.73152,
    0.76744
  ],
  "хуеплёт": [
    64.59896,
    0.73211
  ],
  "хуесоска": [
    65.43107,
    0.89016
  ],
  "членососка": [
    66.42122,
    0.94671
  ],
  "хуило": [
    67.46794,
    0.70345
  ],
  "хуёк": [
    68.27138,
    0.60218
  ],
  "хуйня": [
    68.97356,
    0.69578
  ],
  "хуюшка": [
    69.76934,
    0.64871
  ],
  "сисястик": [
    70.51805,
    0.83279
  ],
  "сисястый": [
    71.45084,
    0.80009
  ],
  "сисечка": [
    72.35093,
    0.87655
  ],
  "титькотряс": [
    73.32748,
    0.85302
  ],
  "порнозвезда": [
    74.2805,
    0.92408
  ],
  "порноактёр": [
    75.30458,
    0.85592
  ],
  "порноактриса": [
    76.2605,
    0.90753
  ],
  "пошляк": [
    77.26803,
    0.72989
  ],
  "пошлячка": [
    78.09791,
    0.89016
  ],
  "развратник": [
    79.08807,
    0.90721
  ],
  "развратница": [
    80.09528,
    0.94535
  ],
  "извращенец": [
    81.14063,
    0.93927
  ],
  "извращенка": [
    82.17991,
    0.94032
  ],
  "ноль": [
    83.22023,
    0.49061
  ],
  "один": [
    83.81084,
    0.56317
  ],
  "два": [
    84.47401,
    0.50367
  ],
  "три": [
    85.07769,
    0.54113
  ],
  "четыре": [
    85.71882,
    0.72848
  ],
  "пять": [
    86.5473,
    0.50014
  ],
  "шесть": [
    87.14744,
    0.59705
  ],
  "семь": [
    87.84449,
    0.60045
  ],
  "восемь": [
    88.54494,
    0.65519
  ],
  "девять": [
    89.30014,
    0.62127
  ],
  "0": [
    83.22023,
    0.49061
  ],
  "1": [
    83.81084,
    0.56317
  ],
  "2": [
    84.47401,
    0.50367
  ],
  "3": [
    85.07769,
    0.54113
  ],
  "4": [
    85.71882,
    0.72848
  ],
  "5": [
    86.5473,
    0.50014
  ],
  "6": [
    87.14744,
    0.59705
  ],
  "7": [
    87.84449,
    0.60045
  ],
  "8": [
    88.54494,
    0.65519
  ],
  "9": [
    89.30014,
    0.62127
  ]
};
  const tokenKey = (value) => nameKey(value).replace(/ё/g, "е").replace(/[\s_.\/\\-]+/g, "");
  const tokenGroups = new Map();
  const tokenEntries = new Map();
  for (const [id, clip] of Object.entries(clips)) {
    if (id.startsWith("name:")) {
      const key = tokenKey(id.slice(5));
      if (!tokenEntries.has(key)) tokenEntries.set(key, { media: "host", clip });
    }
  }
  for (const [word, clip] of Object.entries(nicknameClips)) {
    const key = tokenKey(word);
    if (!tokenEntries.has(key)) tokenEntries.set(key, { media: "nicknames", clip });
  }
  for (const [key, part] of tokenEntries) {
    if (!key) continue;
    if (!tokenGroups.has(key[0])) tokenGroups.set(key[0], []);
    tokenGroups.get(key[0]).push({ key, part });
  }
  for (const candidates of tokenGroups.values()) candidates.sort((a, b) => b.key.length - a.key.length);

  function nicknameTokens(name) {
    const key = tokenKey(name);
    if (!key || key.length > 96) return null;
    const memo = new Map();
    function parse(position) {
      if (position === key.length) return [];
      if (memo.has(position)) return memo.get(position);
      for (const entry of tokenGroups.get(key[position]) || []) {
        if (!key.startsWith(entry.key, position)) continue;
        const tail = parse(position + entry.key.length);
        if (tail) {
          const result = [entry.part, ...tail];
          memo.set(position, result);
          return result;
        }
      }
      memo.set(position, null);
      return null;
    }
    return parse(0);
  }


  function voiceSequence(event, details, previous) {
    const choose = (ids) => {
      const options = ids.filter((id) => id !== previous);
      return options[Math.floor(Math.random() * options.length)] || ids[0];
    };
    const primary = {
      start: () => choose(["start1", "start2"]),
      turn: () => choose(["turn1", "turn2", "turn3"]),
      round: () =>
        clips["round" + details.round] ? "round" + details.round : "round",
      card: () => (clips[details.category] ? details.category : "turn3"),
      end: () => (details.winners.length > 1 ? "tie" : "win"),
      preview: () => "preview",
    }[event]();
    const names = [];
    const ids = [primary];
    const addName = (name) => { if (name) names.push(name); };
    if (event === "end") {
      for (const name of details.winners) addName(name);
    } else if (event === "card") {
      const cast = details.cast || [];
      if (cast.length) ids.push(cast.length === 1 ? "partner" : "partners");
      cast.forEach(addName);
    } else {
      addName(details.player);
    }
    return { ids, names };
  }
  const key = "kaverza-audio-v2";

  function create({ enabled }) {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(key)) || {};
    } catch {}
    const volume = (value, fallback) =>
      Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
    const settings = {
      enabled,
      effects: volume(saved.effects, 0.62),
      music: saved.music !== false,
      musicVolume: volume(saved.musicVolume, 0.46),
      voice: saved.voice !== false,
      voiceVolume: volume(saved.voiceVolume, 0.82),
    };
    const Context = window.AudioContext || window.webkitAudioContext;
    let context, master, effects, music, host, musicSource;
    let buffers = {},
      loads = {},
      pendingCue = null,
      pendingVoice = null;
    let voiceToken = 0;
    let unlocked = false;
    const activeEffects = new Set(),
      activeVoice = new Set();
    const listeners = new Set();
    const lastPhrase = {};
    let finishRecorded = null, voiceDeadline = null, voiceError = "";
    let nickStatus = "idle", bankStatus = "idle", generationStatus = "idle";
    let nickWorker, nickRequest = 0;
    const nickPending = new Map(),
      nickCache = new Map(),
      nickInFlight = new Map(),
      nickRetryAfter = new Map();
    const nickRetryDelays = [1000, 3000];
    const nickTimeout = 90000;
    const nickCooldown = 15000;
    let nickQueue = Promise.resolve();
    function resetNickWorker(worker) {
      // Ignore late errors from a worker replaced by a retry.
      if (nickWorker !== worker) return;
      nickWorker = null;
      worker.terminate();
      for (const finish of nickPending.values()) finish(null);
    }

    function requestNick(name) {
      return new Promise((resolve) => {
        try {
          if (!nickWorker) {
            const worker = new Worker("kaverza-nick-worker.js?v=2.0.7-bg");
            nickWorker = worker;
            worker.onerror = (event) => {
              event.preventDefault?.();
              resetNickWorker(worker);
            };
            worker.onmessageerror = () => resetNickWorker(worker);
            worker.onmessage = ({ data }) => {
              if (nickWorker !== worker) return;
              const finish = nickPending.get(data?.id);
              if (!finish) return;
              if (
                data.error ||
                !(data.samples instanceof Float32Array) ||
                !data.samples.length ||
                !Number.isFinite(data.sampleRate) ||
                data.sampleRate <= 0
              ) {
                resetNickWorker(worker);
                return;
              }
              finish(data);
            };
          }
          const worker = nickWorker;
          const id = ++nickRequest;
          const timer = setTimeout(() => resetNickWorker(worker), nickTimeout);
          nickPending.set(id, (result) => {
            clearTimeout(timer);
            nickPending.delete(id);
            resolve(result);
          });
          worker.postMessage({ id, name });
        } catch {
          if (nickWorker) resetNickWorker(nickWorker);
          resolve(null);
        }
      });
    }

    async function generateNick(name, key) {
      setNickStatus("loading");
      for (let attempt = 0; attempt <= nickRetryDelays.length; attempt++) {
        if (attempt) {
          await new Promise((resolve) =>
            setTimeout(resolve, nickRetryDelays[attempt - 1]),
          );
        }
        const result = await requestNick(name);
        if (result) {
          if (nickCache.size >= 32) nickCache.delete(nickCache.keys().next().value);
          // Cache successful speech only. Errors must remain retryable.
          nickCache.set(key, result);
          nickRetryAfter.delete(key);
          setNickStatus("ready");
          return result;
        }
      }
      if (nickRetryAfter.size >= 32)
        nickRetryAfter.delete(nickRetryAfter.keys().next().value);
      nickRetryAfter.set(key, Date.now() + nickCooldown);
      setNickStatus("error");
      return null;
    }

    function getNick(name) {
      const key = nameKey(name);
      if (!key || !Context) return Promise.resolve(null);
      if (nickCache.has(key)) return Promise.resolve(nickCache.get(key));
      if (nickInFlight.has(key)) return nickInFlight.get(key);
      if (Date.now() < (nickRetryAfter.get(key) || 0)) return Promise.resolve(null);
      // Serialize generation so a failed worker does not cancel other names.
      const pending = nickQueue
        .then(() => generateNick(name, key))
        .finally(() => {
          nickInFlight.delete(key);
          reportNickStatus();
        });
      nickInFlight.set(key, pending);
      nickQueue = pending.catch(() => null);
      return pending;
    }

    function reportNickStatus() {
      const next = nickInFlight.size || bankStatus === "loading"
        ? "loading"
        : generationStatus === "error" || bankStatus === "error"
          ? "error"
          : generationStatus === "ready" || bankStatus === "ready" ? "ready" : "idle";
      if (nickStatus === next) return;
      nickStatus = next;
      listeners.forEach((callback) => callback());
    }

    function setNickStatus(value) {
      generationStatus = value;
      reportNickStatus();
    }

    function setBankStatus(value) {
      bankStatus = value;
      reportNickStatus();
    }

    function prepareNames(names) {
      if (!settings.enabled || !settings.voice || !settings.voiceVolume) return;
      if (names.some((name) => nicknameTokens(name)?.some((part) => part.media === "nicknames")))
        loadAudio("nicknames");
      // Only unknown names use the generator. Nothing here is awaited by gameplay.
      names.filter((name) => name && !nicknameTokens(name)).forEach((name) => {
        getNick(name).catch(() => null);
      });
    }

    function generatedNicknameParts(name) {
      const clip = nickCache.get(nameKey(name));
      if (!clip || !context) return null;
      if (!clip.buffer) {
        clip.buffer = context.createBuffer(1, clip.samples.length, clip.sampleRate);
        clip.buffer.copyToChannel(clip.samples, 0);
      }
      return [{ buffer: clip.buffer, clip: [0, clip.buffer.duration] }];
    }

    // Compatibility with cached game scripts: preparation never blocks a match.
    function prepareGameNames(names) {
      prepareNames(names);
      return Promise.resolve(true);
    }

    function waitBriefly(promise, milliseconds) {
      return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), milliseconds);
        Promise.resolve(promise).then(() => {
          clearTimeout(timer);
          resolve(true);
        }, () => {
          clearTimeout(timer);
          resolve(false);
        });
      });
    }

    const fallbackMusic =
      typeof Audio === "function" ? new Audio(media.music) : null;
    if (fallbackMusic) {
      fallbackMusic.loop = true;
      fallbackMusic.preload = "none";
    }

    function loadAudio(keyName) {
      if (!context || buffers[keyName]) return Promise.resolve(buffers[keyName]);
      if (loads[keyName]) return loads[keyName];
      if (keyName === "nicknames") setBankStatus("loading");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      loads[keyName] = fetch(media[keyName], { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw Error("Audio HTTP " + response.status);
          return response.arrayBuffer();
        })
        .then((bytes) => context.decodeAudioData(bytes))
        .then((buffer) => {
          buffers[keyName] = buffer;
          if (keyName === "nicknames") setBankStatus("ready");
          if (keyName === "music") refreshMusic();
          else {
            listeners.forEach((callback) => callback());
            flushPending();
          }
        })
        .catch(() => {
          if (keyName === "nicknames") setBankStatus("error");
        })
        .finally(() => {
          clearTimeout(timeout);
          delete loads[keyName];
        });
      return loads[keyName];
    }

    function flushPending() {
      if (context?.state !== "running" || document.hidden) return;
      if (pendingCue) {
        const cue = pendingCue;
        pendingCue = null;
        if (performance.now() - cue.at < 700) sfx(cue.kind);
      }
      if (pendingVoice && buffers.host) {
        const next = pendingVoice;
        pendingVoice = null;
        if (performance.now() - next.at < 2800)
          announce(next.event, next.details);
      }
    }

    function set(keyName, value) {
      settings[keyName] = value;
      try {
        localStorage.setItem(key, JSON.stringify(settings));
      } catch {}
      applyMix();
      if (
        !settings.enabled ||
        !settings.voice ||
        settings.voiceVolume === 0 ||
        keyName === "voiceVolume"
      )
        stopVoice();
      if (settings.enabled && settings.music) loadAudio("music");
      if (settings.enabled && settings.voice) loadAudio("host");
      refreshMusic();
    }

    function applyMix() {
      if (!context) return;
      const now = context.currentTime;
      master.gain.setTargetAtTime(settings.enabled ? 0.84 : 0, now, 0.012);
      host.gain.setTargetAtTime(settings.voiceVolume, now, 0.02);
      effects.gain.setTargetAtTime(settings.effects, now, 0.012);
      music.gain.setTargetAtTime(
        settings.enabled && settings.music
          ? settings.musicVolume * (activeVoice.size ? 0.42 : 0.76)
          : 0,
        now,
        0.02,
      );
    }

    function startFallbackMusic() {
      if (
        !fallbackMusic ||
        !settings.enabled ||
        !settings.music ||
        !settings.musicVolume ||
        document.hidden
      )
        return;
      fallbackMusic.volume = Math.min(0.7, settings.musicVolume);
      fallbackMusic.play().catch(() => {});
    }

    function unlock() {
      if (!settings.enabled || document.hidden) return;
      if (!unlocked && navigator.audioSession) {
        try {
          navigator.audioSession.type = "playback";
        } catch {}
      }
      unlocked = true;
      if (!Context) {
        startFallbackMusic();
        return;
      }
      try {
        if (!context) {
          context = new Context();
          master = context.createGain();
          effects = context.createGain();
          music = context.createGain();
          host = context.createGain();
          effects.connect(master);
          music.connect(master);
          host.connect(master);
          master.connect(context.destination);
          applyMix();
          context.addEventListener("statechange", () => {
            if (context.state !== "running" && finishRecorded) stopVoice();
            refreshMusic();
            flushPending();
          });
        }
        if (context.state === "interrupted") startFallbackMusic();
        if (context.state !== "running")
          context
            .resume()
            .then(() => {
              refreshMusic();
              flushPending();
            })
            .catch(() => {});
        if (settings.voice) loadAudio("host");
        if (settings.music) loadAudio("music");
        refreshMusic();
      } catch {
        startFallbackMusic();
      }
    }

    function playTone(frequency, duration, wave, volume, when, bus) {
      const oscillator = context.createOscillator(),
        envelope = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, when);
      envelope.gain.setValueAtTime(0.0001, when);
      envelope.gain.exponentialRampToValueAtTime(volume, when + 0.009);
      envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      oscillator.connect(envelope);
      envelope.connect(bus);
      if (bus === effects) {
        if (activeEffects.size >= 12) {
          const oldest = activeEffects.values().next().value;
          oldest.stop();
          activeEffects.delete(oldest);
        }
        activeEffects.add(oscillator);
      }
      oscillator.onended = () => {
        activeEffects.delete(oscillator);
        oscillator.disconnect();
        envelope.disconnect();
      };
      oscillator.start(when);
      oscillator.stop(when + duration + 0.008);
    }

    function sfx(kind) {
      if (!context || !settings.enabled || !settings.effects || document.hidden)
        return;
      const cue = cues[kind];
      if (!cue) return;
      if (context.state !== "running") {
        pendingCue = { kind, at: performance.now() };
        return;
      }
      const now = context.currentTime + 0.01;
      for (const [frequency, duration, delay = 0] of cue) {
        playTone(
          frequency,
          duration,
          kind === "wheel" || kind === "tick" ? "sine" : "triangle",
          0.2,
          now + delay,
          effects,
        );
      }
    }

    function refreshMusic() {
      const enabled =
        settings.enabled &&
        settings.music &&
        settings.musicVolume > 0 &&
        !document.hidden;
      if (!enabled || context?.state === "running") fallbackMusic?.pause();
      const ready = enabled && context?.state === "running" && buffers.music;
      if (!ready && musicSource) {
        musicSource.stop();
        musicSource = null;
      }
      if (ready && !musicSource) {
        musicSource = context.createBufferSource();
        musicSource.buffer = buffers.music;
        musicSource.loop = true;
        musicSource.connect(music);
        musicSource.start();
      }
    }

    function stopVoice() {
      pendingVoice = null;
      voiceToken++;
      clearTimeout(voiceDeadline);
      voiceDeadline = null;
      const finish = finishRecorded;
      finishRecorded = null;
      finish?.(false);
      const sources = Array.from(activeVoice);
      activeVoice.clear();
      for (const source of sources) { try { source.stop(); } catch {} }
      applyMix();
    }

    function playVoice(buffer, when, offset, duration, after) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(host);
      source.onended = () => {
        source.disconnect();
        if (activeVoice.delete(source) && !activeVoice.size) {
          applyMix();
          after?.();
        }
      };
      activeVoice.add(source);
      source.start(when, offset, duration);
    }

    async function announce(event, details) {
      if (!settings.enabled || !settings.voice || !settings.voiceVolume || document.hidden)
        return false;
      stopVoice();
      unlock();
      const token = voiceToken;
      const { ids, names } = voiceSequence(event, details, lastPhrase[event]);
      lastPhrase[event] = ids[0];
      prepareNames(names);
      const nicknameParts = names.map(nicknameTokens);
      const needed = [loadAudio("host")];
      if (nicknameParts.some((parts) => parts?.some((part) => part.media === "nicknames")))
        needed.push(loadAudio("nicknames"));
      // Only speech waits briefly for small recordings. Gameplay never waits.
      await waitBriefly(Promise.all(needed), 1500);
      if (token !== voiceToken || document.hidden || context?.state !== "running" || !buffers.host)
        return false;
      const parts = ids.map((id) => ({ media: "host", clip: clips[id] }));
      names.forEach((name, index) => {
        const nickname = nicknameParts[index] || generatedNicknameParts(name);
        if (!nickname || nickname.some((part) => !part.buffer && !buffers[part.media])) return;
        parts.push(...nickname);
      });
      return new Promise((resolve) => {
        finishRecorded = resolve;
        let when = context.currentTime + 0.025;
        let duration = 0;
        parts.forEach((part, index) => {
          const [offset, length] = part.clip;
          playVoice(part.buffer || buffers[part.media], when, offset, length,
            index === parts.length - 1 ? () => {
              if (token !== voiceToken) return;
              clearTimeout(voiceDeadline);
              voiceDeadline = null;
              finishRecorded = null;
              resolve(true);
            } : null);
          when += length + 0.045;
          duration += length + 0.045;
        });
        voiceDeadline = setTimeout(() => {
          if (token === voiceToken) stopVoice();
        }, duration * 1000 + 2000);
        applyMix();
      });
    }

    function pause() {
      stopVoice();
      pendingCue = null;
      fallbackMusic?.pause();
      if (musicSource) {
        musicSource.stop();
        musicSource = null;
      }
      if (context?.state === "running") context.suspend().catch(() => {});
    }

    function resume() {
      if (unlocked && settings.enabled) unlock();
    }

    return {
      settings,
      set,
      unlock,
      sfx,
      announce,
      stopVoice,
      pause,
      resume,
      prepareNames,
      prepareGameNames,
      nicknameSupported: (name) => Boolean(nicknameTokens(name) || nickCache.has(nameKey(name))),
      isSpeaking: () => Boolean(finishRecorded),
      voiceError: () => voiceError,
      usesDeviceVoice: () => false,
      nickStatus: () => nickStatus,
      hasVoice: () => Boolean(buffers.host),
      onVoicesChanged: (callback) => listeners.add(callback),
    };
  }

  return { create };
})();
