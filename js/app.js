let data = loadData();

function getCategoryLabel(key) {
  return data.categories?.[key] || (key === "cat1" ? "Klasy 4–5" : "Klasy 6–7");
}

function calc(pair) {
  let points = 0;
  let time = 0;

  (pair.stations || []).forEach(s => {
    points += Number(s.points || 0);
    time += Number(s.time || 0);
  });

  return {points, time};
}

function sortPairs(list) {
  return [...list].sort((a, b) => {
    const A = calc(a);
    const B = calc(b);

    if (A.points !== B.points) return B.points - A.points;
    if (A.time !== B.time) return A.time - B.time;
    return (a.name || "").localeCompare(b.name || "", "pl", {sensitivity: "base"});
  });
}

function renderBoard(list, categoryKey) {
  const sorted = sortPairs(list);

  if (!sorted.length) {
    return `<p class="empty-state">Brak par w kategorii ${getCategoryLabel(categoryKey)}.</p>`;
  }

  return sorted.map((p, i) => {
    const r = calc(p);
    return `
      <article class="leader-row">
        <div class="leader-main">
          <span class="rank-badge">#${i + 1}</span>
          <div>
            <strong>${p.name}</strong>
            <small>${getCategoryLabel(p.category)}</small>
          </div>
        </div>
        <div class="leader-stats">
          <span>${r.points} pkt</span>
          <span>${r.time} s</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderEditor() {
  const container = document.getElementById("pairs");

  if (!container) return;

  container.innerHTML = data.pairs.map(pair => {
    const r = calc(pair);
    return `
      <article class="pair-card">
        <div class="pair-card-header">
          <div>
            <h3>${pair.name}</h3>
            <p>${r.points} pkt • ${r.time} s</p>
          </div>
          <button class="ghost-button" onclick="deletePair(${pair.id})">Usuń</button>
        </div>

        <label>
          Nazwa pary
          <input type="text" value="${escapeHtml(pair.name)}" data-role="pair-name" data-id="${pair.id}">
        </label>

        <label>
          Kategoria
          <select data-role="pair-category" data-id="${pair.id}">
            <option value="cat1" ${pair.category === "cat1" ? "selected" : ""}>${getCategoryLabel("cat1")}</option>
            <option value="cat2" ${pair.category === "cat2" ? "selected" : ""}>${getCategoryLabel("cat2")}</option>
          </select>
        </label>

        <div class="station-grid">
          ${(pair.stations || []).map((station, index) => `
            <label class="station-field">
              <span>Stacja ${index + 1}</span>
              <div class="station-input-label">Punkty</div>
              <input type="text" inputmode="numeric" pattern="[0-9]*" value="${station.points || 0}" data-role="station-points" data-id="${pair.id}" data-index="${index}" aria-label="Punkty dla stacji ${index + 1}">
              <div class="station-input-label">Czas</div>
              <input type="text" inputmode="decimal" pattern="[0-9,.]*" value="${station.time || 0}" data-role="station-time" data-id="${pair.id}" data-index="${index}" aria-label="Czas dla stacji ${index + 1} w sekundach">
            </label>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function render() {
  data = loadData();
  syncCategoryInputs();
  renderEditor();
  renderBoards();
}

function renderBoards() {
  data = loadData();

  const cat1 = data.pairs.filter(p => p.category === "cat1");
  const cat2 = data.pairs.filter(p => p.category === "cat2");

  document.getElementById("board-1").innerHTML = renderBoard(cat1, "cat1");
  document.getElementById("board-2").innerHTML = renderBoard(cat2, "cat2");
  document.getElementById("summary-1").textContent = `${getCategoryLabel("cat1")} • ${cat1.length} par`;
  document.getElementById("summary-2").textContent = `${getCategoryLabel("cat2")} • ${cat2.length} par`;
}

function syncCategoryInputs() {
  const cat1Input = document.getElementById("category-name-1");
  const cat2Input = document.getElementById("category-name-2");

  if (cat1Input) cat1Input.value = data.categories.cat1 || "Klasy 4–5";
  if (cat2Input) cat2Input.value = data.categories.cat2 || "Klasy 6–7";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function addPair() {
  data = loadData();
  data.pairs.push({
    id: Date.now(),
    name: "Nowa para",
    category: "cat1",
    stations: Array.from({length: 12}, () => ({points: 0, time: 0}))
  });
  saveData(data);
  data = loadData();
  render();
}

function deletePair(id) {
  if (!confirm("Usunąć tę parę?")) return;

  data = loadData();
  data.pairs = data.pairs.filter(pair => pair.id !== id);
  saveData(data);
  render();
}

function updatePairField(id, field, value) {
  data = loadData();
  const pair = data.pairs.find(item => item.id === id);

  if (!pair) return;

  if (field === "name") pair.name = value;
  if (field === "category") pair.category = value;

  saveData(data);
  renderBoards();
}

function normalizeNumericInput(value, allowDecimal) {
  const cleaned = String(value ?? "")
    .replace(/,/g, ".")
    .replace(/[\D.-]/g, "");

  if (!allowDecimal) return String(cleaned.replace(/\./g, ""));

  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  return cleaned;
}

function updateStationValue(id, index, field, value) {
  data = loadData();
  const pair = data.pairs.find(item => item.id === id);

  if (!pair) return;

  if (!pair.stations[index]) pair.stations[index] = {points: 0, time: 0};

  const rawValue = normalizeNumericInput(value, field === "time");
  pair.stations[index][field] = field === "time" ? Number(rawValue || 0) : Number(rawValue || 0);

  saveData(data);
  renderBoards();
}

function resetAll() {
  if (confirm("Na pewno usunąć wszystkie dane?")) {
    localStorage.clear();
    location.reload();
  }
}

function openPodium() {
  window.open("podium.html", "_blank");
}

document.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches("[data-role='pair-name']")) {
    updatePairField(Number(target.dataset.id), "name", target.value);
  }

  if (target.matches("[data-role='pair-category']")) {
    updatePairField(Number(target.dataset.id), "category", target.value);
  }

  if (target.matches("[data-role='station-points']")) {
    updateStationValue(Number(target.dataset.id), Number(target.dataset.index), "points", target.value);
  }

  if (target.matches("[data-role='station-time']")) {
    updateStationValue(Number(target.dataset.id), Number(target.dataset.index), "time", target.value);
  }

});

document.addEventListener("change", (event) => {
  const target = event.target;

  if (target.matches("[data-role='category-name']")) {
    data = loadData();
    data.categories[target.dataset.key] = target.value.trim() || (target.dataset.key === "cat1" ? "Klasy 4–5" : "Klasy 6–7");
    saveData(data);
    renderBoards();
  }
});

render();
setInterval(renderBoards, 1000);