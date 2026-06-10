const fs = require('fs');
let code = fs.readFileSync('ITCH/Receiver/test/mockServer.js', 'utf8');
code = code.replace("const payload = Buffer.from('S'); // S = System Event message type",
"const payload = Buffer.alloc(6);\npayload.write('S', 0, 1, 'ascii');\npayload.writeInt32BE(123456789, 1);\npayload.write('O', 5, 1, 'ascii'); // System Event");
fs.writeFileSync('ITCH/Receiver/test/mockServer.js', code);
