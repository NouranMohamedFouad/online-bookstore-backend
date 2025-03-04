import {transports as _transports, createLogger, format} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const {combine, timestamp, printf, json} = format;

// Custom log format
const logFormat = printf(({level, message, timestamp, ...metadata}) => {
  return `${timestamp} [${level}]: ${message} ${JSON.stringify(metadata)}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new DailyRotateFile({
      filename: 'requests-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new _transports.Console({
      format: combine(timestamp(), logFormat)
    })
  ]
});

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

export default requestLogger;
