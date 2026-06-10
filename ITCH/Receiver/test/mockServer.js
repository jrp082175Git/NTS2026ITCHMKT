const net = require('net');

const PORT = 21000;

const server = net.createServer((socket) => {
  console.log('Client connected');
  let loggedIn = false;

  socket.on('data', (data) => {
    if (data.length >= 2) {
      const type = data.toString('ascii', 2, 3);
      if (type === 'L') {
        console.log('Received Login Request');
        const loginAccepted = Buffer.alloc(2 + 1 + 10 + 20);
        loginAccepted.writeUInt16BE(31, 0); // length
        loginAccepted.write('A', 2, 1, 'ascii'); // type
        loginAccepted.write('TEST      ', 3, 10, 'ascii'); // session
        loginAccepted.write('                   2', 13, 20, 'ascii'); // sequence number
        socket.write(loginAccepted);
        loggedIn = true;

        // Send a dummy sequenced data packet
        setTimeout(() => {
          const payload = Buffer.alloc(6);
payload.write('S', 0, 1, 'ascii');
payload.writeInt32BE(123456789, 1);
payload.write('O', 5, 1, 'ascii'); // System Event
          const seqData = Buffer.alloc(2 + 1 + payload.length);
          seqData.writeUInt16BE(1 + payload.length, 0);
          seqData.write('S', 2, 1, 'ascii');
          payload.copy(seqData, 3);
          socket.write(seqData);
        }, 100);

        setInterval(() => {
          if (loggedIn && !socket.destroyed) {
            const hb = Buffer.alloc(3);
            hb.writeUInt16BE(1, 0);
            hb.write('H', 2, 1, 'ascii');
            socket.write(hb);
          }
        }, 1000);
      } else if (type === 'R') {
        console.log('Received Client Heartbeat');
      } else if (type === 'O') {
        console.log('Received Logout Request');
        socket.end();
      }
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket Error:', err.message);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock server listening on 127.0.0.1:${PORT}`);
});
