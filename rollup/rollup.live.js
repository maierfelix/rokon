const fs = require("fs");
const { exec } = require("child_process");
const WebSocket = require("ws");

let sockets = [];

const PORT = 9696;
const SOCKET_OPEN = WebSocket.OPEN;

const PACKET_RELOAD = new Uint8Array([ 1 ]);

function addSocket(socket) {
  sockets.push(socket);
};

function removeSocket(socket) {
  for (let ii = 0; ii < sockets.length; ++ii) {
    if (sockets[ii] === socket) {
      sockets.splice(ii, 1);
      break;
    }
  };
};

function broadcast(packet) {
  sockets.map(socket => {
    if (socket.readyState === SOCKET_OPEN) socket.send(packet);
  });
};

function bundle() {
  return new Promise(resolve => {
    exec("npm run browser", (err, stdout, stderr) => {
      if (err) console.log(err);
      else resolve();
    });
  });
};

function onFileChange(e, doBundling) {
  if (!timeout) {
    let now = Date.now();
    timeout = 1;
    setTimeout(() => {
      timeout = 0;
      console.log("Building...");
    }, 50);
    if (doBundling) {
      bundle().then(() => {
        broadcast(PACKET_RELOAD);
        let then = Date.now();
        console.log(`Built in ${then - now}ms!`);
      });
    } else {
      broadcast(PACKET_RELOAD);
      let then = Date.now();
      console.log(`Built in ${then - now}ms!`);
    }
  }
};

const ws = new WebSocket.Server({
  port: PORT
});

let timeout = 0;
fs.watch("./src/", { recursive: true }, (e) => onFileChange(e, true));
fs.watch("./static/", { recursive: true }, (e) => onFileChange(e, false));
fs.watch("./shaders/", { recursive: true }, (e) => onFileChange(e, false));

console.log(`Listening on ${PORT}`);

ws.on("connection", socket => {
  addSocket(socket);
  socket.on("message", e => { });
  socket.on("error", e => {
    removeSocket(socket);
    socket.close();
  });
});
