import { useState, useEffect, useCallback } from "react";
import { rolesAPI } from "../api";

/**
 * Hook amélioré pour la gestion des permissions utilisateur
 * Utilise les nouvelles constantes de permissions
 */
export const usePermissionsImproved = () => {
  const [permissions, setPermissions] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les permissions de l'utilisateur
  const loadPermissions = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setPermissions([]);
      setUserRole("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔐 Chargement des permissions:");
      console.log("  - Token présent:", !!token);
      console.log("  - Token contenu:", token?.substring(0, 20) + "...");
      console.log("  - Rôle dans localStorage:", role);
      console.log("  - Type du rôle:", typeof role);
      console.log("  - Comparaison admin:", role === "admin");
      console.log("  - localStorage complet keys:", Object.keys(localStorage));
      console.log("  - localStorage complet contenu:");
      Object.keys(localStorage).forEach((key) => {
        console.log(`    ${key}: ${localStorage.getItem(key)}`);
      });

      // Récupérer les permissions depuis l'API pour TOUS les rôles (y compris admin)
      console.log(`🔐 Chargement des permissions pour le rôle: ${role}`);

      const userPermissions = await rolesAPI.getCurrentUserPermissions(token);

      if (
        !userPermissions ||
        !userPermissions.data ||
        !userPermissions.data.permissions ||
        userPermissions.data.permissions.length === 0
      ) {
        console.log("⚠️ Permissions API vides, aucune permission accordée");
        setPermissions([]);
      } else {
        console.log(
          "✅ Permissions chargées depuis l'API:",
          userPermissions.data.permissions
        );
        setPermissions(userPermissions.data.permissions);
      }

      setUserRole(role);
    } catch (err) {
      console.error("❌ Erreur chargement permissions:", err);

      // En cas d'erreur, aucune permission accordée
      setPermissions([]);
      setUserRole(role || "");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = useCallback(
    (permission) => {
      if (!permissions || !Array.isArray(permissions)) {
        console.warn(
          `⚠️ hasPermission(${permission}): Permissions non chargées ou invalides`
        );
        return false;
      }

      const hasAccess = permissions.includes(permission);

      // Debug: Log les vérifications de permissions importantes
      if (
        permission &&
        (permission.includes("edit") || permission.includes("delete"))
      ) {
        console.log(
          `🔐 hasPermission("${permission}"): ${hasAccess} (role: ${userRole}, total perms: ${permissions.length})`
        );
      }

      if (userRole === "admin") {
        return true; // Admin a tout
      }

      return hasAccess;
    },
    [permissions, userRole]
  );

  // Vérifier si l'utilisateur a au moins une des permissions listées
  const hasAnyPermission = useCallback(
    (permissionList) => {
      if (!permissions || !Array.isArray(permissions)) {
        return false;
      }

      if (userRole === "admin") {
        return true; // Admin a tout
      }

      return permissionList.some((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions, userRole]
  );

  // Vérifier si l'utilisateur a toutes les permissions listées
  const hasAllPermissions = useCallback(
    (permissionList) => {
      if (!permissions || !Array.isArray(permissions)) {
        return false;
      }

      if (userRole === "admin") {
        return true; // Admin a tout
      }

      return permissionList.every((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions, userRole]
  );

  // Charger les permissions au montage du composant
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Debug des permissions (uniquement en développement)
  useEffect(() => {
    if (!loading && permissions.length > 0) {
      console.log("🔐 Permissions actives:", permissions);
      console.log("🎭 Rôle utilisateur:", userRole);
    }
  }, [loading, permissions, userRole]);

  return {
    permissions,
    userRole,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reloadPermissions: loadPermissions,
  };
};

export default usePermissionsImproved;
