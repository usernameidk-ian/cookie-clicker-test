let score = 0;
let cps = 0; // cookies per second

// Prices
let autoClickerCost = 10;
let grandmaCost = 50;

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");
const cpsDisplay = document.getElementById("cps");
const buyAuto = document.getElementById("buyAuto");
const buyGrandma = document.getElementById("buyGrandma");

// Load save
if (localStorage.getItem("score")) {
  score = parseInt(localStorage.getItem("score"));
  cps = parseInt(localStorage.getItem("cps"));
  autoClickerCost = parseInt(localStorage.getItem("autoCost")) || 10;
  grandmaCost = parseInt(localStorage.getItem("grandmaCost")) || 50;
  updateDisplay();
  updateButtons();
}

// Cookie click
cookie.addEventListener("click", () => {
  score++;
  updateDisplay();
});

// Buy Auto Clicker
buyAuto.addEventListener("click", () => {
  if (score >= autoClickerCost) {
    score -= autoClickerCost;
    cps += 1;
    autoClickerCost = Math.floor(autoClickerCost * 1.5);
    updateDisplay();
    updateButtons();
  }
});

// Buy Grandma
buyGrandma.addEventListener("click", () => {
  if (score >= grandmaCost) {
    score -= grandmaCost;
    cps += 5;
    grandmaCost = Math.floor(grandmaCost * 1.5);
    updateDisplay();
    updateButtons();
  }
});

// Auto cookie gain
setInterval(() => {
  score += cps;
  updateDisplay();
}, 1000);

// Save progress
setInterval(() => {
  localStorage.setItem("score", score);
  localStorage.setItem("cps", cps);
  localStorage.setItem("autoCost", autoClickerCost);
  localStorage.setItem("grandmaCost", grandmaCost);
}, 2000);

// Helpers
function updateDisplay() {
  scoreDisplay.textContent = score;
  cpsDisplay.textContent = cps;
}

function updateButtons() {
  buyAuto.textContent = `Auto Clicker (Cost: ${autoClickerCost})`;
  buyGrandma.textContent = `Grandma (Cost: ${grandmaCost})`;
}
