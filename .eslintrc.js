module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Désactiver les règles qui peuvent causer des problèmes de build
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
