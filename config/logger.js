const winston = require('winston');

function createLogger(label = 'app') {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, label }) => `${timestamp} [${label}] ${level}: ${message}`)
    ),
    transports: [new winston.transports.Console()],
  });
}

module.exports = { createLogger };
