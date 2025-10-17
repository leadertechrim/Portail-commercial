import { useState, useEffect, useCallback } from "react";
import { rolesAPI } from "../api";

/**
 * Hook pour la gestion des permissions utilisateur
 * Permet de vérifier les permissions de l'utilisateur connecté
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Charger les permissions de l'utilisateur
  const loadPermissions = useCallback(async () => {
    if (!token) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Essayer de récupérer les permissions depuis l'API
      const userPermissions = await rolesAPI.getCurrentUserPermissions(token);
      // S'assurer que c'est bien un tableau
      const permissionsArray = Array.isArray(userPermissions)
        ? userPermissions
        : [];
      setPermissions(permissionsArray);
    } catch (err) {
      console.warn(
        "Impossible de charger les permissions depuis l'API, utilisation des permissions par défaut:",
        err
      );

      // Fallback: utiliser les permissions par défaut basées sur le rôle
      const defaultPermissions = getDefaultPermissionsForRole(role);
      setPermissions(defaultPermissions);
      setError("Permissions par défaut utilisées");
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param {string} permission - La permission à vérifier
   * @returns {boolean} - True si l'utilisateur a la permission
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return false;

      // Si l'utilisateur est admin, SupAdmin, Admin ou directeur, il a toutes les permissions
      const adminRoles = [
        "admin",
        "Admin",
        "SupAdmin",
        "directeur",
        "Superviseur",
      ];
      if (adminRoles.includes(role)) return true;

      // Vérifier si la permission est dans la liste des permissions de l'utilisateur
      // S'assurer que permissions est bien un tableau
      const permissionsArray = Array.isArray(permissions) ? permissions : [];
      return permissionsArray.includes(permission);
    },
    [permissions, role]
  );

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   * @param {string[]} permissionList - Liste des permissions à vérifier
   * @returns {boolean} - True si l'utilisateur a au moins une permission
   */
  const hasAnyPermission = useCallback(
    (permissionList) => {
      if (!permissionList || !Array.isArray(permissionList)) return false;

      // Si l'utilisateur est admin, SupAdmin, Admin ou directeur, il a toutes les permissions
      const adminRoles = [
        "admin",
        "Admin",
        "SupAdmin",
        "directeur",
        "Superviseur",
      ];
      if (adminRoles.includes(role)) return true;

      // S'assurer que permissions est bien un tableau
      const permissionsArray = Array.isArray(permissions) ? permissions : [];
      return permissionList.some((permission) =>
        permissionsArray.includes(permission)
      );
    },
    [permissions, role]
  );

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   * @param {string[]} permissionList - Liste des permissions à vérifier
   * @returns {boolean} - True si l'utilisateur a toutes les permissions
   */
  const hasAllPermissions = useCallback(
    (permissionList) => {
      if (!permissionList || !Array.isArray(permissionList)) return false;

      // Si l'utilisateur est admin, SupAdmin, Admin ou directeur, il a toutes les permissions
      const adminRoles = [
        "admin",
        "Admin",
        "SupAdmin",
        "directeur",
        "Superviseur",
      ];
      if (adminRoles.includes(role)) return true;

      // S'assurer que permissions est bien un tableau
      const permissionsArray = Array.isArray(permissions) ? permissions : [];
      return permissionList.every((permission) =>
        permissionsArray.includes(permission)
      );
    },
    [permissions, role]
  );

  /**
   * Vérifie si l'utilisateur peut effectuer une action sur un module
   * @param {string} module - Le module (ex: "clients", "devis", "factures")
   * @param {string} action - L'action (ex: "view", "create", "edit", "delete")
   * @returns {boolean} - True si l'utilisateur peut effectuer l'action
   */
  const canPerformAction = useCallback(
    (module, action) => {
      const permission = `${action}_${module}`;
      return hasPermission(permission);
    },
    [hasPermission]
  );

  /**
   * Recharger les permissions
   */
  const refreshPermissions = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    refreshPermissions,
    isAdmin: [
      "admin",
      "Admin",
      "SupAdmin",
      "directeur",
      "Superviseur",
    ].includes(role),
    userRole: role,
  };
};

/**
 * Retourne les permissions par défaut selon le rôle
 * @param {string} role - Le rôle de l'utilisateur
 * @returns {string[]} - Liste des permissions
 */
