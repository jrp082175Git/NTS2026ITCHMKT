const os = require('os');

const isLittleEndian = os.endianness() === 'LE';

// API
const endianness = {
  isLittleEndian,
  logEndianness: () => {
    console.log(`[Endianness] Detected host endianness: ${os.endianness()}`);
  },

  readInt8: (buf, offset) => buf.readInt8(offset),
  readUInt8: (buf, offset) => buf.readUInt8(offset),

  readInt16: (buf, offset) => isLittleEndian ? buf.readInt16BE(offset) : buf.readInt16BE(offset),
  readUInt16: (buf, offset) => isLittleEndian ? buf.readUInt16BE(offset) : buf.readUInt16BE(offset),
  writeUInt16: (buf, value, offset) => isLittleEndian ? buf.writeUInt16BE(value, offset) : buf.writeUInt16BE(value, offset),

  readInt32: (buf, offset) => isLittleEndian ? buf.readInt32BE(offset) : buf.readInt32BE(offset),
  readUInt32: (buf, offset) => isLittleEndian ? buf.readUInt32BE(offset) : buf.readUInt32BE(offset),
  writeUInt32: (buf, value, offset) => isLittleEndian ? buf.writeUInt32BE(value, offset) : buf.writeUInt32BE(value, offset),

  readInt64: (buf, offset) => isLittleEndian ? buf.readBigInt64BE(offset) : buf.readBigInt64BE(offset),
  readUInt64: (buf, offset) => isLittleEndian ? buf.readBigUInt64BE(offset) : buf.readBigUInt64BE(offset),
  writeUInt64: (buf, value, offset) => isLittleEndian ? buf.writeBigUInt64BE(BigInt(value), offset) : buf.writeBigUInt64BE(BigInt(value), offset),

  readAlpha: (buf, offset, len) => {
    return buf.toString('latin1', offset, offset + len).trimRight();
  },
  writeAlpha: (buf, str, offset, len) => {
    const padded = str.padEnd(len, ' ');
    buf.write(padded, offset, len, 'latin1');
  }
};

module.exports = endianness;
