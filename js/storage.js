const STORAGE_KEY = "mcp_data";

function defaultData() {
  return {
    pairs: [],
    categories: {
      cat1: "Klasy 4–5",
      cat2: "Klasy 6–7"
    }
  };
}

function normalizeData(data) {
  const base = defaultData();
  const safe = data && typeof data === "object" ? data : {};
  const pairs = Array.isArray(safe.pairs) ? safe.pairs : [];

  return {
    ...base,
    ...safe,
    categories: {
      ...base.categories,
      ...(safe.categories || {})
    },
    pairs: pairs.map(pair => ({
      id: pair.id || Date.now() + Math.random(),
      name: pair.name || "Nowa para",
      category: pair.category || "cat1",
      stations: Array.isArray(pair.stations) && pair.stations.length
        ? pair.stations.map(station => ({
            points: Number(station && station.points) || 0,
            time: Number(station && station.time) || 0
          }))
        : Array.from({length: 12}, () => ({points: 0, time: 0}))
    }))
  };
}

function loadData() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeData(raw);
  } catch (error) {
    return defaultData();
  }
}

function saveData(data) {
  const safeData = normalizeData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
  localStorage.setItem("mcp_backup", JSON.stringify(safeData));
}

function exportBackup() {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "matematyczny-czar-par-backup.json";
  a.click();
}

function importBackup() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(STORAGE_KEY, reader.result);
      location.reload();
    };
    reader.readAsText(file);
  };
  input.click();
}