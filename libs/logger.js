const logger = require('pino')()
const moment = require('moment')

let error = (errormessage, errororigin, errorlevel) => {
  let time = moment()

  let error= {
    times: time,
    errormessage: errormessage,
    errororigin: errororigin,
    errorlevel: errorlevel
  }

  logger.error(error)
  return error
} 

let capture = (message, origin, important) => {
  let time = moment()

  let info = {
    time: time,
    message: message,
    origin: origin,
    level: important
  }
  logger.info(info)
  return info
} 

module.exports = {
  error: error,
  info: capture
}