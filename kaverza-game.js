"use strict";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const { order, data, resolveCard, assignPlayers, renderCardText } =
  KaverzaCards;
const avatars = ["😎", "🦊", "🐼", "🐸", "🐯", "🐙", "🐺", "🦄", "🐲", "👽"];
const PALETTE = [
  "#f36ac8",
  "#9873ff",
  "#ff786e",
  "#5ad7ff",
  "#52e6b5",
  "#ffd575",
];

const SAVE_KEY = "kaverza-party-v5";
const LEGACY_KEY = "kaverza-party-v4";

const state = {
  players: [],
  rounds: 10,
  turn: 0,
  taken: 0,
  max: 0,
  enabled: [],
  used: {},
  category: null,
  task: null,
  angle: 0,
  spinning: false,
  active: false,
  started: false,
  spinToken: 0,
  spinTimeout: null,
  spinEffects: [],
  timerId: null,
  deadline: 0,
  timeLimit: 60,
  lastTimerSecond: null,
  phase: "setup",
  recipient: "",
  motion: readFlag("kaverza-motion", true),
  sound: readFlag("kaverza-sound", true),
  recentTopics: [],
  recentSizes: [],
  cast: [],
  castHistory: [],
};

let toastId = null,
  confettiFrame = null,
  lastKeyboardActivation = 0;
const audio = KaverzaAudio.create({ enabled: state.sound });
const sfx = audio.sfx;
const voice = audio.announce;

function readFlag(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val === null ? fallback : val === "true";
  } catch {
    return fallback;
  }
}

function saveFlag(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function reduceMotion() {
  return !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function canAnimate() {
  return state.motion && !reduceMotion();
}

function refreshSettings() {
  $("#soundToggle").textContent = state.sound
    ? "🔊 Звук: вкл."
    : "🔇 Звук: выкл.";

  $("#soundToggle").setAttribute("aria-pressed", String(state.sound));

  $("#motionToggle").textContent = state.motion
    ? "✨ Эффекты: вкл."
    : "✨ Эффекты: выкл.";

  $("#motionToggle").setAttribute("aria-pressed", String(state.motion));
  document.body.classList.toggle("no-motion", !canAnimate());
  if (!canAnimate()) {
    if (confettiFrame) cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
    const canvas = $("#confettiCanvas"),
      ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (navigator.vibrate) navigator.vibrate(0);
  }
}

function note(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toastId);
  toastId = setTimeout(() => el.classList.add("hidden"), 2600);
}

function random(count) {
  if (count <= 1) return 0;
  if (window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint32Array(1),
      max = Math.floor(4294967296 / count) * count;
    do {
      window.crypto.getRandomValues(buffer);
    } while (buffer[0] >= max);
    return buffer[0] % count;
  }
  return Math.floor(Math.random() * count);
}

function buzz(milliseconds = 15) {
  if (canAnimate() && navigator.vibrate) {
    try {
      navigator.vibrate(milliseconds);
    } catch {}
  }
}

function confetti(seconds = 2.7) {
  if (!canAnimate()) return;
  const canvas = $("#confettiCanvas"),
    context = canvas.getContext("2d");
  if (!context) return;
  if (confettiFrame) cancelAnimationFrame(confettiFrame);
  const width = window.innerWidth,
    height = window.innerHeight,
    ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const colors = ["#ff5aab", "#a78bfa", "#64e8c1", "#ffdf83", "#fff"],
    pieces = Array.from(
      {
        length: Math.min(150, Math.max(55, Math.floor(width / 7))),
      },
      () => ({
        x: Math.random() * width,
        y: -Math.random() * height * 0.7,
        w: 3 + Math.random() * 5,
        h: 5 + Math.random() * 7,
        speed: 1.8 + Math.random() * 4,
        rotation: Math.random() * 6,
        offset: Math.random() * 6,
        color: colors[random(colors.length)],
      }),
    );
  const end = performance.now() + seconds * 1000;
  function frame(time) {
    context.clearRect(0, 0, width, height);
    for (const piece of pieces) {
      piece.y += piece.speed;
      piece.x += Math.sin(time / 350 + piece.offset) * 0.6;
      piece.rotation += 0.05;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      context.restore();
    }
    if (time < end) {
      confettiFrame = requestAnimationFrame(frame);
    } else {
      context.clearRect(0, 0, width, height);
      confettiFrame = null;
    }
  }
  confettiFrame = requestAnimationFrame(frame);
}

function renderInputs(names) {
  const container = $("#playerInputs");
  container.replaceChildren();
  names.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "player-row";
    const number = document.createElement("span");
    number.className = "num";
    number.textContent = index + 1;
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 24;
    input.autocomplete = "off";
    input.value = name;
    input.placeholder = "Игрок " + (index + 1);
    input.setAttribute("aria-label", "Имя игрока " + (index + 1));
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.disabled = names.length <= 2;
    remove.setAttribute("aria-label", "Удалить игрока " + (index + 1));
    remove.addEventListener("click", () => {
      const current = $$("#playerInputs input").map((el) => el.value);
      renderInputs(current.filter((_, i) => i !== index));
      const remaining = $$("#playerInputs input");
      remaining[Math.min(index, remaining.length - 1)].focus();
    });
    row.append(number, input, remove);
    container.append(row);
  });
  $("#addPlayer").disabled = names.length >= 10;
}

