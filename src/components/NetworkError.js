import React, { useState } from "react";
import { FaExclamationTriangle, FaRedo, FaWifi, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { testAPIConnection, API_BASE_URL } from "../utils/apiDiagnostics";
import "./NetworkError.css";

const NetworkError = ({ error, onRetry, title = "Erreur de connexion" }) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  const isNetworkError =
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("Impossible de se connecter") ||
    error?.message?.includes("connexion internet");

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const result = await testAPIConnection();
      setDiagnosticResult(result);
      console.log("🔍 Résultat du diagnostic:", result);
    } catch (err) {
      console.error("Erreur lors du diagnostic:", err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="network-error-container">
      <div className="network-error-content">
        <div className="network-error-icon">
          {isNetworkError ? (
            <FaWifi className="wifi-icon" />
          ) : (
            <FaExclamationTriangle className="error-icon" />
          )}
        </div>
        <h3 className="network-error-title">{title}</h3>
        <p className="network-error-message">
          {error?.message ||
            "Une erreur s'est produite lors de la communication avec le serveur."}
        </p>

        {/* Informations sur l'URL de l'API */}
        <div className="network-error-api-info">
          <FaInfoCircle /> URL du serveur: <code>{API_BASE_URL}</code>
        </div>

        {isNetworkError && (
          <div className="network-error-suggestions">
            <p>Vérifiez :</p>
            <ul>
              <li>Votre connexion internet</li>
              <li>Que le serveur est accessible</li>
              <li>Vos paramètres de pare-feu ou proxy</li>
              <li>Que l'URL du serveur est correcte</li>
            </ul>
          </div>
        )}

        {/* Résultat du diagnostic */}
        {diagnosticResult && (
          <div className={`network-error-diagnostic ${diagnosticResult.success ? "success" : "error"}`}>
            <h4>Résultat du diagnostic :</h4>
            {diagnosticResult.success ? (
              <p className="success-message">✅ Le serveur est accessible</p>
            ) : (
              <div>
                <p className="error-message">❌ Problème de connexion détecté</p>
                {diagnosticResult.errors.length > 0 && (
                  <ul>
                    {diagnosticResult.errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <div className="network-error-actions">
          {onRetry && (
            <button className="network-error-retry-btn" onClick={onRetry}>
              <FaRedo /> Réessayer
            </button>
          )}
          <button
            className="network-error-diagnose-btn"
            onClick={handleDiagnose}
            disabled={isDiagnosing}
          >
            {isDiagnosing ? (
              <>
                <FaSpinner className="spinning" /> Diagnostic en cours...
              </>
            ) : (
              <>
                <FaInfoCircle /> Diagnostiquer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;

