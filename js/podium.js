function load() {
  return JSON.parse(localStorage.getItem("mcp_data")) || {pairs:[]};
}

function calc(p) {
  let points=0, time=0;
  p.stations.forEach(s=>{
    points+=Number(s.points||0);
    time+=Number(s.time||0);
  });
  return {points,time};
}

function getTop(cat) {
  const data = load();

  return data.pairs
    .filter(p=>p.category===cat)
    .sort((a,b)=>{
      const A=calc(a), B=calc(b);
      if(A.points!==B.points) return B.points-A.points;
      return A.time-B.time;
    })
    .slice(0,3);
}

function renderPodium(id, list) {
  const el = document.getElementById(id);

  const medals = ["🥇","🥈","🥉"];

  el.innerHTML = list.map((p,i)=>{
    const r=calc(p);
    return `
      <div class="podium-card">
        <h3>${medals[i]} ${p.name}</h3>
        <p>${r.points} pkt</p>
        <p>${r.time} s</p>
      </div>
    `;
  }).join("");
}

function update() {
  renderPodium("podium-1", getTop("cat1"));
  renderPodium("podium-2", getTop("cat2"));
}

setInterval(update, 1000);
update();