function stopAsync() {
  clearInterval(state.timerId);
  clearTimeout(state.spinTimeout);
  state.spinEffects.forEach(clearTimeout);
  state.spinEffects = [];
  audio.stopVoice();
  state.timerId = null;
  state.spinTimeout = null;
  state.spinToken++;
  state.spinning = false;
  state.active = false;
}

function buildWheel() {
  const wheel = $("#wheel");
  wheel.querySelectorAll(".wheel-label").forEach((el) => el.remove());
  const keys = state.enabled.length ? state.enabled : order,
    n = keys.length,
    step = 360 / n;
  wheel.style.background =
    "conic-gradient(from " +
    -step / 2 +
    "deg, " +
    keys
      .map((key, i) => {
        const color = PALETTE[order.indexOf(key)];
        return (
          color +
          " " +
          i * step +
          "deg " +
          ((i + 1) * step - 0.75) +
          "deg, #140c29 " +
          ((i + 1) * step - 0.75) +
          "deg " +
          (i + 1) * step +
          "deg"
        );
      })
      .join(", ") +
    ")";
  keys.forEach((key, index) => {
    const label = document.createElement("span");
    label.className = "wheel-label";
    label.dataset.key = key;
    label.style.setProperty("--a", index * step + "deg");
    label.textContent = data[key].emoji + " " + data[key].name;
    wheel.append(label);
  });
}

function taskPool(key) {
  return data[key].cards.filter((card) => card.players <= state.players.length);
}

function categoryRemaining(key) {
  return taskPool(key).filter((card) => !state.used[key]?.has(card.id)).length;
}

function remainingCount() {
  return state.enabled.reduce((sum, key) => sum + categoryRemaining(key), 0);
}

function chooseTask(key) {
  const used = state.used[key] || new Set();
  const available = taskPool(key).filter((card) => !used.has(card.id));
  if (!available.length) return null;
  const fresh = available.filter(
    (card) => !card.tag || !state.recentTopics.includes(card.tag),
  );
  let candidates = fresh.length ? fresh : available;
  const lastSize = state.recentSizes[state.recentSizes.length - 1];
  const alternating = candidates.filter(
    (card) => (card.company ? "company" : card.players) !== lastSize,
  );
  if (
    alternating.length &&
    state.recentSizes.filter((size) => size === lastSize).length >= 2
  )
    candidates = alternating;
  const card = candidates[random(candidates.length)];
  used.add(card.id);
  state.used[key] = used;
  state.recentTopics = [...state.recentTopics, card.tag].slice(-4);
  state.recentSizes = [
    ...state.recentSizes,
    card.company ? "company" : card.players,
  ].slice(-4);
  state.cast = assignPlayers(
    state.players.length,
    state.turn,
    card.players,
    state.castHistory,
    random,
  );
  if (state.cast.length)
    state.castHistory = [...state.castHistory, state.cast].slice(-8);
  return card;
}

