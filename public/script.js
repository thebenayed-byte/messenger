 const socket = io();
let pseudo = "";

function connect() {
  const input = document.getElementById('pseudoInput');
  pseudo = input.value.trim();
  if (!pseudo) return alert("Veuillez entrer un pseudo.");

  socket.emit('setPseudo', pseudo);
  document.getElementById('userPseudo').innerText = pseudo;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('chatApp').style.display = 'flex';
}

// Affichage message de groupe
socket.on('groupMessage', ({ pseudo, message, time }) => {
  appendMessage('groupMessages', `${pseudo} [${time}] :`, message);
});

// Affichage message privé
socket.on('privateMessage', ({ from, message, time }) => {
  appendMessage('privateMessages', `${from} [${time}] → Moi :`, message);
});

// Liste des utilisateurs
socket.on('userList', list => {
  const users = document.getElementById('users');
  const select = document.getElementById('privateUser');
  users.innerHTML = "";
  select.innerHTML = '<option value="">Choisir un utilisateur</option>';

  list.forEach(user => {
    if (user !== pseudo) {
      const li = document.createElement('li');
li.textContent = user;
      users.appendChild(li);

      const opt = document.createElement('option');
      opt.value = user;
      opt.textContent = user;
      select.appendChild(opt);
    }
  });
});

function sendGroupMessage() {
  const input = document.getElementById('groupInput');
  const msg = input.value.trim();
  if (msg) {
    socket.emit('groupMessage', msg);
    input.value = "";
  }
}

function sendPrivateMessage() {
  const to = document.getElementById('privateUser').value;
  const msg = document.getElementById('privateInput').value.trim();
  if (to && msg) {
    socket.emit('privateMessage', { to, message: msg });
    appendMessage('privateMessages', `Moi →${to} [${formatTime()}] :`, msg);
    document.getElementById('privateInput').value = "";
  }
}

function appendMessage(containerId, title, msg) {
  const box = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'message';
  div.innerHTML = `<strong>${title}</strong> ${msg}`
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}