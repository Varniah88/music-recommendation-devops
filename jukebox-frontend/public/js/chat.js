// Connect to backend with user email (for private messaging)
const socket = io("http://localhost:3000", {
  query: {
    email: sessionStorage.getItem("userEmail") || "anonymous@example.com"
  }
});

socket.on("forcedLogout", (msg) => {
  alert(msg || "You have been logged out by the admin.");
  sessionStorage.clear();
  window.location.href = "login.html";
});

/* ---------------- GROUP CHAT LOGIC ---------------- */
let selectedRoom = null;
const genreSelect = document.getElementById("genreSelect");
const chatBox = document.getElementById("chatBox");
const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const roomTitle = document.getElementById("roomTitle");

genreSelect?.addEventListener("change", () => {
  selectedRoom = genreSelect.value;
  roomTitle.textContent = `🎶 ${selectedRoom.toUpperCase()} Chat`;
  form.style.display = "block";
  socket.emit("joinRoom", selectedRoom);
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg && selectedRoom) {
    const username = sessionStorage.getItem("userName");
    socket.emit("chatMessage", {
      room: selectedRoom,
      message: `${username}: ${msg}`,
    });
    input.value = "";
  }
});

socket.on("chatMessage", (msg) => {
  const p = document.createElement("p");
  p.textContent = msg;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("roomHistory", (history) => {
  chatBox.innerHTML = "";
  history.forEach((msg) => {
    const p = document.createElement("p");
    p.textContent = msg;
    chatBox.appendChild(p);
  });
});

/* ---------------- PRIVATE CHAT LOGIC ---------------- */
let privateTargetEmail = null;
const privateChatBox = document.getElementById("privateChatBox");
const privateTitle = document.getElementById("privateChatTitle");
const privateMessages = document.getElementById("privateChatMessages");
const privateInput = document.getElementById("privateMessage");
const privateForm = document.getElementById("privateChatForm");

// Receive list of chat partners and auto-load private history
socket.on("chatPartners", (partners) => {
  console.log("Received chatPartners list:", partners);
  const myEmail = sessionStorage.getItem("userEmail");
  partners.forEach((user) => {
    if (user !== myEmail) {
      socket.emit("loadPrivateChat", { withUser: user });
    }
  });
});

// Open private chat when a user is clicked
window.openPrivateChat = function (email) {
  privateTargetEmail = email;
  privateChatBox.style.display = "block";
  privateTitle.textContent = `Private chat with ${email}`;
  privateMessages.innerHTML = ""; // Clear old messages

  // Request history
  socket.emit("loadPrivateChat", { withUser: email });
};

// Send private message
privateForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = privateInput.value.trim();
  if (msg && privateTargetEmail) {
    const username = sessionStorage.getItem("userName");
    const fullMsg = `${username} (private): ${msg}`;

    socket.emit("privateMessage", {
      to: privateTargetEmail,
      message: fullMsg,
      sender: sessionStorage.getItem("userEmail")
    });

    appendPrivateMessage(fullMsg, true);
    privateInput.value = "";
  }
});

// Receive private message
socket.on("privateMessage", ({ message, sender }) => {
  const myEmail = sessionStorage.getItem("userEmail");
  if (sender === myEmail) return;
  appendPrivateMessage(message, false);
});

// Receive private chat history
socket.on("privateChatHistory", ({ withUser, history }) => {
  privateTitle.textContent = `Private chat with ${withUser}`;
  privateMessages.innerHTML = "";
  history.forEach((msg) => appendPrivateMessage(msg));
});


// Append message to private chat
function appendPrivateMessage(message, isSender = false) {
  const p = document.createElement("p");
  p.textContent = message;
  if (isSender) p.style.fontStyle = "italic";
  privateMessages.appendChild(p);
  privateMessages.scrollTop = privateMessages.scrollHeight;
}
