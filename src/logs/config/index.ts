import { createLogger, format, transports } from 'winston';

// Custom format function to handle HTTP request related information
const httpRequestFormat = format.printf(({ timestamp, level, message, meta }) => {
  if (meta && meta.req) {
    const { originalUrl, url, method, query, headers } = meta.req;
    return `${timestamp} [${level}]: ${message}, originalUrl: ${originalUrl}, url: ${url}, method: ${method}, query: ${JSON.stringify(query)}, headers: ${JSON.stringify(headers)}`;
  } else {
    return `${timestamp} [${level}]: ${message}`;
  }
});

// Create a logger instance
const logger = createLogger({
  transports: [
    new transports.Console({
      level: 'error',
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'DD/MM/YYYY - HH:mm:ss' }),
        format.printf(({ timestamp, level, message, meta }) => {
          const httpRequest = meta?.req;
          if (httpRequest) {
            const { originalUrl, url, method, query, headers } = httpRequest;
            return `${timestamp} [${level}]: ${message}, originalUrl: ${originalUrl}, url: ${url}, method: ${method}, query: ${JSON.stringify(query)}, headers: ${JSON.stringify(headers)}`;
          }
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new transports.File({
      filename: './src/logs/system.log',
      level: 'info',
      format: format.combine(format.timestamp({ format: 'DD/MM/YYYY - HH:mm:ss' }), format.json()),
    }),
  ],
});

// Apply custom format function to all transports
logger.transports.forEach(transport => {
  if (transport.format) {
    transport.format = format.combine(transport.format, httpRequestFormat);
  } else {
    transport.format = httpRequestFormat;
  }
});

// Create an error logger instance
export const errorLogger = createLogger({
  transports: [
    new transports.Console({
      level: 'error',
      format: format.combine(format.colorize(), format.json(), format.timestamp({ format: 'DD/MM/YYYY - HH:mm:ss' })),
    }),
    new transports.File({
      filename: './src/logs/error.log',
      level: 'error',
      format: format.combine(format.timestamp({ format: 'DD/MM/YYYY - HH:mm:ss' }), format.json()),
    }),
  ],
});

// Apply custom format function to all error logger transports
errorLogger.transports.forEach(transport => {
  if (transport.format) {
    transport.format = format.combine(transport.format, httpRequestFormat);
  } else {
    transport.format = httpRequestFormat;
  }
});

export default logger;