function scoreRows(selector, players, gains = []) {
  const container = $(selector);
  container.replaceChildren();
  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "score-row";
    const avatar = document.createElement("span");
    avatar.textContent = player.avatar;
    avatar.style.fontSize = "24px";
    const name = document.createElement("span");
    name.className = "score-name";
    name.textContent = index + 1 + ". " + player.name;
    const score = document.createElement("span");
    score.className = "score-value";
    score.textContent = player.score + " ★";
    const gain = gains[state.players.indexOf(player)] || 0;
    if (gain > 0) {
      row.classList.add("scored");
      const delta = document.createElement("small");
      delta.className = "score-gain";
      delta.textContent = "+" + gain;
      score.append(delta);
    }
    row.append(avatar, name, score);
    container.append(row);
  });
}

function updateGame(gains = []) {
  const player = state.players[state.turn];
  if (!player) return;
  $("#avatar").textContent = player.avatar;
  $("#playerName").textContent = player.name;
  $("#progress").textContent =
    "Ход " + Math.min(state.taken + 1, state.max) + " / " + state.max;
  $("#currentScore").textContent = player.score + " ★";
  $("#turnInfo").textContent =
    "Раунд " + Math.min(player.turns + 1, state.rounds) + " / " + state.rounds;
  $("#remainingBank").textContent = "🎲 До нового круга: " + remainingCount();
  scoreRows(
    "#scores",
    state.players.slice().sort((a, b) => b.score - a.score),
    gains,
  );
}

function scrollTopNow() {
  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  } catch {
    window.scrollTo(0, 0);
  }
}

function focusWithoutScroll(element) {
  try {
    element.focus({
      preventScroll: true,
    });
  } catch {
    element.focus();
  }
}

function saveGame() {
  try {
    const {
      phase,
      players,
      rounds,
      turn,
      taken,
      max,
      enabled,
      category,
      task,
      angle,
      deadline,
      timeLimit,
      recipient,
      recentTopics,
      recentSizes,
      cast,
      castHistory,
    } = state;
    const used = Object.fromEntries(
      Object.entries(state.used).map(([key, set]) => [key, [...set]]),
    );
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 5,
        phase,
        players,
        rounds,
        turn,
        taken,
        max,
        enabled,
        used,
        category,
        task: task?.id || null,
        angle,
        deadline,
        timeLimit,
        recipient,
        recentTopics,
        recentSizes,
        cast,
        castHistory,
      }),
    );
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

function clearSavedGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

function prepareTurn(gains = []) {
  state.cast = [];
  state.deadline = 0;
  $("#wheel")
    .querySelectorAll(".selected-sector")
    .forEach((label) => label.classList.remove("selected-sector"));
  $("#wheelPanel").classList.remove("wheel-result");
  state.phase = "turn";
  $("#challenge").classList.add("hidden");
  $("#wheelPanel").classList.remove("hidden");
  $("#spin").classList.remove("hidden");
  $("#spin").disabled = false;
  $("#spin").textContent = "КРУТИТЬ РУЛЕТКУ";
  updateGame(gains);
  saveGame();
  scrollTopNow();
  focusWithoutScroll($("#spin"));
}

function startGame() {
  const inputs = $$("#playerInputs input");
  if (inputs.length < 2 || inputs.length > 10) {
    note("Нужно от 2 до 10 игроков");
    return;
  }
  if (inputs.some((input) => !input.value.trim())) {
    note("Заполните имена всех игроков");
    return;
  }
  const names = inputs.map((el) => el.value.trim());
  if (
    new Set(names.map((s) => s.toLocaleLowerCase("ru"))).size !== names.length
  ) {
    note("Имена игроков должны отличаться");
    return;
  }
  const enabled = $$("#categoryChoices input:checked").map((el) => el.value);
  if (!enabled.length) {
    note("Выберите хотя бы одну категорию");
    return;
  }

  stopAsync();
  state.players = names.map((name, index) => ({
    name,
    avatar: avatars[index],
    score: 0,
    turns: 0,
  }));
  state.rounds = Number($("#rounds").value);
  state.turn = 0;
  state.taken = 0;
  state.max = state.players.length * state.rounds;
  state.enabled = enabled;
  state.used = {};
  state.category = null;
  state.task = null;
  state.recentTopics = [];
  state.recentSizes = [];
  state.castHistory = [];
  state.recipient = "";
  state.angle = 0;
  state.deadline = 0;
  state.timeLimit = 60;
  state.started = true;
  const wheel = $("#wheel");
  buildWheel();
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(0deg)";
  wheel.style.removeProperty("--label-turn");
  void wheel.offsetWidth;
  $("#setup").classList.add("hidden");
  $("#results").classList.add("hidden");
  $("#game").classList.remove("hidden");
  document.body.classList.add("playing");
  prepareTurn();
  sfx("start");
  voice("start", { player: state.players[0].name });
  note("Игра началась! 😈");
}

