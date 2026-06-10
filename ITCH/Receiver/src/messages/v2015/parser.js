const endianness = require('../../endianness');
const logger = require('../../logger');

// v2015 X-stream uses UNSIGNED big-endian values and timestamps are nanos since last second
function parse(buffer) {
  try {
    const msgType = buffer.toString('ascii', 0, 1);

    switch(msgType) {
      case 'T':
        return {
          msgType,
          second: endianness.readUInt32(buffer, 1)
        };
      case 'S':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          group: endianness.readAlpha(buffer, 5, 8),
          eventCode: endianness.readAlpha(buffer, 13, 1),
          orderbook: endianness.readUInt32(buffer, 14)
        };
      case 's':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          group: endianness.readAlpha(buffer, 5, 8),
          eventCode: endianness.readAlpha(buffer, 13, 1),
          orderbook: endianness.readUInt32(buffer, 14),
          scheduledTime: endianness.readUInt32(buffer, 18)
        };
      case 'L':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          tickSizeTableId: endianness.readUInt32(buffer, 5),
          tickSize: endianness.readUInt32(buffer, 9),
          priceStart: endianness.readUInt32(buffer, 13)
        };
      case 'M':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          tickSizeTableId: endianness.readUInt32(buffer, 5),
          tickSize: endianness.readUInt64(buffer, 9),
          quantityStart: endianness.readUInt64(buffer, 17)
        };
      case 'R':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderbook: endianness.readUInt32(buffer, 5),
          priceType: endianness.readAlpha(buffer, 9, 1),
          isin: endianness.readAlpha(buffer, 10, 12),
          secCode: endianness.readAlpha(buffer, 22, 12),
          currency: endianness.readAlpha(buffer, 34, 3),
          group: endianness.readAlpha(buffer, 37, 8),
          lotSize: endianness.readUInt64(buffer, 45),
          quantityTickSizeTableId: endianness.readUInt32(buffer, 53),
          priceTickSizeTableId: endianness.readUInt32(buffer, 57),
          priceDecimals: endianness.readUInt32(buffer, 61),
          delistingDate: endianness.readUInt32(buffer, 65),
          delistingTime: endianness.readUInt32(buffer, 69),
          instrumentType: endianness.readAlpha(buffer, 73, 1),
          shares: endianness.readUInt64(buffer, 74),
          productCode: endianness.readAlpha(buffer, 82, 8)
        };
      case 'k':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderbook: endianness.readUInt32(buffer, 5),
          shortSellEligible: endianness.readAlpha(buffer, 9, 1),
          highCollar: endianness.readUInt32(buffer, 10),
          lowCollar: endianness.readUInt32(buffer, 14),
          cbLimitUpPct: endianness.readUInt32(buffer, 18),
          cbLimitDownPct: endianness.readUInt32(buffer, 22),
          cbLimitDecimals: endianness.readUInt32(buffer, 26)
        };
      case 'Y':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          indexOrderbook: endianness.readUInt32(buffer, 5),
          memberOrderbook: endianness.readUInt32(buffer, 9),
          indexMemberWeight: endianness.readUInt64(buffer, 13)
        };
      case 'Z':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          indexOrderbook: endianness.readUInt32(buffer, 5),
          value: endianness.readUInt64(buffer, 9)
        };
      case 'H':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderbook: endianness.readUInt32(buffer, 5),
          tradingState: endianness.readAlpha(buffer, 9, 1),
          reason: endianness.readAlpha(buffer, 10, 1)
        };
      case 'A':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderNumber: endianness.readUInt64(buffer, 5),
          orderVerb: endianness.readAlpha(buffer, 13, 1),
          quantity: endianness.readUInt64(buffer, 14),
          orderbook: endianness.readUInt32(buffer, 22),
          price: endianness.readUInt32(buffer, 26)
        };
      case 'E':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderNumber: endianness.readUInt64(buffer, 5),
          executedQuantity: endianness.readUInt64(buffer, 13),
          matchNumber: endianness.readUInt64(buffer, 21)
        };
      case 'e':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderNumber: endianness.readUInt64(buffer, 5),
          executedQuantity: endianness.readUInt64(buffer, 13),
          matchNumber: endianness.readUInt64(buffer, 21),
          passiveBrokerId: endianness.readAlpha(buffer, 29, 4),
          activeBrokerId: endianness.readAlpha(buffer, 33, 4)
        };
      case 'C':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderNumber: endianness.readUInt64(buffer, 5),
          executedQuantity: endianness.readUInt64(buffer, 13),
          matchNumber: endianness.readUInt64(buffer, 21),
          printable: endianness.readAlpha(buffer, 29, 1),
          executionPrice: endianness.readUInt32(buffer, 30)
        };
      case 'c':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderNumber: endianness.readUInt64(buffer, 5),
          executedQuantity: endianness.readUInt64(buffer, 13),
          matchNumber: endianness.readUInt64(buffer, 21),
          printable: endianness.readAlpha(buffer, 29, 1),
          executionPrice: endianness.readUInt32(buffer, 30),
          passiveBrokerId: endianness.readAlpha(buffer, 34, 4),
          activeBrokerId: endianness.readAlpha(buffer, 38, 4)
        };
      case 'B':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          matchNumber: endianness.readUInt64(buffer, 5),
          reason: endianness.readAlpha(buffer, 13, 1)
        };
      case 'D':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderNumber: endianness.readUInt64(buffer, 5)
        };
      case 'U':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          originalOrderNumber: endianness.readUInt64(buffer, 5),
          newOrderNumber: endianness.readUInt64(buffer, 13),
          quantity: endianness.readUInt64(buffer, 21),
          price: endianness.readUInt32(buffer, 29)
        };
      case 'I':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          theoreticalAuctionQuantity: endianness.readUInt64(buffer, 5),
          orderbook: endianness.readUInt32(buffer, 13),
          bestBid: endianness.readUInt32(buffer, 17),
          bestOffer: endianness.readUInt32(buffer, 21),
          theoreticalAuctionPrice: endianness.readUInt32(buffer, 25),
          auctionType: endianness.readAlpha(buffer, 29, 1)
        };
      case 'P':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          executedQuantity: endianness.readUInt64(buffer, 5),
          orderbook: endianness.readUInt32(buffer, 13),
          printable: endianness.readAlpha(buffer, 17, 1),
          executionPrice: endianness.readUInt32(buffer, 18),
          matchNumber: endianness.readUInt64(buffer, 22),
          tradeIndicator: endianness.readAlpha(buffer, 30, 1)
        };
      case 'p':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          executedQuantity: endianness.readUInt64(buffer, 5),
          orderbook: endianness.readUInt32(buffer, 13),
          printable: endianness.readAlpha(buffer, 17, 1),
          executionPrice: endianness.readUInt32(buffer, 18),
          matchNumber: endianness.readUInt64(buffer, 22),
          tradeIndicator: endianness.readAlpha(buffer, 30, 1),
          buyBrokerId: endianness.readAlpha(buffer, 31, 4),
          sellBrokerId: endianness.readAlpha(buffer, 35, 4)
        };
      case 'f':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          productCode: endianness.readAlpha(buffer, 5, 8),
          ownershipRuleId: endianness.readAlpha(buffer, 13, 2),
          sign: endianness.readAlpha(buffer, 15, 1),
          foreignSharesAvailable: endianness.readUInt64(buffer, 16)
        };
      case 'O':
        return {
          msgType,
          timestamp: endianness.readUInt32(buffer, 1),
          orderbook: endianness.readUInt32(buffer, 5),
          bestBidPrice: endianness.readUInt32(buffer, 9),
          bestBidSize: endianness.readUInt64(buffer, 13),
          bestOfferPrice: endianness.readUInt32(buffer, 21),
          bestOfferSize: endianness.readUInt64(buffer, 25)
        };
      case 'N': {
        const timestamp = endianness.readUInt32(buffer, 1);
        const orderbook = endianness.readUInt32(buffer, 5);
        const newsId = endianness.readUInt32(buffer, 9);
        const firmId = endianness.readAlpha(buffer, 13, 30);

        let offset = 43;
        const readNullTerminated = () => {
          const start = offset;
          while (offset < buffer.length && buffer[offset] !== 0) {
            offset++;
          }
          const str = buffer.toString('ascii', start, offset);
          offset++; // skip null
          return str;
        };

        const title = readNullTerminated();
        const reference = readNullTerminated();
        const newsText = readNullTerminated();

        return {
          msgType, timestamp, orderbook, newsId, firmId, title, reference, newsText
        };
      }
      default:
        logger.warn(`Unknown v2015 message type: ${msgType}, payload hex: ${buffer.toString('hex')}`);
        return { msgType, raw: buffer.toString('hex') };
    }
  } catch (err) {
    logger.warn(`Failed to parse v2015 message, payload hex: ${buffer.toString('hex')}`);
    return { msgType: 'Unknown', raw: buffer.toString('hex') };
  }
}

module.exports = { parse };
