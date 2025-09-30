// Configuration pour le build de production
const path = require("path");

module.exports = {
  // Configuration du build
  build: {
    // Optimisations pour la production
    minify: true,
    sourcemap: false,
    // Compression des assets
    compress: true,
    // Cache busting
    hash: true,
  },

  // Configuration de l'API
  api: {
    // URL de base pour l'API
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
    // Timeout des requêtes
    timeout: 30000,
    // Retry automatique
    retry: 3,
  },

  // Configuration PWA
  pwa: {
    enabled: process.env.REACT_APP_PWA_ENABLED === "true",
    name: "Portail des Appels d'Offres",
    shortName: "APLOFR",
    themeColor: "#f67800",
    backgroundColor: "#ffffff",
  },

  // Configuration des assets
  assets: {
    // Dossier des images
    images: "/static/media/",
    // Dossier des icônes
    icons: "/static/icons/",
    // Taille maximale des fichiers
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  // Configuration de sécurité
  security: {
    // Headers de sécurité
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  },
};
