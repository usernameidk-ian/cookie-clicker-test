let username = prompt("Enter your username:") || "unknown loser";

// Admin setup
const adminUsername = "bian";
const adminPassword = "bian_password";

let password = "";
if (username === adminUsername) {
  password = prompt("Enter admin password:") || "";
}

const isAdmin = username === adminUsername && password === adminPassword;

// Function to give each username a consistent color
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

const userColor = stringToColor(username); 
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

["Cursor","Auto","Grandma","Farm","Factory"].forEach(name => {
  const id = "buy" + name;
  document.getElementById(id).addEventListener("click", () => buyUpgrade(name.toLowerCase()));
});

// CPS loop
setInterval(() => {
  score += cps;
  updateDisplay();
}, 1000);

// Save progress
setInterval(() => {
  localStorage.setItem("score", score);
  localStorage.setItem("cps", cps);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}, 2000);

// Load progress
window.addEventListener("load", () => {
  if (localStorage.getItem("score")) score = parseInt(localStorage.getItem("score"));
  if (localStorage.getItem("cps")) cps = parseInt(localStorage.getItem("cps"));
  if (localStorage.getItem("upgrades")) upgrades = JSON.parse(localStorage.getItem("upgrades"));
  updateDisplay();
});

// Enable music on first click
document.addEventListener("click", () => {
  const bgm = document.getElementById("bgm");
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

/* ===== FIREBASE CHAT SYSTEM ===== */
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendChat = document.getElementById("send-chat");
const clearChatBtn = document.getElementById("clear-chat");
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");

const messagesRef = db.ref("messages");
const usersRef = db.ref("onlineUsers");

// Add self to online users
const userRef = usersRef.push({ username, timestamp: Date.now() });

// Remove from online on disconnect
userRef.onDisconnect().remove();

// Admin can see online users
if (isAdmin) {
  const onlineList = document.createElement("div");
  onlineList.id = "online-list";
  onlineList.style.marginTop = "10px";
  onlineList.style.fontWeight = "bold";
  onlineList.innerHTML = "<h3>Online Users:</h3>";
  document.querySelector(".chat-box").appendChild(onlineList);

  usersRef.on("value", snapshot => {
    onlineList.innerHTML = "<h3>Online Users:</h3>";
    snapshot.forEach(snap => {
      const u = snap.val();
      const p = document.createElement("p");
      p.textContent = u.username;
      onlineList.appendChild(p);
    });
  });
}

// Clear chat button (admin only)
if (isAdmin) clearChatBtn.style.display = "inline-block";
if (isAdmin) clearChatBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete ALL messages?")) {
    messagesRef.remove();
    chatMessages.innerHTML = "";
  }
});

// Send chat
sendChat.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;
  messagesRef.push({ text, username, timestamp: Date.now() });
  chatInput.value = "";
});
chatInput.addEventListener("keypress", e => { if (e.key === "Enter") sendChat.click(); });

// Upload image
const storage = firebase.storage();
const storageRef = storage.ref();

uploadBtn.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const fileRef = storageRef.child(`images/${Date.now()}_${file.name}`);
  fileRef.put(file).then(() => fileRef.getDownloadURL().then(url => {
    messagesRef.push({ imageUrl: url, username, timestamp: Date.now() });
  }));
  imageInput.value = "";
});

// Unified message rendering
function renderMessage(msg, key) {
  const p = document.createElement("p");

  if (msg.text) {
    p.textContent = `${msg.username}: ${msg.text}`;
    p.style.color = stringToColor(msg.username);
  }

  if (msg.imageUrl) {
    const img = document.createElement("img");
    img.src = msg.imageUrl;
    img.style.maxWidth = "150px";
    img.style.display = "block";
    img.style.marginTop = "5px";
    if (msg.text) p.appendChild(img);
    else {
      p.textContent = `${msg.username}: `;
      p.style.color = stringToColor(msg.username);
      p.appendChild(img);
    }
  }

  if (isAdmin && key) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => { messagesRef.child(key).remove(); p.remove(); });
    p.appendChild(deleteBtn);
  }

  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

messagesRef.on("child_added", snapshot => {
  renderMessage(snapshot.val(), snapshot.key);
});

/* ===== RANDOM EVENTS / GOLDEN COOKIE ===== */
function spawnGoldenCookie() {
  const chance = Math.random();
  if (chance < 0.1) { // 10% chance every 30s
    const bonus = Math.floor(Math.random() * 50) + 10;
    score += bonus;
    updateDisplay();
    messagesRef.push({ text: `✨ Golden Cookie! +${bonus} cookies!`, username: "System", timestamp: Date.now() });
  }
}
setInterval(spawnGoldenCookie, 30000);