function spin() {
  if (
    !state.started ||
    state.phase !== "turn" ||
    state.spinning ||
    state.active
  )
    return;
  audio.unlock();
  audio.stopVoice();
  state.spinning = true;
  $("#spin").disabled = true;
  $("#spin").textContent = "ВРАЩАЕМ…";
  sfx("spin");
  buzz(25);
  if (remainingCount() === 0) {
    state.used = {};
    note("Все карточки пройдены — начинается новый круг");
  }
  const keys = state.enabled.filter((key) => categoryRemaining(key) > 0);
  const key = keys[random(keys.length)];
  const index = state.enabled.indexOf(key),
    step = 360 / state.enabled.length;
  const target = (360 - index * step) % 360,
    current = ((state.angle % 360) + 360) % 360,
    delta = (target - current + 360) % 360;
  state.angle = current + 1440 + delta;
  const wheel = $("#wheel"),
    animated = canAnimate();
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(" + current + "deg)";
  void wheel.offsetWidth;
  wheel.style.transition = animated
    ? "transform 2.45s cubic-bezier(.18,.7,.13,1)"
    : "none";
  wheel.style.transform = "rotate(" + state.angle + "deg)";
  const token = ++state.spinToken;
  if (animated) {
    [110, 210, 320, 460, 630, 850, 1110, 1420, 1790, 2170].forEach(
      (delay, i) => {
        state.spinEffects.push(
          setTimeout(() => sfx(i < 6 ? "wheel" : "slow"), delay),
        );
      },
    );
  }
  state.spinTimeout = setTimeout(
    () => {
      if (token !== state.spinToken || !state.started) return;
      wheel.style.setProperty("--label-turn", (state.angle % 360) + "deg");
      wheel
        .querySelector('[data-key="' + key + '"]')
        .classList.add("selected-sector");
      $("#wheelPanel").classList.add("wheel-result");
      sfx("stop");
      sfx("category");
      state.category = key;
      state.task = chooseTask(key);
      state.timeLimit = state.task.seconds || 60;
      state.deadline = Date.now() + state.timeLimit * 1000;
      state.phase = "challenge";
      saveGame();
      state.spinTimeout = setTimeout(
        () => {
          if (token !== state.spinToken || !state.started) return;
          state.spinTimeout = null;
          state.spinEffects = [];
          state.spinning = false;
          showChallenge(false);
        },
        animated ? 430 : 0,
      );
    },
    animated ? 2470 : 20,
  );
}

