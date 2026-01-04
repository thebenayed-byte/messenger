const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = new Map(); // socket.id -> pseudo

app.use(express.static('public')); // le dossier contenant index.html

io.on('connection', (socket) => {
  console.log('Nouvelle connexion :', socket.id);

  // Quand un utilisateur définit son pseudo
  socket.on('setPseudo', (pseudo) => {
    users.set(socket.id, pseudo);
    updateUsers();
  });

  // Message de groupe
  socket.on('groupMessage', (message) => {
    const pseudo = users.get(socket.id) || 'Anonyme';
    io.emit('groupMessage', { pseudo, message, time: new Date().toLocaleTimeString() });
  });

  // Message privé
  socket.on('privateMessage', ({ to, message }) => {
    const from = users.get(socket.id);
    const destSocketId = [...users.entries()].find(([id, name]) => name === to)?.[0];
    if (from && destSocketId) {
      io.to(destSocketId).emit('privateMessage', {
        from,
        message,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  // Déconnexion
socket.on('disconnect', () => {
    users.delete(socket.id);
    updateUsers();
  });

  // Met à jour la liste des utilisateurs pour tous
  function updateUsers() {
    const list = [...users.values()];
    io.emit('userList', list);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('Serveur lancé sur http://localhost:${PORT}');
});
