const endianness = require('../endianness');

const encoders = {
  // 'L'
  encodeLoginRequest: (username, password, requestedSession, requestedSequenceNumber) => {
    const payloadLen = 47; // 1 (type) + 6 (username) + 10 (password) + 10 (session) + 20 (seq) = 47
    const buf = Buffer.alloc(2 + payloadLen);
    endianness.writeUInt16(buf, payloadLen, 0);
    buf.write('L', 2, 1, 'ascii');
    buf.write(username.padEnd(6, ' '), 3, 6, 'ascii');
    buf.write(password.padEnd(10, ' '), 9, 10, 'ascii');
    buf.write(requestedSession.padStart(10, ' '), 19, 10, 'ascii'); // right aligned / left padded per spec
    buf.write(requestedSequenceNumber.toString().padStart(20, ' '), 29, 20, 'ascii'); // right aligned / left padded numeric
    return buf;
  },
  // 'R'
  encodeClientHeartbeat: () => {
    const buf = Buffer.alloc(3);
    endianness.writeUInt16(buf, 1, 0);
    buf.write('R', 2, 1, 'ascii');
    return buf;
  },
  // 'O'
  encodeLogoutRequest: () => {
    const buf = Buffer.alloc(3);
    endianness.writeUInt16(buf, 1, 0);
    buf.write('O', 2, 1, 'ascii');
    return buf;
  },
  // 'U'
  encodeUnsequencedData: (payloadBuf) => {
    const buf = Buffer.alloc(2 + 1 + payloadBuf.length);
    endianness.writeUInt16(buf, 1 + payloadBuf.length, 0);
    buf.write('U', 2, 1, 'ascii');
    payloadBuf.copy(buf, 3);
    return buf;
  },
  // '+'
  encodeDebug: (text) => {
    const buf = Buffer.alloc(2 + 1 + Buffer.byteLength(text, 'ascii'));
    endianness.writeUInt16(buf, 1 + Buffer.byteLength(text, 'ascii'), 0);
    buf.write('+', 2, 1, 'ascii');
    buf.write(text, 3, 'ascii');
    return buf;
  }
};

const decoders = {
  decode: (type, payload) => {
    // payload includes the type byte? No, framer will separate type and payload.
    // Wait, prompt: "Every logical packet = 2-byte big-endian Packet Length (length of packet type + payload), 1-byte Packet Type, variable payload. Emit { type, payload }" where payload is just the payload or type+payload?
    // Let's assume framer emits `{ type, payload }` where payload is offset 3 onwards.

    if (type === 'A') {
      const session = endianness.readAlpha(payload, 0, 10).trim();
      const nextSequenceNumberStr = endianness.readAlpha(payload, 10, 20).trim();
      return { type, session, nextSequenceNumber: BigInt(nextSequenceNumberStr) };
    } else if (type === 'J') {
      const rejectCode = payload.toString('ascii', 0, 1);
      const reason = rejectCode === 'A' ? 'Not Authorized (invalid username/password)' :
                     rejectCode === 'S' ? 'Session not available (requested session invalid or unavailable)' : 'Unknown reason';
      return { type, rejectCode, reason };
    } else if (type === 'S') {
      return { type, messageBuffer: payload }; // The rest of the payload
    } else if (type === 'U') {
      return { type, messageBuffer: payload };
    } else if (type === 'H') {
      return { type };
    } else if (type === 'Z') {
      return { type };
    } else if (type === '+') {
      return { type, text: payload.toString('ascii') };
    } else {
      return { type, raw: payload };
    }
  }
};

module.exports = { encoders, decoders };
