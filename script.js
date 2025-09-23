let score = 0;

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");

cookie.addEventListener("click", () => {
  score++;
  scoreDisplay.textContent = score;
});
