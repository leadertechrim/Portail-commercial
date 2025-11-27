/**
 * Système de logging conditionnel
 * Les logs ne s'affichent qu'en mode développement
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log d'information (uniquement en développement)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Avertissement (uniquement en développement)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Erreur (toujours affiché, même en production)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Debug (uniquement en développement)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info importante (toujours affiché)
   */
  info: (...args) => {
    console.log(...args);
  },
};

export default logger;
