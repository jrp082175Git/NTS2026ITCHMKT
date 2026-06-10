function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length !== 5) {
    printUsageAndExit();
  }

  const environment = args[0];
  if (environment !== 'PROD' && environment !== 'DR') {
    console.error("Invalid environment parameter.");
    printUsageAndExit();
  }

  const startParam = args[1];
  let freshStart;
  if (startParam === 'START:Y') {
    freshStart = true;
  } else if (startParam === 'START:N') {
    freshStart = false;
  } else {
    console.error("Invalid start parameter.");
    printUsageAndExit();
  }

  const version = args[2];
  if (version !== 'V2026' && version !== 'V2015') {
    console.error("Invalid version parameter.");
    printUsageAndExit();
  }

  const displayParam = args[3];
  let display;
  if (displayParam === 'DISPLAY:ON') {
    display = true;
  } else if (displayParam === 'DISPLAY:OFF') {
    display = false;
  } else {
    console.error("Invalid display parameter.");
    printUsageAndExit();
  }

  const userInitials = args[4].split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (userInitials.length === 0) {
    console.error("Invalid user initials parameter.");
    printUsageAndExit();
  }

  return Object.freeze({
    environment,
    freshStart,
    version,
    display,
    userInitials
  });
}

function printUsageAndExit() {
  console.error("Usage: node src/main.js <PROD|DR> <START:Y|START:N> <V2026|V2015> <DISPLAY:ON|DISPLAY:OFF> <USER_INITIALS>");
  console.error("Example: node src/main.js PROD START:Y V2026 DISPLAY:ON JDC,MAR");
  process.exit(1);
}

module.exports = parseArgs();
