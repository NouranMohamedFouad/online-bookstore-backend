import {transports as _transports, createLogger} from 'winston';

const logger = createLogger({
  level: 'info',
  transports: [
    new _transports.File({filename: 'requests.log'}),
    new _transports.Console()
  ]
});

const requestLogger = (req, _res, next) => {
  logger.info(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};

export default requestLogger;
