const STORAGE_KEY = "mcp_data";

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    pairs: [],
    categories: {
      cat1: "Klasy 4–5",
      cat2: "Klasy 6–7"
    }
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem("mcp_backup", JSON.stringify(data)); // emergency backup
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