function showChallenge(resume) {
  const category = data[state.category],
    task = state.task;
  $("#wheelPanel").classList.add("hidden");
  $("#spin").classList.add("hidden");
  $("#challenge").classList.remove("hidden");
  const challenge = $("#challenge");
  challenge.style.setProperty(
    "--accent",
    PALETTE[order.indexOf(state.category)],
  );
  $("#badge").textContent = category.emoji + " " + category.name;
  const cast = $("#cast");
  cast.replaceChildren();
  [state.turn, ...state.cast].forEach((index, i) => {
    const player = state.players[index];
    const chip = document.createElement("span");
    chip.className = "cast-chip";
    const label = document.createElement("small");
    label.textContent = ["ХОДИТ", "НАПАРНИК", "ТРЕТИЙ ИГРОК"][i];
    const name = document.createElement("b");
    name.textContent = player.avatar + " " + player.name;
    chip.append(label, name);
    cast.append(chip);
  });
  if (task.company) {
    const chip = document.createElement("span");
    chip.className = "cast-chip company-chip";
    chip.textContent = "🗳 Решает компания";
    cast.append(chip);
  }
  $("#task").textContent = renderCardText(
    task,
    state.players,
    state.turn,
    state.cast,
  );
  $("#taskMeta").textContent =
    state.category === "bonus"
      ? "+" +
        task.points +
        " ★ " +
        {
          self: "активному игроку",
          all: "каждому",
          choose: "выбранному игроку",
          partner: "обоим",
        }[task.effect]
      : "+" + category.points + " ★ за выполнение";
  $("#remainingBank").textContent = "🎲 До нового круга: " + remainingCount();
  const hasAnswer = typeof task === "object" && Boolean(task.answer);
  $("#answerBtn").classList.toggle("hidden", !hasAnswer);
  $("#answerBtn").textContent = "🧠 Показать ответ";
  $("#answerBtn").setAttribute("aria-expanded", "false");
  $("#answerBox").textContent = hasAnswer ? task.answer : "";
  $("#answerBox").classList.add("hidden");
  const needsPartner =
    state.category === "bonus" &&
    typeof task === "object" &&
    (task.effect === "choose" || task.effect === "partner");
  $("#partnerSelect").classList.toggle("hidden", !needsPartner);
  const select = $("#bonusRecipient");
  select.replaceChildren();
  if (needsPartner) {
    state.players.forEach((player, index) => {
      if (index === state.turn) return;
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = player.name;
      select.append(option);
    });
    if (
      state.recipient &&
      Array.from(select.options).some((o) => o.value === state.recipient)
    )
      select.value = state.recipient;
    state.recipient = select.value;
  } else state.recipient = "";
  $("#done").disabled = false;
  $("#skip").disabled = false;
  state.active = true;
  state.phase = "challenge";
  state.lastTimerSecond = null;
  if (!resume) {
    state.deadline = Date.now() + state.timeLimit * 1000;
    sfx("reveal");
    sfx("timer");
    voice("card", {
      player: state.players[state.turn].name,
      category: category.name.toLowerCase(),
      cast: state.cast.map((i) => state.players[i].name),
    });
  }
  clearInterval(state.timerId);
  tick();
  if (state.active) state.timerId = setInterval(tick, 200);
  saveGame();
  scrollTopNow();
  if (!resume && state.active) focusWithoutScroll($("#task"));
}

function tick() {
  if (!state.active) return;
  const remaining = Math.max(0, state.deadline - Date.now()),
    seconds = Math.ceil(remaining / 1000);
  if (seconds !== state.lastTimerSecond) {
    if (
      seconds > 0 &&
      seconds <= 5 &&
      state.lastTimerSecond !== null &&
      !document.hidden
    )
      sfx("tick");
    state.lastTimerSecond = seconds;
    $("#timer").textContent = seconds;
  }
  $("#timer").classList.toggle("warning", seconds <= 10);
  $("#fill").style.width =
    Math.min(100, remaining / (state.timeLimit * 10)) + "%";
  $("#fill").style.background = seconds <= 10 ? "var(--red)" : "var(--mint)";
  if (remaining === 0) finishTurn(false, true);
}

function bonusEffect(task) {
  const player = state.players[state.turn];
  if (task.effect === "all") {
    state.players.forEach((item) => (item.score += task.points));
    return "Всем игрокам +" + task.points + " ★";
  }
  if (task.effect === "choose" || task.effect === "partner") {
    const val = $("#bonusRecipient").value;
    if (val === "") return "Бонус не начислен: игрок не выбран";
    const index = Number(val),
      chosen = state.players[index];
    if (!Number.isInteger(index) || !chosen || index === state.turn)
      return "Бонус не начислен: выберите другого игрока";
    chosen.score += task.points;
    if (task.effect === "partner") {
      player.score += task.points;
      return player.name + " и " + chosen.name + ": +" + task.points + " ★";
    }
    return chosen.name + ": +" + task.points + " ★";
  }
  player.score += task.points;
  return player.name + ": +" + task.points + " ★";
}

