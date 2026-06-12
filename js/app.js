let data = loadData();

function addPair() {
  data.pairs.push({
    id: Date.now(),
    name: "Nowa para",
    category: "cat1",
    stations: Array.from({length: 12}, () => ({points: 0, time: 0}))
  });
  saveData(data);
  render();
}

function calc(pair) {
  let points = 0;
  let time = 0;

  pair.stations.forEach(s => {
    points += Number(s.points || 0);
    time += Number(s.time || 0);
  });

  return {points, time};
}

function sortPairs(list) {
  return [...list].sort((a,b) => {
    const A = calc(a);
    const B = calc(b);

    if (A.points !== B.points) return B.points - A.points;
    return A.time - B.time;
  });
}

function render() {
  data = loadData();

  const cat1 = sortPairs(data.pairs.filter(p => p.category === "cat1"));
  const cat2 = sortPairs(data.pairs.filter(p => p.category === "cat2"));

  document.getElementById("board-1").innerHTML = renderBoard(cat1);
  document.getElementById("board-2").innerHTML = renderBoard(cat2);
}

function renderBoard(list) {
  return list.map((p,i) => {
    const r = calc(p);
    return `
      <div class="row">
        <b>${i+1}. ${p.name}</b>
        <span>${r.points} pkt</span>
        <span>${r.time} s</span>
      </div>
    `;
  }).join("");
}

function resetAll() {
  if(confirm("Na pewno usunąć wszystkie dane?")) {
    localStorage.clear();
    location.reload();
  }
}

function openPodium() {
  window.open("podium.html", "_blank");
}

setInterval(render, 1000);
render();