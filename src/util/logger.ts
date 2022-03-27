/* eslint-disable @typescript-eslint/no-explicit-any */
import log from 'electron-log';
import isDevelopment from './is-development';

if (!isDevelopment) {
  log.transports.console.level = false;
  log.transports.file.level = 'info';
}

const logger = {
  error(...params: any[]) {
    return log.error(...params);
  },
  warn(...params: any[]) {
    return log.warn(...params);
  },

  info(...params: any[]) {
    return log.info(...params);
  },

  verbose(...params: any[]) {
    return log.verbose(...params);
  },

  debug(...params: any[]) {
    return log.debug(...params);
  },

  silly(...params: any[]) {
    return log.silly(...params);
  },
};

export default logger;
