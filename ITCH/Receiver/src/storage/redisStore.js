const { createClient } = require('redis');
const logger = require('../logger');
const { loadConfig } = require('../../config/loader');

class RedisStore {
  constructor() {
    const config = loadConfig().redis;
    const url = `redis://${config.password ? `:${config.password}@` : ''}${config.host}:${config.port}/${config.db}`;

    this.client = createClient({ url });
    this.keyPrefix = config.keyPrefix;

    this.client.on('error', (err) => logger.error(`Redis Error: ${err}`));
    this.client.on('reconnecting', () => logger.warn('Redis reconnecting...'));
  }

  async connect() {
    await this.client.connect();
    logger.info('Connected to Redis.');
  }

  async disconnect() {
    await this.client.quit();
  }

  async clearAll() {
    const keys = await this.client.keys(`${this.keyPrefix}*`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
    logger.info('Redis store cleared.');
  }

  async saveRecord(record) {
    const serialized = JSON.stringify(record, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
    await this.client.rPush(`${this.keyPrefix}records`, serialized);
    await this.client.set(`${this.keyPrefix}lastSeq`, record.seq.toString());
  }

  async saveSession(sessionId) {
    await this.client.set(`${this.keyPrefix}session`, sessionId);
  }

  async getSession() {
    return await this.client.get(`${this.keyPrefix}session`);
  }

  async getLastSequence() {
    const seqStr = await this.client.get(`${this.keyPrefix}lastSeq`);
    return seqStr ? BigInt(seqStr) : 0n;
  }

  async loadAllRecords() {
    const recordsStr = await this.client.lRange(`${this.keyPrefix}records`, 0, -1);
    return recordsStr.map(str => {
      const obj = JSON.parse(str);
      obj.seq = BigInt(obj.seq);
      return obj;
    });
  }
}

module.exports = new RedisStore();
