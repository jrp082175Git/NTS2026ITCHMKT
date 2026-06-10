const { EventEmitter } = require('events');
const endianness = require('../endianness');

class Framer extends EventEmitter {
  constructor() {
    super();
    this.buffer = Buffer.alloc(0);
  }

  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.processBuffer();
  }

  processBuffer() {
    while (this.buffer.length >= 2) {
      const packetLength = endianness.readUInt16(this.buffer, 0);

      // If we don't have the full packet yet, wait
      if (this.buffer.length < 2 + packetLength) {
        break;
      }

      // We have a full packet
      const type = this.buffer.toString('ascii', 2, 3);

      // Payload is anything after the type, up to the end of this packet
      let payload = Buffer.alloc(0);
      if (packetLength > 1) {
        payload = this.buffer.slice(3, 2 + packetLength);
      }

      this.emit('packet', { type, payload });

      // Remove the processed packet from the buffer
      this.buffer = this.buffer.slice(2 + packetLength);
    }
  }
}

module.exports = Framer;
