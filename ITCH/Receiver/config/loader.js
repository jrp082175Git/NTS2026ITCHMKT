const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  let config;
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(data);
  } catch (err) {
    console.error(`Failed to load config.json: ${err.message}`);
    process.exit(1);
  }

  const requiredKeys = ['PROD', 'DR', 'credentials', 'soupbintcp', 'redis', 'logging'];
  for (const key of requiredKeys) {
    if (!config[key]) {
      console.error(`Invalid configuration: missing key '${key}'`);
      process.exit(1);
    }
  }

  // Validate credentials pad format
  if (config.credentials.username.length > 6) {
    console.error("Invalid configuration: username max length is 6");
    process.exit(1);
  }
  if (config.credentials.password.length > 10) {
    console.error("Invalid configuration: password max length is 10");
    process.exit(1);
  }

  // Pad credentials to right spaces
  config.credentials.username = config.credentials.username.padEnd(6, ' ');
  config.credentials.password = config.credentials.password.padEnd(10, ' ');

  return config;
}

module.exports = { loadConfig };
