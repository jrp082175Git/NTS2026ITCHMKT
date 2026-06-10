const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../config/loader');

// Since we are mocking argv for display init, let's delay requiring args in logger or provide a way.
let userInitials = [];
try {
  userInitials = require('./args').userInitials;
} catch (err) {
  // handled in start
}

let config = { logging: { directory: './logs' } };
try {
  config = loadConfig();
} catch(err) {}

const logDir = config.logging.directory;

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

let currentDateStr = new Date().toISOString().split('T')[0];
let currentLogStream = createLogStream();

function createLogStream() {
  const initialsStr = userInitials.join('-');
  const fileName = `Receiver_${initialsStr}_${currentDateStr}.log`;
  const filePath = path.join(logDir, fileName);
  return fs.createWriteStream(filePath, { flags: 'a' });
}

function checkRollover() {
  const newDateStr = new Date().toISOString().split('T')[0];
  if (newDateStr !== currentDateStr) {
    currentDateStr = newDateStr;
    currentLogStream.end();
    currentLogStream = createLogStream();
  }
}

function formatLog(level, message) {
  return `[${new Date().toISOString()}] [${level}] ${message}\n`;
}

module.exports = {
  info: (message) => {
    checkRollover();
    const logStr = formatLog('INFO', message);
    currentLogStream.write(logStr);
    console.log(logStr.trim());
  },
  warn: (message) => {
    checkRollover();
    const logStr = formatLog('WARN', message);
    currentLogStream.write(logStr);
    console.warn(logStr.trim());
  },
  error: (message) => {
    checkRollover();
    const logStr = formatLog('ERROR', message);
    currentLogStream.write(logStr);
    console.error(logStr.trim());
  }
};
