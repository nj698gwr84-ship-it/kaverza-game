"use strict";

const KaverzaCards = (() => {
  const order = ["question", "action", "dare", "reveal", "twist", "bonus"];
  const names = [
    "ВОПРОС",
    "ДЕЙСТВИЕ",
    "ВЫЗОВ",
    "ОТКРОВЕНИЕ",
    "КАВЕРЗА",
    "БОНУС",
  ];
  const emojis = ["💬", "⚡", "🔥", "🤫", "🌀", "⭐"];
  const points = [1, 2, 3, 2, 3, 0];
  const byId = new Map(KaverzaBank.cards.map((card) => [card.id, card]));
  const legacy = new Map();
  for (const card of KaverzaBank.cards) legacy.set(card.text, card);
  for (const [text, id] of Object.entries(KaverzaBank.aliases)) {
    if (byId.has(id)) legacy.set(text, byId.get(id));
  }
  const data = Object.fromEntries(
    order.map((key, i) => [
      key,
      {
        name: names[i],
        emoji: emojis[i],
        points: points[i],
        cards: KaverzaBank.cards.filter((card) => card.category === key),
      },
    ]),
  );

  function resolveCard(value) {
    const id = typeof value === "object" && value ? value.id : value;
    const text = typeof value === "object" && value ? value.text : value;
    return byId.get(id) || legacy.get(text);
  }

  function assignPlayers(size, active, count, history, random) {
    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > size ||
      active < 0 ||
      active >= size
    )
      return [];
    const pool = Array.from({ length: size }, (_, i) => i).filter(
      (i) => i !== active,
    );
    const last = history[history.length - 1] || [];
    const selected = [];
    while (selected.length < count - 1) {
      let eligible = pool.filter((i) => !last.includes(i));
      if (!eligible.length) eligible = pool.slice();
      const frequency = (i) =>
        history.reduce((sum, past) => sum + Number(past.includes(i)), 0);
      const minimum = Math.min(...eligible.map(frequency));
      eligible = eligible.filter((i) => frequency(i) <= minimum + 1);
      const next = eligible[random(eligible.length)];
      selected.push(next);
      pool.splice(pool.indexOf(next), 1);
    }
    return selected;
  }

  function renderCardText(card, players, active, cast) {
    return card.text.replace(/\{player([123])\}/g, (_, n) => {
      const index = Number(n) === 1 ? active : cast[Number(n) - 2];
      return players[index].name;
    });
  }

  return { order, data, resolveCard, assignPlayers, renderCardText };
})();
if (typeof module !== "undefined") module.exports = KaverzaCards;
