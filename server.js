const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // socket.id => pseudo
const pseudos = {}; // pseudo => socket.id

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion');

  socket.on('set pseudo', (pseudo) => {
    users[socket.id] = pseudo;
    pseudos[pseudo] = socket.id;
    updateUserList();
  });

  socket.on('private message', ({ to, message }) => {
    const toSocketId = pseudos[to];
    const fromPseudo = users[socket.id];
    if (toSocketId) {
      io.to(toSocketId).emit('private message', {
        from: fromPseudo,
        message: message
      });
    }
  });

  socket.on('disconnect', () => {
    const pseudo = users[socket.id];
    delete pseudos[pseudo];
delete users[socket.id];
    updateUserList();
  });

  function updateUserList() {
    const allPseudos = Object.values(users);
    io.emit('user list', allPseudos);
  }
});

server.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});