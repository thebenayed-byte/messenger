const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let currentPassword = null;
let connectedUsers = 0;

app.use(express.static("public"));

// Générer le mot de passe (UNE SEULE FOIS)
app.get("/generate", (req, res) => {
  if (currentPassword) {
    return res.status(403).json({ error: "Mot de passe déjà généré" });
  }

  currentPassword = crypto.randomBytes(3).toString("hex");
  connectedUsers = 0;

  res.json({ password: currentPassword });
});

// Nouvelle session (optionnel, sécurisé)
app.get("/reset", (req, res) => {
  currentPassword = null;
  connectedUsers = 0;
  res.json({ ok: true });
});

io.on("connection", (socket) => {
  socket.on("join", (password) => {
    if (!currentPassword || password !== currentPassword) {
      socket.emit("errorMessage", "Mot de passe incorrect");
      return;
    }

    if (connectedUsers >= 2) {
      socket.emit("errorMessage", "Deux personnes déjà connectées");
      return;
    }

    connectedUsers++;
    socket.emit("joined");

    socket.on("message", (msg) => {
      socket.broadcast.emit("message", msg);
    });

    socket.on("disconnect", () => {
      connectedUsers--;
      if (connectedUsers <= 0) {
        currentPassword = null; // sécurité : nouvelle session obligatoire
      }
    });
  });
});

server.listen(3000, () => {
  console.log("Hermès Messenger → http://localhost:3000");
});
