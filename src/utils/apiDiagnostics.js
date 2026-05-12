/**
 * Utilitaires de diagnostic pour les problèmes de connexion API
 */

import { logger } from "./logger";

let API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://back-portail-commercial-32528505fc5a.herokuapp.com";

// Correction automatique de l'URL si elle contient 0.0.0.0
// IMPORTANT: 0.0.0.0 est utilisé côté serveur Flask pour écouter sur toutes les interfaces
// Mais côté client (navigateur), on DOIT utiliser localhost ou 127.0.0.1
if (API_BASE_URL && API_BASE_URL.includes("0.0.0.0")) {
  API_BASE_URL = API_BASE_URL.replace("0.0.0.0", "localhost");
}

export { API_BASE_URL };

/**
 * Teste la connexion au serveur API
 * @returns {Promise<Object>} Résultat du test de connexion
 */
export const testAPIConnection = async () => {
  const results = {
    success: false,
    url: API_BASE_URL,
    errors: [],
    details: {},
  };

  try {
    // Test 1: Vérifier si l'URL est accessible
    logger.debug("Test de connexion à:", API_BASE_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      results.details.status = response.status;
      results.details.statusText = response.statusText;
      results.details.ok = response.ok;

      if (response.ok || response.status === 404) {
        // 404 est OK car cela signifie que le serveur répond
        results.success = true;
        results.details.message = "Le serveur est accessible";
      } else {
        results.errors.push(
          `Le serveur répond avec le statut: ${response.status}`
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        results.errors.push(
          "Timeout: Le serveur ne répond pas dans les 10 secondes"
        );
      } else if (fetchError.message === "Failed to fetch") {
        results.errors.push("Impossible de se connecter au serveur");
        results.errors.push("Causes possibles:");
        results.errors.push("- Le serveur est hors ligne");
        results.errors.push("- Problème de réseau ou pare-feu");
        results.errors.push("- URL incorrecte");
        results.errors.push("- Problème CORS");
      } else {
        results.errors.push(fetchError.message);
      }
    }

    // Test 2: Vérifier la configuration
    results.details.config = {
      apiUrl: API_BASE_URL,
      envUrl: process.env.REACT_APP_API_URL || "Non définie",
      isProduction: process.env.NODE_ENV === "production",
    };

    // Test 3: Vérifier la connectivité réseau de base
    try {
      const networkTest = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
      });
      results.details.networkAvailable = true;
    } catch (e) {
      results.details.networkAvailable = false;
      results.errors.push("Aucune connexion internet détectée");
    }
  } catch (error) {
    results.errors.push(`Erreur lors du diagnostic: ${error.message}`);
  }

  return results;
};

/**
 * Affiche un rapport de diagnostic dans la console
 */
export const printDiagnosticReport = async () => {
  if (process.env.NODE_ENV === "development") {
    console.group("🔍 Diagnostic de connexion API");
  }
  const results = await testAPIConnection();

  logger.info("URL de l'API:", results.url);
  logger.info("Statut:", results.success ? "✅ Connecté" : "❌ Non connecté");

  if (results.errors.length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.group("❌ Erreurs détectées:");
    }
    results.errors.forEach((error) => logger.error("  -", error));
    if (process.env.NODE_ENV === "development") {
      console.groupEnd();
    }
  }

  logger.debug("Détails:", results.details);
  if (process.env.NODE_ENV === "development") {
    console.groupEnd();
  }

  return results;
};

/**
 * Suggestions pour résoudre les problèmes de connexion
 */
export const getConnectionSuggestions = (error) => {
  const suggestions = [];

  if (error?.message?.includes("Failed to fetch")) {
    suggestions.push({
      title: "Vérifier l'URL du serveur",
      action: `Vérifiez que l'URL ${API_BASE_URL} est correcte`,
    });
    suggestions.push({
      title: "Vérifier la connexion internet",
      action: "Assurez-vous d'être connecté à internet",
    });
    suggestions.push({
      title: "Vérifier le pare-feu",
      action: "Vérifiez que votre pare-feu n'bloque pas les connexions",
    });
    suggestions.push({
      title: "Vérifier CORS",
      action: "Le serveur doit autoriser les requêtes depuis votre domaine",
    });
  }

  if (error?.message?.includes("timeout")) {
    suggestions.push({
      title: "Le serveur est lent",
      action: "Le serveur prend trop de temps à répondre. Réessayez plus tard.",
    });
  }

  return suggestions;
};

export default {
  testAPIConnection,
  printDiagnosticReport,
  getConnectionSuggestions,
};
