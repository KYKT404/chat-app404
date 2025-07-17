const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get("room");
const name = urlParams.get("name");

document.getElementById("roomInfo").textContent = `ルーム: ${room}`;
const userListDiv = document.getElementById("userList");
const creatorInfo = document.getElementById("creatorInfo");

socket.emit("joinRoom", { room, name });

socket.on("roomCreator", (creator) => {
  creatorInfo.textContent = `このルームの作成者: ${creator}`;
});

socket.on("errorMessage", (msg) => {
  alert(msg);
  window.location.href = "index.html";
});

socket.on("userList", (users) => {
  userListDiv.innerHTML = "参加者一覧:<br>" + users.join("<br>");
});

socket.on("chatMessage", (data) => {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = `${data.name}: ${data.msg}`;
  document.getElementById("messages").appendChild(messageDiv);
});

document.getElementById("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = document.getElementById("messageInput").value;
  socket.emit("chatMessage", msg);
  document.getElementById("messageInput").value = "";
});
