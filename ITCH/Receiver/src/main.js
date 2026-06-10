const { environment, freshStart, version, display, userInitials } = require('./args');
const { loadConfig } = require('../config/loader');
const endianness = require('./endianness');
const redisStore = require('./storage/redisStore');
const memory = require('./storage/memory');
const SoupBinTCPClient = require('./soupbintcp/client');
const logger = require('./logger');
const displayLogger = require('./display');

async function main() {
  logger.info(`Starting Receiver application. Environment: ${environment}, FreshStart: ${freshStart}, Version: ${version}, Display: ${display ? 'ON' : 'OFF'}`);

  endianness.logEndianness();

  const config = loadConfig();

  // 4. Connect to Redis
  try {
    await redisStore.connect();
  } catch (err) {
    logger.error(`Failed to connect to Redis: ${err.message}`);
    process.exit(1);
  }

  // 5. START:Y / START:N logic
  let sessionId = ''.padEnd(10, ' ');
  let requestedSequenceNumber = 1n;

  if (freshStart) {
    logger.info("Fresh start requested. Clearing memory and Redis.");
    memory.clear();
    await redisStore.clearAll();
  } else {
    logger.info("Resume requested. Loading from Redis.");
    const storedSession = await redisStore.getSession();
    const storedSeq = await redisStore.getLastSequence();

    if (!storedSession || storedSeq === null) {
      logger.error("No previous session found in Redis. Please run with START:Y.");
      process.exit(1);
    }

    sessionId = storedSession;
    requestedSequenceNumber = storedSeq + 1n;

    const records = await redisStore.loadAllRecords();
    memory.loadAll(records);
    logger.info(`Loaded ${records.length} records into memory. Resuming at sequence ${requestedSequenceNumber}.`);
  }

  // Choose parser
  const parser = version === 'V2026' ? require('./messages/v2026/parser') : require('./messages/v2015/parser');

  const endpoint = config[environment].itch;

  // 6. Instantiate Client
  const client = new SoupBinTCPClient(
    endpoint.host,
    endpoint.port,
    config.credentials,
    sessionId,
    requestedSequenceNumber
  );

  // 7, 8, 9, 10, 11 (wiring events)
  client.on('loginAccepted', async (data) => {
    await redisStore.saveSession(data.sessionId);
  });

  client.on('message', async (data) => {
    const decoded = parser.parse(data.payload);
    const record = {
      seq: data.sequenceNumber,
      msgType: decoded.msgType,
      receivedAt: Date.now(),
      message: decoded
    };

    memory.insert(record);
    displayLogger.message(record);

    try {
      await redisStore.saveRecord(record);
    } catch (err) {
      logger.error(`Redis write-through failed: ${err.message}`);
    }
  });

  client.on('sessionReset', async () => {
    logger.warn('Unsolicited 24x7 session reset. Clearing memory and Redis.');
    memory.clear();
    await redisStore.clearAll();
  });

  client.on('endOfSession', () => {
    // Next connection will need to be a new session
  });

  client.on('loginRejected', () => {
    process.exit(1);
  });

  client.connect();

  // 12. Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    client.logout();
    await redisStore.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
