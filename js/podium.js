function load() {
  return JSON.parse(localStorage.getItem("mcp_data")) || {pairs: [], categories: {cat1: "Klasy 4–5", cat2: "Klasy 6–7"}};
}

function calc(p) {
  let points = 0;
  let time = 0;
  (p.stations || []).forEach(s => {
    points += parseNumericValue(s.points, false);
    time += parseNumericValue(s.time, true);
  });
  return {points, time};
}

function getTop(cat) {
  const data = load();

  return data.pairs
    .filter(p => p.category === cat)
    .sort((a, b) => {
      const A = calc(a);
      const B = calc(b);
      if (A.points !== B.points) return B.points - A.points;
      if (A.time !== B.time) return A.time - B.time;
      return (a.name || "").localeCompare(b.name || "", "pl", {sensitivity: "base"});
    })
    .slice(0, 3);
}

function getCategoryName(cat) {
  const data = load();
  return data.categories?.[cat] || (cat === "cat1" ? "Klasy 4–5" : "Klasy 6–7");
}

function getPodiumHeight(pair, placeIndex) {
  const r = calc(pair);
  const rankBoost = placeIndex === 0 ? 170 : placeIndex === 1 ? 80 : 20;
  const scoreBoost = Math.max(0, r.points) * 6;

  const height = (rankBoost + scoreBoost + 140) * 2;
  return `${Math.max(320, Math.min(1040, height))}px`;
}

function renderPodium(containerId, categoryKey) {
  const el = document.getElementById(containerId);
  const list = getTop(categoryKey);
  const medals = ["🥇", "🥈", "🥉"];

  if (!list.length) {
    el.innerHTML = `<div class="empty-card">Brak par w kategorii ${getCategoryName(categoryKey)}.</div>`;
    return;
  }

  el.innerHTML = [0, 1, 2].map(i => {
    const pair = list[i];
    const placeClass = i === 0 ? "first" : i === 1 ? "second" : "third";

    if (!pair) {
      return `
        <article class="podium-column ${placeClass}">
          <div class="podium-riser" style="--podium-height:150px">
            <div class="empty-card">Wolne miejsce</div>
          </div>
        </article>
      `;
    }

    const r = calc(pair);
    const height = getPodiumHeight(pair, i);

    return `
      <article class="podium-column ${placeClass}">
        <div class="podium-riser" style="--podium-height:${height}">
          <div class="podium-card ${placeClass}" style="--podium-height:${height}">
            <span class="medal">${medals[i]}</span>
            <h3>${pair.name}</h3>
            <p class="score">${r.points} pkt</p>
            <p class="time">${formatTime(r.time)} s</p>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function update() {
  document.getElementById("category-title-1").textContent = getCategoryName("cat1");
  document.getElementById("category-title-2").textContent = getCategoryName("cat2");
  renderPodium("podium-1", "cat1");
  renderPodium("podium-2", "cat2");
}

setInterval(update, 1000);
update();