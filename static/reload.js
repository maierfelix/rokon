(function() {

  "use strict";

  // #CONFIG
  const PORT = 9696;

  // #INIT
  let socket = new WebSocket(`ws://localhost:${9696}`);
  socket.binaryType = "arraybuffer";
  socket.onopen = open;
  socket.onmessage = message;

  function open(e) {
    console.log(`Listening for live reload on ${PORT}`);
  };

  function close(e) {

  };

  function message(e) {
    let view = new Uint8Array(e.data);
    processMessage(view);
    //socket.send("PING");
  };

  function processMessage(data) {
    let kind = data[0] | 0;
    switch (kind) {
      case 1: {
        window.location.reload();
      }
    };
  };

})();
