// --- USER LOGIN ---
let username = prompt("Enter your username:") || "guest" + Math.floor(Math.random() * 1000);
window.username = username; // expose globally for admin check

// --- GAME VARIABLES ---
let cookies = 0;
let cps = 0;

const upgrades = [
  { name: "Cursor", cps: 1, cost: 15 },
  { name: "Auto Clicker", cps: 2, cost: 50 },
  { name: "Grandma", cps: 5, cost: 100 },
  { name: "Farm", cps: 20, cost: 500 },
  { name: "Factory", cps: 100, cost: 2000 },
  // NEW upgrades
  { name: "Mine", cps: 500, cost: 10000 },
  { name: "Bank", cps: 2000, cost: 50000 },
  { name: "Temple", cps: 10000, cost: 200000 },
  { name: "Wizard Tower", cps: 50000, cost: 1000000 },
  { name: "Portal", cps: 250000, cost: 10000000 }
];

// --- SHOP RENDER ---
const shopDiv = document.getElementById("shop-items");
upgrades.forEach((upg, i) => {
  const btn = document.createElement("button");
  btn.id = "buy" + i;
  btn.innerText = `${upg.name} (+${upg.cps} CPS) — Cost: ${upg.cost}`;
  btn.onclick = () => buyUpgrade(i);
  shopDiv.appendChild(btn);
});

// --- COOKIE CLICK ---
document.getElementById("cookie").addEventListener("click", () => {
  cookies++;
  updateScore();
  saveData();
});

// --- UPGRADE BUYING ---
function buyUpgrade(i) {
  const upg = upgrades[i];
  if (cookies >= upg.cost) {
    cookies -= upg.cost;
    cps += upg.cps;
    upg.cost = Math.floor(upg.cost * 1.5);
    document.getElementById("buy" + i).innerText = `${upg.name} (+${upg.cps} CPS) — Cost: ${upg.cost}`;
    updateScore();
    saveData();
  }
}

// --- UPDATE UI ---
function updateScore() {
  document.getElementById("score").innerText = cookies;
  document.getElementById("cps").innerText = cps;
}

// --- AUTO INCREMENT ---
setInterval(() => {
  cookies += cps;
  updateScore();
  saveData();
}, 1000);

// --- FIREBASE SAVE/LOAD ---
function saveData() {
  db.ref("players/" + username).set({
    cookies,
    cps
  });
}

// Load player data
db.ref("players/" + username).on("value", snap => {
  const data = snap.val();
  if (data) {
    cookies = data.cookies || 0;
    cps = data.cps || 0;
    updateScore();
  }
});

// --- GOLDEN COOKIE ---
setInterval(() => {
  if (Math.random() < 0.2) { // 20% chance
    const golden = document.createElement("div");
    golden.innerText = "🌟";
    golden.style.position = "absolute";
    golden.style.left = Math.random() * window.innerWidth + "px";
    golden.style.top = Math.random() * window.innerHeight + "px";
    golden.style.fontSize = "40px";
    golden.style.cursor = "pointer";
    document.body.appendChild(golden);
    golden.onclick = () => {
      cookies += 1000000; // 1 million cookies
      updateScore();
      saveData();
      golden.remove();
    };
    setTimeout(() => golden.remove(), 7000);
  }
}, 15000);

// --- CHAT SYSTEM ---
const chatBox = document.getElementById("chat-messages");
document.getElementById("send-chat").addEventListener("click", sendMessage);

function sendMessage() {
  const msg = document.getElementById("chat-input").value;
  if (!msg) return;
  db.ref("chat").push({
    user: username,
    text: msg,
    type: "text"
  });
  document.getElementById("chat-input").value = "";
}

db.ref("chat").on("child_added", snap => {
  const msg = snap.val();
  const div = document.createElement("div");
  if (msg.type === "text") {
    div.innerText = `${msg.user}: ${msg.text}`;
  } else if (msg.type === "image") {
    const img = document.createElement("img");
    img.src = msg.url;
    img.style.maxWidth = "150px";
    div.innerText = msg.user + ": ";
    div.appendChild(img);
  }
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Clear chat (only for admin)
document.getElementById("clear-chat").onclick = () => {
  if (username === "bian") db.ref("chat").remove();
};
if (username === "bian") document.getElementById("clear-chat").style.display = "inline-block";

// --- IMAGE UPLOAD ---
document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("imageInput").click();
};
document.getElementById("imageInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const ref = storage.ref("chatImages/" + Date.now() + "-" + file.name);
  ref.put(file).then(() => {
    ref.getDownloadURL().then(url => {
      db.ref("chat").push({
        user: username,
        url,
        type: "image"
      });
    });
  });
};

// --- RESET ALL PLAYERS (ADMIN) ---
function resetAllPlayers() {
  if (username !== "bian") return;
  db.ref("players").once("value", snapshot => {
    snapshot.forEach(child => {
      db.ref("players/" + child.key).set({
        cookies: 0,
        cps: 0
      });
    });
  });
  alert("All players have been reset!");
}
