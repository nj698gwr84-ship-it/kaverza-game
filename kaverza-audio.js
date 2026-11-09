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
  const media = { host: "kaverza-host.mp3", music: "kaverza-party.mp3" };

  const nameKey = (name) =>
    name.trim().toLocaleLowerCase("ru-RU").normalize("NFC");
  const recordedName = (name) => Object.hasOwn(clips, "name:" + nameKey(name));

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
    const addName = (name) => {
      if (!name) return;
      const id =
        "name:" + name.trim().toLocaleLowerCase("ru-RU").normalize("NFC");
      if (Object.hasOwn(clips, id)) ids.push(id);
      else names.push(name);
    };
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
    let voiceToken = 0,
      nickWorker,
      nickStatus = "idle",
      nickRequest = 0;
    let unlocked = false;
    const activeEffects = new Set(),
      activeVoice = new Set();
    const listeners = new Set();
    const lastPhrase = {};
    const nickPending = new Map(),
      nickCache = new Map();
    function setNickStatus(value) {
      if (nickStatus === value) return;
      nickStatus = value;
      listeners.forEach((callback) => callback());
    }

    function getNick(name) {
      const key = nameKey(name);
      if (!key || !Context) return Promise.resolve(null);
      if (nickCache.has(key)) return nickCache.get(key);
      if (nickStatus === "error") return Promise.resolve(null);
      if (!nickWorker) {
        try {
          nickWorker = new Worker("kaverza-nick-worker.js?v=2.0.2");
        } catch {
          setNickStatus("error");
          return Promise.resolve(null);
        }
        setNickStatus("loading");
        const fail = () => {
          setNickStatus("error");
          for (const resolve of nickPending.values()) resolve(null);
          nickPending.clear();
          nickWorker.terminate();
          nickWorker = null;
        };
        nickWorker.onerror = fail;
        nickWorker.onmessage = ({ data }) => {
          if (data.error) {
            if (nickStatus === "loading") fail();
            else {
              nickPending.get(data.id)?.(null);
              nickPending.delete(data.id);
            }
            return;
          }
          setNickStatus("ready");
          nickPending.get(data.id)?.(data.samples ? data : null);
          nickPending.delete(data.id);
        };
      }
      const id = ++nickRequest;
      const pending = new Promise((resolve) => nickPending.set(id, resolve));
      if (nickCache.size >= 32) nickCache.delete(nickCache.keys().next().value);
      nickCache.set(key, pending);
      nickWorker.postMessage({ id, name });
      return pending;
    }

    function prepareNames(names) {
      if (!settings.enabled || !settings.voice || !settings.voiceVolume) return;
      names.filter((name) => name && !recordedName(name)).forEach(getNick);
    }

    const fallbackMusic =
      typeof Audio === "function" ? new Audio(media.music) : null;
    if (fallbackMusic) {
      fallbackMusic.loop = true;
      fallbackMusic.preload = "none";
    }

    function loadAudio(keyName) {
      if (!context || buffers[keyName] || loads[keyName]) return;
      loads[keyName] = fetch(media[keyName])
        .then((response) => {
          if (!response.ok) throw Error("Audio HTTP " + response.status);
          return response.arrayBuffer();
        })
        .then((bytes) => context.decodeAudioData(bytes))
        .then((buffer) => {
          buffers[keyName] = buffer;
          if (keyName === "music") refreshMusic();
          else {
            listeners.forEach((callback) => callback());
            flushPending();
          }
        })
        .catch(() => {})
        .finally(() => {
          delete loads[keyName];
        });
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
      for (const source of activeVoice) source.stop();
      activeVoice.clear();
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

    async function sayUnknownNames(names, token) {
      if (!names.length) return;
      const generated = await Promise.all(names.map(getNick));
      if (
        voiceToken !== token ||
        context?.state !== "running" ||
        document.hidden
      )
        return;
      let when = context.currentTime + 0.025;
      for (const clip of generated) {
        if (!clip) continue;
        const buffer = context.createBuffer(
          1,
          clip.samples.length,
          clip.sampleRate,
        );
        buffer.copyToChannel(clip.samples, 0);
        playVoice(buffer, when, 0, buffer.duration);
        when += buffer.duration + 0.08;
      }
      applyMix();
    }

    function announce(event, details) {
      if (
        !settings.enabled ||
        !settings.voice ||
        !settings.voiceVolume ||
        document.hidden ||
        !context
      )
        return;
      stopVoice();
      if (context.state !== "running" || !buffers.host) {
        pendingVoice = { event, details, at: performance.now() };
        loadAudio("host");
        return;
      }
      const { ids, names } = voiceSequence(event, details, lastPhrase[event]);
      lastPhrase[event] = ids[0];
      const token = voiceToken;
      prepareNames(names);
      let when = context.currentTime + 0.025;
      ids.forEach((id, index) => {
        const [offset, duration] = clips[id];
        const after =
          index === ids.length - 1 ? () => sayUnknownNames(names, token) : null;
        playVoice(buffers.host, when, offset, duration, after);
        when += duration;
      });
      applyMix();
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
      nickStatus: () => nickStatus,
      hasVoice: () => Boolean(buffers.host),
      onVoicesChanged: (callback) => listeners.add(callback),
    };
  }

  return { create };
})();