function getDefaultPermissionsForRole(role) {
  const defaultPermissions = {
    admin: [
      // Offres
      "view_offers",
      "create_offers",
      "edit_offers",
      "delete_offers",
      // Devis
      "view_quotes",
      "create_quotes",
      "edit_quotes",
      "delete_quotes",
      // Factures
      "view_invoices",
      "create_invoices",
      "edit_invoices",
      "delete_invoices",
      // Clients
      "view_clients",
      "create_clients",
      "edit_clients",
      "delete_clients",
      // Personnel
      "view_personnel",
      "create_personnel",
      "edit_personnel",
      "delete_personnel",
      // Partenaires
      "view_partners",
      "create_partners",
      "edit_partners",
      "delete_partners",
      // Sources
      "view_sources",
      "create_sources",
      "edit_sources",
      "delete_sources",
      // Administration
      "admin_settings",
      "manage_users",
      "manage_roles",
      "view_analytics",
      // Rapports
      "view_reports",
      "export_data",
    ],
    user: [
      // Offres
      "view_offers",
      "create_offers",
      "edit_offers",
      // Devis
      "view_quotes",
      "create_quotes",
      "edit_quotes",
      // Factures
      "view_invoices",
      "create_invoices",
      "edit_invoices",
      // Clients
      "view_clients",
      "create_clients",
      "edit_clients",
      // Personnel
      "view_personnel",
      "create_personnel",
      "edit_personnel",
      // Partenaires
      "view_partners",
      "create_partners",
      "edit_partners",
      // Sources
      "view_sources",
      "create_sources",
      "edit_sources",
      // Rapports
      "view_reports",
      "export_data",
    ],
    spectateur: [
      // Lecture seule limitée
      "view_offers",
      "view_quotes",
      "view_sources",
    ],
    // Rôles par fonction métier
    commercial: [
      "view_offers",
      "create_offers",
      "edit_offers",
      "create_quotes",
      "view_quotes",
      "edit_quotes",
      "create_invoices",
      "view_invoices",
      "edit_invoices",
      "view_clients",
      "create_clients",
      "edit_clients",
      "view_partners",
      "create_partners",
      "edit_partners",
      "view_sources",
      "create_sources",
      "edit_sources",
      "view_reports",
      "export_data",
    ],
    analyste: [
      "view_offers",
      "view_quotes",
      "view_invoices",
      "view_clients",
      "view_personnel",
      "view_partners",
      "view_sources",
      "view_reports",
      "create_reports",
      "export_data",
      "view_analytics",
    ],
    comptable: [
      "view_quotes",
      "create_invoices",
      "view_invoices",
      "edit_invoices",
      "view_clients",
      "view_reports",
      "export_data",
    ],
    rh: [
      "view_personnel",
      "create_personnel",
      "edit_personnel",
      "delete_personnel",
      "view_reports",
      "export_data",
    ],
    directeur: [
      // Toutes les permissions comme admin
      "view_offers",
      "create_offers",
      "edit_offers",
      "delete_offers",
      "view_quotes",
      "create_quotes",
      "edit_quotes",
      "delete_quotes",
      "view_invoices",
      "create_invoices",
      "edit_invoices",
      "delete_invoices",
      "view_clients",
      "create_clients",
      "edit_clients",
      "delete_clients",
      "view_personnel",
      "create_personnel",
      "edit_personnel",
      "delete_personnel",
      "view_partners",
      "create_partners",
      "edit_partners",
      "delete_partners",
      "view_sources",
      "create_sources",
      "edit_sources",
      "delete_sources",
      "admin_settings",
      "manage_users",
      "manage_roles",
      "view_analytics",
      "view_reports",
      "create_reports",
      "export_data",
    ],
  };

  return defaultPermissions[role] || [];
}

/**
 * Hook pour vérifier une permission spécifique
 * @param {string} permission - La permission à vérifier
 * @returns {boolean} - True si l'utilisateur a la permission
 */
export const usePermission = (permission) => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};

/**
 * Hook pour vérifier plusieurs permissions
 * @param {string[]} permissions - Les permissions à vérifier
 * @param {string} mode - "any" ou "all" (défaut: "any")
 * @returns {boolean} - True selon le mode choisi
 */
export const usePermissionsCheck = (permissions, mode = "any") => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  if (mode === "all") {
    return hasAllPermissions(permissions);
  }

  return hasAnyPermission(permissions);
};