function finishTurn(completed, timedOut = false) {
  if (!state.active) return;
  if (Date.now() >= state.deadline) {
    completed = false;
    timedOut = true;
  }
  clearInterval(state.timerId);
  state.timerId = null;
  state.active = false;
  $("#done").disabled = true;
  $("#skip").disabled = true;
  const player = state.players[state.turn];
  let message;
  const before = state.players.map((p) => p.score);
  audio.stopVoice();
  if (completed) {
    if (state.category === "bonus") message = bonusEffect(state.task);
    else {
      const points = data[state.category].points;
      player.score += points;
      message = player.name + ": +" + points + " ★";
    }
    sfx("success");
    if (state.players.some((p, i) => p.score > before[i])) sfx("score");
    buzz();
  } else {
    message = timedOut ? "Время вышло — без штрафа" : "Пас принят — без штрафа";
    sfx(timedOut ? "timeout" : "skip");
  }
  player.turns++;
  state.taken++;
  const gains = state.players.map((p, i) => p.score - before[i]);
  if (state.taken >= state.max) {
    showResults(gains);
    note(message);
    return;
  }
  state.turn = (state.turn + 1) % state.players.length;
  const next = state.players[state.turn];
  const nextRound = state.turn === 0;
  state.task = null;
  state.category = null;
  state.recipient = "";
  prepareTurn(gains);
  if (!document.hidden) {
    if (nextRound) $("#turnDock").classList.add("new-round");
    else $("#turnDock").classList.remove("new-round");
    sfx(nextRound ? "round" : "next");
    voice(nextRound ? "round" : "turn", {
      player: next.name,
      round: next.turns + 1,
    });
  }
  note(message);
}

function renderResults(playEffects, gains = []) {
  stopAsync();
  state.started = false;
  state.phase = "results";
  document.body.classList.remove("playing");
  $("#game").classList.add("hidden");
  $("#setup").classList.add("hidden");
  $("#results").classList.remove("hidden");
  const sorted = state.players.slice().sort((a, b) => b.score - a.score),
    top = sorted.length ? sorted[0].score : 0,
    winners = sorted.filter((p) => p.score === top);
  $("#winner").textContent =
    winners.length > 1
      ? "🤝 Ничья: " + winners.map((p) => p.name).join(", ")
      : winners.length
        ? "👑 " + winners[0].name + " — победа!"
        : "Игра завершена";
  scoreRows("#finalScores", sorted, gains);
  saveGame();
  if (playEffects) {
    sfx("end");
    sfx("win");
    voice("end", { winners: winners.map((p) => p.name) });
    confetti();
  }
  scrollTopNow();
  if (playEffects) focusWithoutScroll($("#again"));
}

function showResults(gains = []) {
  renderResults(true, gains);
}

function backToSetup() {
  stopAsync();
  state.started = false;
  state.phase = "setup";
  document.body.classList.remove("playing");
  renderInputs(
    state.players.length
      ? state.players.map((p) => p.name)
      : ["Игрок 1", "Игрок 2"],
  );
  $("#rounds").value = String(state.rounds);
  refreshRounds();
  $$("#categoryChoices input").forEach(
    (el) =>
      (el.checked = state.enabled.length
        ? state.enabled.includes(el.value)
        : true),
  );
  $("#game").classList.add("hidden");
  $("#results").classList.add("hidden");
  $("#setup").classList.remove("hidden");
  clearSavedGame();
  scrollTopNow();
}

