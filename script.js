let score = 0;
let cps = 0;

// Upgrade data
let upgrades = {
  cursor: { cost: 15, cps: 1 },
  auto: { cost: 50, cps: 2 },
  grandma: { cost: 100, cps: 5 },
  farm: { cost: 500, cps: 20 },
  factory: { cost: 2000, cps: 100 }
};

const scoreDisplay = document.getElementById("score");
const cpsDisplay = document.getElementById("cps");
const cookie = document.getElementById("cookie");

function updateDisplay() {
  scoreDisplay.textContent = score;
  cpsDisplay.textContent = cps;
  document.getElementById("buyCursor").textContent = `Cursor (+1 CPS) — Cost: ${upgrades.cursor.cost}`;
  document.getElementById("buyAuto").textContent = `Auto Clicker (+2 CPS) — Cost: ${upgrades.auto.cost}`;
  document.getElementById("buyGrandma").textContent = `Grandma (+5 CPS) — Cost: ${upgrades.grandma.cost}`;
  document.getElementById("buyFarm").textContent = `Farm (+20 CPS) — Cost: ${upgrades.farm.cost}`;
  document.getElementById("buyFactory").textContent = `Factory (+100 CPS) — Cost: ${upgrades.factory.cost}`;
}

// Click cookie
cookie.addEventListener("click", () => {
  score++;
  updateDisplay();
});

// Buy function
function buyUpgrade(type) {
  let upgrade = upgrades[type];
  if (score >= upgrade.cost) {
    score -= upgrade.cost;
    cps += upgrade.cps;
    upgrade.cost = Math.floor(upgrade.cost * 1.5);
    updateDisplay();
  }
}

// Attach events
document.getElementById("buyCursor").addEventListener("click", () => buyUpgrade("cursor"));
document.getElementById("buyAuto").addEventListener("click", () => buyUpgrade("auto"));
document.getElementById("buyGrandma").addEventListener("click", () => buyUpgrade("grandma"));
document.getElementById("buyFarm").addEventListener("click", () => buyUpgrade("farm"));
document.getElementById("buyFactory").addEventListener("click", () => buyUpgrade("factory"));

// CPS loop
setInterval(() => {
  score += cps;
  updateDisplay();
}, 1000);

// Save progress every 2s
setInterval(() => {
  localStorage.setItem("score", score);
  localStorage.setItem("cps", cps);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}, 2000);

// Load progress on start
window.addEventListener("load", () => {
  if (localStorage.getItem("score")) {
    score = parseInt(localStorage.getItem("score"));
  }
  if (localStorage.getItem("cps")) {
    cps = parseInt(localStorage.getItem("cps"));
  }
  if (localStorage.getItem("upgrades")) {
    upgrades = JSON.parse(localStorage.getItem("upgrades"));
  }
  updateDisplay();
});

updateDisplay();
