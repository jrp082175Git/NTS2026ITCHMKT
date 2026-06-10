# Receiver Application

Node.js client for the PSE New Trading System ITCH Server Feed (SoupBinTCP transport).

## Prerequisites
- Node.js 18+
- Redis 4+

## Setup
1. Run `npm install` to install dependencies (Redis).
2. Start Redis server locally or configure `config/config.json` to point to a remote Redis instance.

## Configuration
Edit `config/config.json`:
- `PROD` and `DR`: Configure `host` and `port` for ITCH and GLIMPSE endpoints.
- `credentials`: Set `username` and `password` (padded correctly up to 6 and 10 chars respectively).
- `soupbintcp`: Timings for heartbeats and timeouts.
- `redis`: Redis connection parameters (`host`, `port`, `db`, etc.).
- `logging`: Log directory path.

## Usage
Run the application with the following 5 positional parameters:
```
node src/main.js <PROD|DR> <START:Y|START:N> <V2026|V2015> <DISPLAY:ON|DISPLAY:OFF> <USER_INITIALS>
```

**Example:**
```
node src/main.js PROD START:Y V2026 DISPLAY:ON JDC
```

### Parameters:
1. **Environment (`PROD` | `DR`)**: Selects the configuration block to use.
2. **Start Mode (`START:Y` | `START:N`)**:
   - `START:Y`: Fresh start. Clears memory and Redis, logs in with sequence 1.
   - `START:N`: Resume. Loads from Redis and resumes from the last sequence + 1.
3. **Version (`V2026` | `V2015`)**:
   - `V2026`: PSE ITCH v1.0 (2026) message layouts.
   - `V2015`: PSE Equities Feed v2.2 (2015) message layouts.
4. **Display (`DISPLAY:ON` | `DISPLAY:OFF`)**:
   - `DISPLAY:ON`: Prints received packets and messages to the console in yellow.
5. **User Initials**: Comma-separated user initials to be embedded in log file names (e.g., `JDC` or `JDC,MAR`).

## Testing
Run `npm run mock` to start a mock SoupBinTCP server locally, then connect using `npm start -- PROD START:Y V2026 DISPLAY:ON JDC`.