function restoreGame() {
  let saved;
  try {
    for (const [key, version] of [
      [SAVE_KEY, 5],
      [LEGACY_KEY, 4],
    ]) {
      try {
        const candidate = JSON.parse(localStorage.getItem(key));
        if (validSave(candidate, version)) {
          saved = candidate;
          break;
        }
      } catch {}
    }
  } catch {}
  if (!saved) return false;
  stopAsync();
  const { players, rounds, turn, taken, max, enabled, phase } = saved;
  Object.assign(state, {
    players,
    rounds,
    turn,
    taken,
    max,
    enabled,
    phase,
    started: phase !== "results",
  });
  state.angle = Number.isFinite(saved.angle) ? saved.angle % 360 : 0;
  state.deadline = Number.isFinite(saved.deadline) ? saved.deadline : 0;
  state.used = {};
  for (const [key, entries] of Object.entries(saved.used || {})) {
    if (!order.includes(key) || !Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (typeof entry !== "string") continue;
      const card = resolveCard(entry);
      if (!card) continue;
      (state.used[card.category] ??= new Set()).add(card.id);
    }
  }
  state.recentTopics = Array.isArray(saved.recentTopics)
    ? saved.recentTopics.slice(-4)
    : [];
  state.recentSizes = Array.isArray(saved.recentSizes)
    ? saved.recentSizes.slice(-4)
    : [];
  const validIndex = (i) => Number.isInteger(i) && i >= 0 && i < players.length;
  const validGroup = (group) =>
    Array.isArray(group) &&
    group.length <= 2 &&
    group.every(validIndex) &&
    new Set(group).size === group.length;
  state.castHistory = Array.isArray(saved.castHistory)
    ? saved.castHistory.filter(validGroup).slice(-8)
    : [];
  const card = resolveCard(saved.task);
  // A reclassified card can finish under its original sector and points.
  // Subsequent draws use the audited category. Missing cards leave this turn unplayed.
  const sameBonusRule =
    card && (card.category === "bonus") === (saved.category === "bonus");
  const usable =
    phase === "challenge" &&
    enabled.includes(saved.category) &&
    sameBonusRule &&
    card.players <= players.length &&
    state.deadline > 0;
  state.category = usable ? saved.category : null;
  state.task = usable ? card : null;
  state.timeLimit =
    usable &&
    saved.version === 5 &&
    Number.isInteger(saved.timeLimit) &&
    saved.timeLimit >= 5 &&
    saved.timeLimit <= 60
      ? saved.timeLimit
      : 60;
  state.recipient = usable ? String(saved.recipient ?? "") : "";
  state.cast =
    usable &&
    validGroup(saved.cast) &&
    saved.cast.length === card.players - 1 &&
    !saved.cast.includes(turn)
      ? saved.cast
      : usable
        ? assignPlayers(
            players.length,
            turn,
            card.players,
            state.castHistory,
            random,
          )
        : [];
  if (
    usable &&
    state.cast.length &&
    (!Array.isArray(saved.cast) ||
      saved.cast.some((id, i) => id !== state.cast[i]))
  ) {
    state.castHistory = [...state.castHistory, state.cast].slice(-8);
  }
  renderInputs(players.map((p) => p.name));
  $("#rounds").value = String(rounds);
  refreshRounds();
  $$("#categoryChoices input").forEach(
    (el) => (el.checked = enabled.includes(el.value)),
  );
  buildWheel();
  $("#wheel").style.transition = "none";
  $("#wheel").style.transform = "rotate(" + state.angle + "deg)";
  $("#wheel").style.setProperty("--label-turn", state.angle + "deg");
  if (phase === "results" || taken === max) {
    renderResults(false);
    return true;
  }
  $("#setup").classList.add("hidden");
  $("#results").classList.add("hidden");
  $("#game").classList.remove("hidden");
  document.body.classList.add("playing");
  if (usable) {
    updateGame();
    showChallenge(true);
  } else {
    prepareTurn();
    if (phase === "challenge") return "replay";
  }
  return true;
}

function validSave(saved, version) {
  if (
    !saved ||
    saved.version !== version ||
    !["turn", "challenge", "results"].includes(saved.phase)
  )
    return false;
  const { players, rounds, turn, taken, max, enabled } = saved;
  return (
    Array.isArray(players) &&
    players.length >= 2 &&
    players.length <= 10 &&
    [5, 7, 10, 15, 25].includes(rounds) &&
    max === players.length * rounds &&
    Number.isInteger(turn) &&
    turn >= 0 &&
    turn < players.length &&
    Number.isInteger(taken) &&
    taken >= 0 &&
    taken <= max &&
    Array.isArray(enabled) &&
    enabled.length > 0 &&
    enabled.every((key) => order.includes(key)) &&
    new Set(enabled).size === enabled.length &&
    players.every(
      (p) =>
        p &&
        typeof p.name === "string" &&
        p.name.length > 0 &&
        p.name.length <= 24 &&
        typeof p.avatar === "string" &&
        Number.isSafeInteger(p.score) &&
        p.score >= 0 &&
        p.score <= 10000 &&
        Number.isInteger(p.turns) &&
        p.turns >= 0 &&
        p.turns <= rounds,
    ) &&
    players.reduce((sum, p) => sum + p.turns, 0) === taken
  );
}

function showBankInfo() {
  const total = order.reduce((sum, key) => sum + data[key].cards.length, 0);
  $("#bankInfo").textContent =
    total.toLocaleString("ru-RU") + " КАРТОЧЕК  /  6 КАТЕГОРИЙ";
}

function refreshRounds() {
  $$("#roundOptions button").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.value === $("#rounds").value),
    );
  });
}

for (const option of $("#rounds").options) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = option.value;
  button.dataset.value = option.value;
  button.setAttribute("aria-label", option.textContent);
  button.addEventListener("click", () => {
    $("#rounds").value = option.value;
    refreshRounds();
  });
  $("#roundOptions").append(button);
}
refreshRounds();

