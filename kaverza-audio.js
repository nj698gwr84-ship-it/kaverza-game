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
  const phrases = {
    start: [
      (d) => `Добро пожаловать в Каверзу! Первый ход. ${d.player}!`,
      (d) => `Вечеринка начинается! ${d.player}, открывай игру.`,
    ],
    turn: [
      (d) => `Твой ход, ${d.player}!`,
      (d) => `Рулетка ждёт. ${d.player}!`,
      (d) => `В центре внимания — ${d.player}.`,
    ],
    card: [
      (d) => `${d.player}, категория — ${d.category}.`,
      (d) => `Рулетка выбрала: ${d.category}. Твой выход, ${d.player}.`,
      (d) => `На очереди ${d.category}! ${d.player}, поехали.`,
    ],
    round: [
      (d) => `Раунд номер ${d.round}! Первый ход — ${d.player}.`,
      (d) => `Новый раунд, номер ${d.round}. Начинает ${d.player}.`,
    ],
    end: [
      (d) =>
        `Каверза закончилась! ${d.winners.length > 1 ? "Ничья. Победители" : "Победитель"}: ${d.winners.join(", ")}!`,
      (d) =>
        `Финальный счёт! ${d.winners.length > 1 ? "Ничья. Лидеры" : "Победу забирает"} ${d.winners.join(", ")}!`,
    ],
  };
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
      music: saved.music === true,
      musicVolume: volume(saved.musicVolume, 0.32),
      voice: saved.voice !== false,
      voiceVolume: volume(saved.voiceVolume, 0.82),
    };
    const synth = window.speechSynthesis;
    const Context = window.AudioContext || window.webkitAudioContext;
    let context,
      master,
      effects,
      music,
      musicTimer,
      musicStep = 0,
      nextBeat = 0,
      unlockCalled = false;
    let currentVoice = null;
    const activeEffects = new Set();
    const lastPhrase = {};
    const voices = () =>
      synth?.getVoices().filter((voice) => /^ru(?:[-_]|$)/i.test(voice.lang)) ||
      [];
    const voice = () =>
      voices().find((item) =>
        /pavel|dmitry|dmitri|milena male|yuri|alexandr|maksim|павел|дмитрий|юрий|александр|максим/i.test(
          item.name,
        ),
      ) ||
      voices().find((item) => item.localService) ||
      voices()[0];

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
      refreshMusic();
    }

    function applyMix() {
      if (!context) return;
      const now = context.currentTime;
      master.gain.setTargetAtTime(settings.enabled ? 0.65 : 0, now, 0.012);
      effects.gain.setTargetAtTime(settings.effects, now, 0.012);
      music.gain.setTargetAtTime(
        settings.enabled && settings.music ? settings.musicVolume : 0,
        now,
        0.02,
      );
    }

    function unlock() {
      if (!Context || !settings.enabled) return;
      try {
        if (!context) {
          context = new Context();
          master = context.createGain();
          effects = context.createGain();
          music = context.createGain();
          effects.connect(master);
          music.connect(master);
          master.connect(context.destination);
          applyMix();
        }
        unlockCalled = true;
        if (context.state !== "running")
          context
            .resume()
            .then(refreshMusic)
            .catch(() => {});
        else refreshMusic();
      } catch {}
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
      const now = context.currentTime + 0.01;
      for (const [frequency, duration, delay = 0] of cue) {
        playTone(
          frequency,
          duration,
          kind === "wheel" || kind === "tick" ? "sine" : "triangle",
          0.11,
          now + delay,
          effects,
        );
      }
    }

    function refreshMusic() {
      const shouldPlay =
        context?.state === "running" &&
        settings.enabled &&
        settings.music &&
        settings.musicVolume > 0 &&
        !document.hidden;
      if (!shouldPlay) {
        clearInterval(musicTimer);
        musicTimer = null;
        return;
      }
      if (musicTimer) return;
      nextBeat = context.currentTime + 0.04;
      const bass = [110, 110, 130.81, 146.83],
        melody = [440, 0, 523.25, 659.25, 392, 0, 587.33, 523.25];
      const schedule = () => {
        if (nextBeat < context.currentTime)
          nextBeat = context.currentTime + 0.03;
        while (nextBeat < context.currentTime + 0.17) {
          const note = melody[musicStep % melody.length];
          if (musicStep % 2 === 0)
            playTone(
              bass[Math.floor(musicStep / 8) % bass.length],
              0.2,
              "sine",
              0.065,
              nextBeat,
              music,
            );
          if (note) playTone(note, 0.18, "triangle", 0.03, nextBeat, music);
          musicStep++;
          nextBeat += 0.29;
        }
      };
      schedule();
      musicTimer = setInterval(schedule, 110);
    }

    function stopVoice() {
      if (currentVoice || synth?.speaking || synth?.pending) synth?.cancel();
      currentVoice = null;
    }

    function announce(event, details) {
      if (
        !settings.enabled ||
        !settings.voice ||
        !settings.voiceVolume ||
        document.hidden ||
        !window.SpeechSynthesisUtterance
      )
        return;
      const selected = voice();
      if (!selected) return;
      stopVoice();
      const list = phrases[event];
      const choices = list.filter((_, index) => index !== lastPhrase[event]);
      const phrase = choices[Math.floor(Math.random() * choices.length)];
      lastPhrase[event] = list.indexOf(phrase);
      const assignment = details.cast?.length
        ? ` ${details.cast.length > 1 ? "Напарники" : "Напарник"}: ${details.cast.join(", ")}.`
        : "";
      const utterance = new window.SpeechSynthesisUtterance(
        phrase(details) + assignment,
      );
      utterance.voice = selected;
      utterance.lang = "ru-RU";
      utterance.volume = settings.voiceVolume;
      utterance.rate = 1.06;
      utterance.pitch = 0.92;
      currentVoice = utterance;
      utterance.onend = utterance.onerror = () => {
        if (currentVoice === utterance) currentVoice = null;
      };
      try {
        synth.speak(utterance);
      } catch {
        currentVoice = null;
      }
    }

    function pause() {
      stopVoice();
      clearInterval(musicTimer);
      musicTimer = null;
      if (context?.state === "running") context.suspend().catch(() => {});
    }

    function resume() {
      if (unlockCalled && settings.enabled) unlock();
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
      hasVoice: () => Boolean(voice()),
      onVoicesChanged: (callback) =>
        synth?.addEventListener?.("voiceschanged", callback),
    };
  }

  return { create };
})();
