const logSuccess = (message) => {
  console.log(`[32m${message}[39m`);
};

const logError = (message) => {
  console.log(`[31m${message}[39m`);
};

const logWarn = (message) => {
  console.log(`[33m${message}[39m`);
};

const logInfo = (message) => {
  console.log(message);
};

const logFatal = (message) => {
  console.log(`[41m[33m${message}[39m[49m`);
};

module.exports = { logSuccess, logError, logFatal, logWarn, logInfo };
