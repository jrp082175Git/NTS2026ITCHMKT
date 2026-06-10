const net = require('net');
const { EventEmitter } = require('events');
const { encoders, decoders } = require('./packets');
const Framer = require('./framer');
const logger = require('../logger');
const display = require('../display');
const { loadConfig } = require('../../config/loader');

class SoupBinTCPClient extends EventEmitter {
  constructor(host, port, credentials, sessionId, requestedSequenceNumber) {
    super();
    this.host = host;
    this.port = port;
    this.credentials = credentials;
    this.sessionId = sessionId;
    this.requestedSequenceNumber = BigInt(requestedSequenceNumber);
    this.config = loadConfig().soupbintcp;

    this.socket = null;
    this.framer = null;

    this.clientHeartbeatInterval = null;
    this.serverSilenceTimeout = null;
    this.reconnectTimer = null;
    this.loginTimeout = null;

    this.lastSentTime = 0;
    this.lastReceivedTime = 0;
    this.sequenceNumber = this.requestedSequenceNumber;
    this.isConnected = false;
    this.isLoggingIn = false;
    this.isLoggedOut = false;
  }

  connect() {
    if (this.isLoggedOut) return;

    logger.info(`Connecting to ${this.host}:${this.port}...`);
    this.socket = net.createConnection({ host: this.host, port: this.port }, () => {
      logger.info(`Connected. Sending Login Request (session: '${this.sessionId}', seq: ${this.requestedSequenceNumber})...`);
      this.isConnected = true;
      this.framer = new Framer();
      this.framer.on('packet', this.handlePacket.bind(this));

      this.resetTimers();

      const loginReq = encoders.encodeLoginRequest(
        this.credentials.username,
        this.credentials.password,
        this.sessionId.padEnd(10, ' '),
        this.requestedSequenceNumber.toString()
      );
      this.send(loginReq);

      this.isLoggingIn = true;
      this.loginTimeout = setTimeout(() => {
        if (this.isLoggingIn) {
          logger.warn("Login response timeout");
          this.destroySocket('login timeout');
        }
      }, this.config.loginResponseTimeoutMs);
    });

    this.socket.on('data', (data) => {
      this.lastReceivedTime = Date.now();
      this.resetServerSilenceTimeout();
      if (this.framer) this.framer.push(data);
    });

    this.socket.on('error', (err) => {
      logger.error(`Socket error: ${err.message}`);
    });

    this.socket.on('close', () => {
      this.isConnected = false;
      this.clearTimers();
      if (!this.isLoggedOut) {
        logger.warn('Socket closed. Emitting linkDown.');
        this.emit('linkDown');
        this.scheduleReconnect();
      }
    });
  }

  handlePacket(rawPacket) {
    display.packet(rawPacket);
    const packet = decoders.decode(rawPacket.type, rawPacket.payload);

    if (this.isLoggingIn) {
      if (packet.type === 'A') {
        clearTimeout(this.loginTimeout);
        this.isLoggingIn = false;

        if (packet.nextSequenceNumber === 1n && this.requestedSequenceNumber > 1n) {
          logger.warn("24x7 mode unsolicited session reset. Sequence is 1.");
          this.sequenceNumber = 1n;
          this.sessionId = packet.session;
          this.emit('sessionReset');
        } else {
          this.sessionId = packet.session;
          this.sequenceNumber = packet.nextSequenceNumber;
        }

        logger.info(`Login Accepted. Session: ${this.sessionId}, Next Seq: ${this.sequenceNumber}`);
        this.emit('loginAccepted', { sessionId: this.sessionId, nextSequenceNumber: this.sequenceNumber });
      } else if (packet.type === 'J') {
        clearTimeout(this.loginTimeout);
        this.isLoggingIn = false;
        logger.error(`Login Rejected: ${packet.reason}`);
        this.emit('loginRejected', packet);
        this.isLoggedOut = true; // Stop reconnect loop on credential failure
        this.socket.destroy();
      }
    } else {
      if (packet.type === 'S') {
        this.emit('message', { sequenceNumber: this.sequenceNumber, payload: packet.messageBuffer });
        this.sequenceNumber++;
      } else if (packet.type === 'Z') {
        logger.info("End of Session received");
        this.emit('endOfSession');
      } else if (packet.type === 'H') {
        // Just heartbeat
      } else if (packet.type === 'U') {
        // Unsequenced
      } else if (packet.type === '+') {
        logger.info(`Server Debug: ${packet.text}`);
      }
    }
  }

  send(buffer) {
    if (this.isConnected && this.socket) {
      this.socket.write(buffer);
      this.lastSentTime = Date.now();
      this.resetClientHeartbeatInterval();
    }
  }

  resetTimers() {
    this.resetClientHeartbeatInterval();
    this.resetServerSilenceTimeout();
  }

  clearTimers() {
    clearInterval(this.clientHeartbeatInterval);
    clearTimeout(this.serverSilenceTimeout);
    clearTimeout(this.loginTimeout);
  }

  resetClientHeartbeatInterval() {
    clearInterval(this.clientHeartbeatInterval);
    this.clientHeartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastSentTime >= this.config.clientHeartbeatIntervalMs) {
        this.send(encoders.encodeClientHeartbeat());
      }
    }, 100); // Check frequently
  }

  resetServerSilenceTimeout() {
    clearTimeout(this.serverSilenceTimeout);
    this.serverSilenceTimeout = setTimeout(() => {
      logger.warn('Server silence timeout');
      this.destroySocket('server silence');
    }, this.config.serverSilenceTimeoutMs);
  }

  destroySocket(reason) {
    if (this.socket) {
      this.socket.destroy(new Error(reason));
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.isLoggedOut) return;
    logger.info(`Reconnecting in ${this.config.reconnectDelayMs}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.requestedSequenceNumber = this.sequenceNumber; // Resume from last
      this.connect();
    }, this.config.reconnectDelayMs);
  }

  logout() {
    this.isLoggedOut = true;
    this.clearTimers();
    if (this.isConnected) {
      logger.info('Sending Logout Request and closing socket');
      this.send(encoders.encodeLogoutRequest());
      this.socket.end();
    }
  }
}

module.exports = SoupBinTCPClient;
