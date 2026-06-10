const endianness = require('../endianness');

const encoders = {
  // 'L'
  encodeLoginRequest: (username, password, requestedSession, requestedSequenceNumber) => {
    const payloadLen = 46; // 1 + 6 + 10 + 10 + 20 - 1 (type is 1)
    const buf = Buffer.alloc(2 + payloadLen);
    endianness.writeUInt16(buf, payloadLen, 0);
    buf.write('L', 2, 1, 'ascii');
    endianness.writeAlpha(buf, username, 3, 6);
    endianness.writeAlpha(buf, password, 9, 10);
    endianness.writeAlpha(buf, requestedSession, 19, 10);
    endianness.writeAlpha(buf, requestedSequenceNumber.toString().padStart(20, ' '), 29, 20); // Sequence number is ASCII numeric, left-padded per spec usually, but prompt says "Requested Sequence Number (offset 29, len 20, ASCII numeric; 1 for fresh start; 0 means 'start at most recent')" and "Login Request: ... Requested Session ... left-padded with spaces". We pad right or left. We left-pad sequence, and Requested Session left-padded. Oh wait, "Requested Session (offset 19, len 10, blanks to join the currently active session, or a specific session ID left-padded with spaces)".
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
