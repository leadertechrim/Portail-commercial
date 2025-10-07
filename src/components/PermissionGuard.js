// import React from "react"; // Non utilisé
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";

/**
 * Composant de garde pour les permissions
 * Affiche le contenu uniquement si l'utilisateur a les permissions requises
 */
const PermissionGuard = ({
  children,
  permission,
  permissions = [],
  mode = "any",
  fallback = null,
  requireAdmin = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } =
    usePermissionsImproved();

  // Si l'admin est requis et que l'utilisateur n'est pas admin
  if (requireAdmin && !isAdmin) {
    return fallback;
  }

  // Vérification d'une permission unique
  if (permission) {
    if (hasPermission(permission)) {
      return children;
    }
    return fallback;
  }

  // Vérification de plusieurs permissions
  if (permissions && permissions.length > 0) {
    let hasRequiredPermissions = false;

    if (mode === "all") {
      hasRequiredPermissions = hasAllPermissions(permissions);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissions);
    }

    if (hasRequiredPermissions) {
      return children;
    }
    return fallback;
  }

  // Si aucune permission n'est spécifiée, afficher le contenu
  return children;
};

/**
 * Composant de garde pour les actions sur des modules
 * Vérifie si l'utilisateur peut effectuer une action sur un module
 */
export const ModulePermissionGuard = ({
  children,
  module,
  action,
  fallback = null,
}) => {
  const { canPerformAction } = usePermissionsImproved();

  if (canPerformAction(module, action)) {
    return children;
  }

  return fallback;
};

/**
 * Composant de garde pour les rôles
 * Affiche le contenu uniquement si l'utilisateur a le rôle requis
 */
export const RoleGuard = ({ children, role, roles = [], fallback = null }) => {
  const { userRole } = usePermissionsImproved();

  // Vérification d'un rôle unique
  if (role) {
    if (userRole === role) {
      return children;
    }
    return fallback;
  }

  // Vérification de plusieurs rôles
  if (roles && roles.length > 0) {
    if (roles.includes(userRole)) {
      return children;
    }
    return fallback;
  }

  // Si aucun rôle n'est spécifié, afficher le contenu
  return children;
};

/**
 * Composant de garde pour les administrateurs
 * Affiche le contenu uniquement si l'utilisateur est admin
 */
export const AdminGuard = ({ children, fallback = null }) => {
  const { isAdmin } = usePermissionsImproved();

  if (isAdmin) {
    return children;
  }

  return fallback;
};

/**
 * Composant de garde pour les non-spectateurs
 * Affiche le contenu si l'utilisateur n'est pas spectateur
 */
export const NonSpectatorGuard = ({ children, fallback = null }) => {
  const { userRole } = usePermissionsImproved();

  if (userRole !== "spectateur") {
    return children;
  }

  return fallback;
};

export default PermissionGuard;
