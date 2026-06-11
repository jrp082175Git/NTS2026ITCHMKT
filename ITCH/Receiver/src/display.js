const { display } = require('./args');

module.exports = {
  packet: (obj) => {
    if (display) {
      console.log(`\x1b[33m[PACKET] Received at ${new Date().toISOString()}: ${JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )}\x1b[0m`);
    }
  },
  message: (obj) => {
    if (display) {
      console.log(`\x1b[33m[MESSAGE] ${JSON.stringify(obj.message, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )}\x1b[0m`);
    }
  }
};
