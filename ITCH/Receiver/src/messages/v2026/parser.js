const endianness = require('../../endianness');
const logger = require('../../logger');

// Prices: The lowest valid 8 byte signed integer (-9223372036854775808n or 0x8000000000000000n) means no price available
const NO_PRICE = -9223372036854775808n;

function parsePrice(buf, offset) {
  const p = endianness.readInt64(buf, offset);
  if (p === NO_PRICE) return null;
  return p;
}

function parse(buffer) {
  try {
    const msgType = buffer.toString('ascii', 0, 1);

    switch(msgType) {
      case 'T':
        return {
          msgType,
          seconds: endianness.readInt32(buffer, 1)
        };
      case 'R':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderBookId: endianness.readInt32(buffer, 5),
          symbol: endianness.readAlpha(buffer, 9, 32),
          longName: endianness.readAlpha(buffer, 41, 64),
          isin: endianness.readAlpha(buffer, 105, 12),
          financialProduct: endianness.readInt8(buffer, 117),
          tradingCurrency: endianness.readAlpha(buffer, 118, 3),
          decimalsInPrice: endianness.readInt16(buffer, 121),
          decimalsInNominalValue: endianness.readInt16(buffer, 123),
          roundLotSize: endianness.readInt32(buffer, 125),
          nominalValue: endianness.readInt64(buffer, 129),
          numberOfLegs: endianness.readInt8(buffer, 137),
          underlyingOrderBookId: endianness.readInt32(buffer, 138),
          strikePrice: parsePrice(buffer, 142),
          expirationDate: endianness.readInt32(buffer, 150),
          decimalsInStrikePrice: endianness.readInt16(buffer, 154),
          optionType: endianness.readInt8(buffer, 156),
          decimalsInQuantity: endianness.readInt16(buffer, 157),
          testOrderbook: endianness.readInt8(buffer, 159)
        };
      case 'X':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderBookId: endianness.readInt32(buffer, 5),
          orderBookType: endianness.readInt8(buffer, 9),
          settlementDate: endianness.readInt32(buffer, 10),
          returnDate: endianness.readInt32(buffer, 14),
          referencePrice: parsePrice(buffer, 18),
          recall: endianness.readInt8(buffer, 26),
          haircut: endianness.readInt32(buffer, 27),
          dayCountConvention: endianness.readInt8(buffer, 31)
        };
      case 'M':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderBookId: endianness.readInt32(buffer, 5),
          legOrderBookId: endianness.readInt32(buffer, 9),
          legSide: endianness.readAlpha(buffer, 13, 1),
          legRatio: endianness.readInt32(buffer, 14)
        };
      case 'L':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderBookId: endianness.readInt32(buffer, 5),
          tickSize: endianness.readInt64(buffer, 9),
          priceFrom: parsePrice(buffer, 17),
          priceTo: parsePrice(buffer, 25)
        };
      case 'S':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          event: endianness.readAlpha(buffer, 5, 1)
        };
      case 'O':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderBookId: endianness.readInt32(buffer, 5),
          stateName: endianness.readAlpha(buffer, 9, 20)
        };
      case 'A':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderId: endianness.readInt64(buffer, 5),
          orderBookId: endianness.readInt32(buffer, 13),
          side: endianness.readAlpha(buffer, 17, 1),
          orderBookPosition: endianness.readInt32(buffer, 18),
          quantity: endianness.readInt64(buffer, 22),
          price: parsePrice(buffer, 30),
          exchangeOrderType: endianness.readInt16(buffer, 38),
          quantityCondition: endianness.readInt8(buffer, 40)
        };
      case 'F':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderId: endianness.readInt64(buffer, 5),
          orderBookId: endianness.readInt32(buffer, 13),
          side: endianness.readAlpha(buffer, 17, 1),
          orderBookPosition: endianness.readInt32(buffer, 18),
          quantity: endianness.readInt64(buffer, 22),
          price: parsePrice(buffer, 30),
          exchangeOrderType: endianness.readInt16(buffer, 38),
          quantityCondition: endianness.readInt8(buffer, 40),
          mpid: endianness.readAlpha(buffer, 41, 7)
        };
      case 'E':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderId: endianness.readInt64(buffer, 5),
          orderBookId: endianness.readInt32(buffer, 13),
          side: endianness.readAlpha(buffer, 17, 1),
          quantity: endianness.readInt64(buffer, 18),
          matchId: endianness.readInt64(buffer, 26),
          comboGroupId: endianness.readInt32(buffer, 34),
          owner: endianness.readAlpha(buffer, 38, 7),
          counterparty: endianness.readAlpha(buffer, 45, 7)
        };
      case 'C':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderId: endianness.readInt64(buffer, 5),
          orderBookId: endianness.readInt32(buffer, 13),
          side: endianness.readAlpha(buffer, 17, 1),
          quantity: endianness.readInt64(buffer, 18),
          matchId: endianness.readInt64(buffer, 26),
          comboGroupId: endianness.readInt32(buffer, 34),
          owner: endianness.readAlpha(buffer, 38, 7),
          counterparty: endianness.readAlpha(buffer, 45, 7),
          price: parsePrice(buffer, 52),
          cross: endianness.readAlpha(buffer, 60, 1),
          printable: endianness.readAlpha(buffer, 61, 1)
        };
      case 'D':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderId: endianness.readInt64(buffer, 5),
          orderBookId: endianness.readInt32(buffer, 13),
          side: endianness.readAlpha(buffer, 17, 1)
        };
      case 'P':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          matchId: endianness.readInt64(buffer, 5),
          comboGroupId: endianness.readInt32(buffer, 13),
          side: endianness.readAlpha(buffer, 17, 1),
          quantity: endianness.readInt64(buffer, 18),
          orderBookId: endianness.readInt32(buffer, 26),
          price: parsePrice(buffer, 30),
          owner: endianness.readAlpha(buffer, 38, 7),
          counterparty: endianness.readAlpha(buffer, 45, 7),
          printable: endianness.readAlpha(buffer, 52, 1),
          cross: endianness.readAlpha(buffer, 53, 1)
        };
      case 'Z':
        return {
          msgType,
          nanos: endianness.readInt32(buffer, 1),
          orderBookId: endianness.readInt32(buffer, 5),
          bidQuantity: endianness.readInt64(buffer, 9),
          askQuantity: endianness.readInt64(buffer, 17),
          price: parsePrice(buffer, 25),
          bestBidPrice: parsePrice(buffer, 33),
          bestAskPrice: parsePrice(buffer, 41),
          bestBidQuantity: endianness.readInt64(buffer, 49),
          bestAskQuantity: endianness.readInt64(buffer, 57)
        };
      case 'G':
        return {
          msgType,
          itchSequenceNumber: endianness.readAlpha(buffer, 1, 20)
        };
      default:
        logger.warn(`Unknown v2026 message type: ${msgType}, payload hex: ${buffer.toString('hex')}`);
        return { msgType, raw: buffer.toString('hex') };
    }
  } catch (err) {
    logger.warn(`Failed to parse v2026 message, payload hex: ${buffer.toString('hex')}`);
    return { msgType: 'Unknown', raw: buffer.toString('hex') };
  }
}

module.exports = { parse };