for (const input of $$("#categoryChoices input")) {
  const key = input.value;
  input.parentElement.style.setProperty(
    "--accent",
    PALETTE[order.indexOf(key)],
  );
}

$("#addPlayer").addEventListener("click", () => {
  const names = $$("#playerInputs input").map((el) => el.value);
  if (names.length >= 10) return;
  renderInputs(names.concat(""));
  sfx("add");
  const inputs = $$("#playerInputs input");
  inputs[inputs.length - 1].focus();
});

$("#start").addEventListener("click", startGame);

$("#spin").addEventListener("click", spin);

$("#done").addEventListener("click", () => finishTurn(true));

$("#skip").addEventListener("click", () => finishTurn(false));

$("#endGame").addEventListener("click", () => {
  if (state.started && confirm("Закончить игру и показать результаты?"))
    showResults();
});

$("#again").addEventListener("click", () => {
  renderInputs(state.players.map((p) => p.name));
  startGame();
});

$("#changeSettings").addEventListener("click", backToSetup);

$("#answerBtn").addEventListener("click", () => {
  const hidden = $("#answerBox").classList.toggle("hidden");
  $("#answerBtn").textContent = hidden
    ? "🧠 Показать ответ"
    : "🙈 Скрыть ответ";
  $("#answerBtn").setAttribute("aria-expanded", String(!hidden));
});

$("#bonusRecipient").addEventListener("change", (event) => {
  state.recipient = event.target.value;
  saveGame();
});

$("#soundToggle").addEventListener("click", () => {
  state.sound = !state.sound;
  audio.set("enabled", state.sound);
  saveFlag("kaverza-sound", state.sound);
  refreshSettings();
  if (state.sound) sfx("click");
});

$("#motionToggle").addEventListener("click", () => {
  state.motion = !state.motion;
  saveFlag("kaverza-motion", state.motion);
  refreshSettings();
  note(state.motion ? "Эффекты включены" : "Эффекты отключены");
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (
    button &&
    ![
      "soundToggle",
      "spin",
      "done",
      "skip",
      "start",
      "again",
      "endGame",
      "addPlayer",
    ].includes(button.id)
  )
    sfx("click");
});

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const button = event.target.closest("button");
    if (!button) return;
    if (event.repeat) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const now = Date.now();
    if (now - lastKeyboardActivation < 250) {
      event.preventDefault();
      return;
    }
    lastKeyboardActivation = now;
  },
  true,
);

document.addEventListener("click", audio.unlock, true);
const settingsMenu = $(".settings");
document.addEventListener("click", (event) => {
  if (settingsMenu.open && !settingsMenu.contains(event.target))
    settingsMenu.open = false;
});
settingsMenu.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    settingsMenu.open = false;
    settingsMenu.querySelector("summary").focus();
  }
});
window.addEventListener("pagehide", audio.pause);
const soundSettings = {
  effectVolume: ["effects", false],
  musicToggle: ["music", true],
  musicVolume: ["musicVolume", false],
  voiceToggle: ["voice", true],
  voiceVolume: ["voiceVolume", false],
};
function updateVoiceStatus() {
  $("#voiceStatus").textContent = audio.hasVoice()
    ? "Русский голос устройства доступен"
    : "Русский голос устройства пока недоступен";
}
Object.entries(soundSettings).forEach(([id, [key, checkbox]]) => {
  const input = $("#" + id);
  if (checkbox) input.checked = audio.settings[key];
  else input.value = String(Math.round(audio.settings[key] * 100));
  input.addEventListener("input", () => {
    audio.set(key, checkbox ? input.checked : Number(input.value) / 100);
    if (key === "effects" && input.value > 0) sfx("click");
  });
});
audio.onVoicesChanged(updateVoiceStatus);
updateVoiceStatus();

renderInputs(["Игрок 1", "Игрок 2"]);
refreshSettings();
showBankInfo();
buildWheel();
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.addEventListener) mq.addEventListener("change", refreshSettings);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio.pause();
  else {
    audio.resume();
    tick();
  }
});
window.addEventListener("pageshow", () => {
  audio.resume();
  tick();
});
const restored = restoreGame();
if (restored)
  note(
    restored === "replay"
      ? "Партия восстановлена. Крути рулетку для новой карточки."
      : "Предыдущая партия восстановлена 🎲",
  );
