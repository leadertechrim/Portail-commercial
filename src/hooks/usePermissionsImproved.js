import { useState, useEffect, useCallback } from "react";
import { rolesAPI } from "../api";

/**
 * Hook amélioré pour la gestion des permissions utilisateur
 * Utilise les nouvelles constantes de permissions
 */
export const usePermissionsImproved = () => {
  // Charger les permissions depuis localStorage en premier pour affichage immédiat
  const [permissions, setPermissions] = useState(() => {
    const cached = localStorage.getItem("userPermissions");
    const cachedRole = localStorage.getItem("role");
    if (cached && cachedRole) {
      try {
        const parsed = JSON.parse(cached);
        console.log("📦 Permissions chargées depuis le cache:", parsed);
        return parsed;
      } catch (e) {
        console.warn("Erreur lors du parsing des permissions en cache:", e);
      }
    }
    return [];
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("role") || "";
  });
  
  const [loading, setLoading] = useState(false); // Commencer à false car on a déjà les permissions en cache
  const [error, setError] = useState(null);

  // Charger les permissions de l'utilisateur
  const loadPermissions = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setPermissions([]);
      setUserRole("");
      setLoading(false);
      localStorage.removeItem("userPermissions");
      return;
    }

    // Vérifier si on a déjà des permissions en cache
    const hasCachedPermissions = permissions.length > 0;

    try {
      // Ne pas mettre loading à true si on a déjà des permissions en cache
      if (!hasCachedPermissions) {
        setLoading(true);
      }
      setError(null);

      // Récupérer les permissions depuis l'API
      const userPermissions = await rolesAPI.getCurrentUserPermissions(token);

      if (
        !userPermissions ||
        !userPermissions.data ||
        !userPermissions.data.permissions ||
        userPermissions.data.permissions.length === 0
      ) {
        console.log("⚠️ Permissions API vides, aucune permission accordée");
        setPermissions([]);
        localStorage.removeItem("userPermissions");
      } else {
        console.log(
          "✅ Permissions chargées depuis l'API:",
          userPermissions.data.permissions
        );
        setPermissions(userPermissions.data.permissions);
        // Sauvegarder dans localStorage pour le prochain chargement
        localStorage.setItem("userPermissions", JSON.stringify(userPermissions.data.permissions));
      }

      setUserRole(role || "");
      if (role) {
        localStorage.setItem("role", role);
      }
    } catch (err) {
      console.error("❌ Erreur chargement permissions:", err);

      // En cas d'erreur, garder les permissions en cache si disponibles
      if (!hasCachedPermissions) {
        setPermissions([]);
        localStorage.removeItem("userPermissions");
      }
      setUserRole(role || "");
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pas de dépendances pour éviter les boucles

  // Vérifier si l'utilisateur est un rôle privilégié (admin, supadmin, etc.)
  const isPrivilegedRole = useCallback(() => {
    if (!userRole) return false;
    const normalizedRole = userRole.trim().toLowerCase();
    const privilegedRoles = ["admin", "supadmin", "administrateur principal", "administrateur système"];
    return privilegedRoles.includes(normalizedRole);
  }, [userRole]);

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = useCallback(
    (permission) => {
      // Les rôles privilégiés ont toutes les permissions
      if (isPrivilegedRole()) {
        return true;
      }

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

      return hasAccess;
    },
    [permissions, userRole, isPrivilegedRole]
  );

  // Vérifier si l'utilisateur a au moins une des permissions listées
  const hasAnyPermission = useCallback(
    (permissionList) => {
      // Les rôles privilégiés ont toutes les permissions
      if (isPrivilegedRole()) {
        return true;
      }

      if (!permissions || !Array.isArray(permissions)) {
        return false;
      }

      return permissionList.some((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions, isPrivilegedRole]
  );

  // Vérifier si l'utilisateur a toutes les permissions listées
  const hasAllPermissions = useCallback(
    (permissionList) => {
      // Les rôles privilégiés ont toutes les permissions
      if (isPrivilegedRole()) {
        return true;
      }

      if (!permissions || !Array.isArray(permissions)) {
        return false;
      }

      return permissionList.every((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions, isPrivilegedRole]
  );

  // Charger les permissions au montage du composant
  // Si on a déjà des permissions en cache, charger en arrière-plan sans bloquer
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPermissions([]);
      setUserRole("");
      setLoading(false);
      return;
    }
    
    // Toujours charger pour mettre à jour, mais sans bloquer si on a déjà un cache
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger une seule fois au montage

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
