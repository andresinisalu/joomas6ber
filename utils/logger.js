const split = require('split')
const winston = require('winston')
const wcf = require('winston-console-formatter')

const { formatter, timestamp } = wcf()

const logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './logs/server.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      formatter,
      timestamp,
      prettyPrint: true,
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
})
logger.info('Logging is enabled.')

module.exports = logger
module.exports.stream = split().on('data', message => logger.info(message))