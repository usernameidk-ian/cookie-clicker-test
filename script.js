let username = prompt("Enter your username:") || "unknown loser";
// Admin setup
const adminUsername = "bian"; // 
const adminPassword = "bian_password"; // 

// Prompt for password only if username matches
let password = "";
if (username === adminUsername) {
  password = prompt("Enter admin password:") || "";
}

// Determine if admin
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

// Enable music on first click
document.addEventListener("click", () => {
  const bgm = document.getElementById("bgm");
  if (bgm.paused) {
    bgm.play().catch(() => {});
  }
}, { once: true });

// Firebase chat system
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendChat = document.getElementById("send-chat");

// Reference to "messages" in your Firebase Realtime Database
const messagesRef = db.ref("messages");

// Send message to Firebase
sendChat.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;

  messagesRef.push({
    text: text,
    username: username,
    timestamp: Date.now()
  });

  chatInput.value = "";
});

// Press Enter to send
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendChat.click();
});
const clearChatBtn = document.getElementById("clear-chat");

// Show Clear Chat button for admin
if (isAdmin) clearChatBtn.style.display = "inline-block";

// Clear all chat (admin only)
if (isAdmin) {
  clearChatBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete ALL messages?")) {
      db.ref("messages").remove();
      chatMessages.innerHTML = "";
    }
  });
}

// Delete individual messages (admin only)
messagesRef.on("child_added", snapshot => {
  const msg = snapshot.val();
  const key = snapshot.key;
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
    p.appendChild(img);
  }

  // Admin delete button for each message
  if (isAdmin) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => {
      messagesRef.child(key).remove();
      p.remove();
    });
    p.appendChild(deleteBtn);
  }

  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Listen for new messages
messagesRef.on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const p = document.createElement("p");
  p.textContent = `${msg.username}: ${msg.text}`;
  
  // === IMAGE UPLOAD SYSTEM ===
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");

// Get Firebase storage reference
const storage = firebase.storage();
const storageRef = storage.ref();

// When upload button is clicked, trigger file picker
uploadBtn.addEventListener("click", () => {
  imageInput.click();
});

// When file is chosen
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Create a unique filename
  const fileRef = storageRef.child(`images/${Date.now()}_${file.name}`);

  // Upload file
  fileRef.put(file).then(() => {
    fileRef.getDownloadURL().then((url) => {
      // Push image message to database
      messagesRef.push({
        imageUrl: url,
        username: username,
        timestamp: Date.now()
      });
    });
  });

  imageInput.value = ""; // reset
});

// Modify listener to show images too
messagesRef.on("child_added", (snapshot) => {
  const msg = snapshot.val();
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
    p.textContent = `${msg.username}: `;
    p.style.color = stringToColor(msg.username);
    p.appendChild(img);
  }

  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
  
  // Color username
  p.style.color = stringToColor(msg.username);
  
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
