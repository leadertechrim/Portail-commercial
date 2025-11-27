import { useState, useCallback } from "react";
import { checkSourceDuplicate } from "../api";

/**
 * Hook personnalisé pour valider les sources et détecter les doublons
 * Utilise la route /api/sources/check-duplicate du backend
 * 
 * @returns {Object} Objet contenant :
 *   - checkDuplicate: fonction pour vérifier les doublons
 *   - validationResult: résultat de la dernière validation
 *   - isValidating: booléen indiquant si une validation est en cours
 *   - validationError: erreur éventuelle lors de la validation
 *   - clearValidation: fonction pour réinitialiser l'état de validation
 */
export const useSourceValidation = () => {
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  /**
   * Vérifie si une source est un doublon
   * @param {Object} sourceData - Données de la source à vérifier
   * @param {string} sourceData.nom_entite - Nom de l'entité
   * @param {string} sourceData.url - URL de la source
   * @param {string} [sourceData.source_id] - ID de la source (pour exclure lors d'une modification)
   * @returns {Promise<Object>} Résultat de la validation
   */
  const checkDuplicate = useCallback(async (sourceData) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      const error = "Token manquant";
      setValidationError(error);
      return { error };
    }

    if (!sourceData.nom_entite || !sourceData.url) {
      const error = "Nom d'entité et URL sont requis";
      setValidationError(error);
      return { error };
    }

    try {
      setIsValidating(true);
      setValidationError(null);

      const result = await checkSourceDuplicate(token, {
        nom_entite: sourceData.nom_entite,
        url: sourceData.url,
        source_id: sourceData.source_id, // Optionnel, pour les modifications
      });

      console.log("🔍 Résultat de validation:", result);
      setValidationResult(result);

      return result;
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      setValidationError(err.message);
      return { error: err.message };
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Réinitialise l'état de validation
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setValidationError(null);
    setIsValidating(false);
  }, []);

  /**
   * Vérifie si la source est valide (pas de doublon)
   * @returns {boolean} true si valide, false sinon
   */
  const isValid = useCallback(() => {
    if (!validationResult) return true; // Pas encore validé
    return !validationResult.isDuplicate && 
           !validationResult.nom_entite_exists && 
           !validationResult.url_exists;
  }, [validationResult]);

  /**
   * Retourne les messages d'erreur de validation
   * @returns {Array<string>} Liste des messages d'erreur
   */
  const getValidationMessages = useCallback(() => {
    const messages = [];
    
    if (validationResult?.nom_entite_exists) {
      messages.push(`Cette entité "${validationResult.nom_entite || 'inconnue'}" existe déjà`);
    }
    
    if (validationResult?.url_exists) {
      messages.push(`Cette URL existe déjà${validationResult.existing_entity ? ` pour l'entité "${validationResult.existing_entity}"` : ''}`);
    }
    
    if (validationResult?.message && validationResult.isDuplicate) {
      messages.push(validationResult.message);
    }
    
    if (validationError) {
      messages.push(validationError);
    }
    
    return messages;
  }, [validationResult, validationError]);

  return {
    checkDuplicate,
    validationResult,
    isValidating,
    validationError,
    clearValidation,
    isValid,
    getValidationMessages,
  };
};

export default useSourceValidation;
