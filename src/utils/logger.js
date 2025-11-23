/**
 * Système de logging conditionnel
 * Les logs ne s'affichent qu'en mode développement
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Toujours logger les erreurs, même en production
    console.error(...args);
  },
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

export default logger;


