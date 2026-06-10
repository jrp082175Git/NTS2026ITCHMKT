const fs = require('fs');
let code = fs.readFileSync('ITCH/Receiver/test/mockServer.js', 'utf8');
code = code.replace(/loginAccepted.write\('                   1', 13, 20, 'ascii'\); \/\/ sequence number/,
"loginAccepted.write('                   2', 13, 20, 'ascii'); // sequence number");
fs.writeFileSync('ITCH/Receiver/test/mockServer.js', code);
