const net = require("net");

const testPort = (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);

    socket.on("connect", () => {
      console.log(`✅ Port ${port} open on ${host}`);
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      console.log(`⛔ Timeout: Port ${port} blocked on ${host}`);
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      console.log(`❌ Error: Port ${port} not reachable on ${host}`);
      resolve(false);
    });

    socket.connect(port, host);
  });
};

// main function you can call anywhere
async function checkSMTPPorts() {
  await testPort("smtp.gmail.com", 465);
  await testPort("smtp.gmail.com", 587);
  await testPort("smtp.gmail.com", 25);
}

module.exports = { checkSMTPPorts };
