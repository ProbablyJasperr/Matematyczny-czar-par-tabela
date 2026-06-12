function load() {
  return JSON.parse(localStorage.getItem("mcp_data")) || {pairs: [], categories: {cat1: "Klasy 4–5", cat2: "Klasy 6–7"}};
}

function calc(p) {
  let points = 0;
  let time = 0;
  (p.stations || []).forEach(s => {
    points += Number(s.points || 0);
    time += Number(s.time || 0);
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

function renderPodium(containerId, categoryKey) {
  const el = document.getElementById(containerId);
  const list = getTop(categoryKey);
  const medals = ["🥇", "🥈", "🥉"];
  const heights = ["170px", "140px", "110px"];

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
          <div class="podium-riser" style="--podium-height:${heights[i]}">
            <div class="empty-card">Wolne miejsce</div>
          </div>
        </article>
      `;
    }

    const r = calc(pair);

    return `
      <article class="podium-column ${placeClass}">
        <div class="podium-riser" style="--podium-height:${heights[i]}">
          <div class="podium-card ${placeClass}" style="--podium-height:${heights[i]}">
            <span class="medal">${medals[i]}</span>
            <h3>${pair.name}</h3>
            <p class="score">${r.points} pkt</p>
            <p class="time">${r.time} s</p>
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