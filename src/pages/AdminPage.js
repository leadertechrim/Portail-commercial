import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  API_BASE_URL,
} from "../api";
import UserModal from "../components/UserModal";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import logger from "../utils/logger";
import notify from "../utils/notifications";
import "./AdminPage.css";

const AdminPage = () => {
  // Charger les utilisateurs depuis localStorage en premier pour affichage immédiat
  const [users, setUsers] = useState(() => {
    const cached = localStorage.getItem("users");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        logger.log("📦 Utilisateurs chargés depuis le cache:", parsed);
        return parsed;
      } catch (e) {
        logger.warn("Erreur lors du parsing des utilisateurs en cache:", e);
      }
    }
    return [];
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false); // Commencer à false car on a déjà les utilisateurs en cache
  const [error, setError] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const hasLoadedRef = useRef(false);

  const navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const token = localStorage.getItem("token");

  const loadUsers = useCallback(async () => {
    // Vérifier si on a déjà des utilisateurs en cache dans localStorage
    const cached = localStorage.getItem("users");
    const hasCachedUsers = cached && cached.length > 0;
    
    // Éviter le double chargement si déjà en cours
    if (hasLoadedRef.current) {
      return;
    }
    
    try {
      hasLoadedRef.current = true;
      // Ne pas bloquer si on a déjà des utilisateurs en cache
      if (!hasCachedUsers) {
      setLoading(true);
        logger.log("📋 Chargement des utilisateurs depuis l'API Flask...");
      }

      logger.log(
        "🌐 AdminPage - Appel fetchUsers avec token:",
        token ? "Présent" : "Manquant"
      );
      const data = await fetchUsers(token);
      logger.log("📋 Utilisateurs chargés depuis l'API:", data);
      logger.log("📊 AdminPage - Nombre d'utilisateurs:", data?.length || 0);
      setUsers(data);
      // Sauvegarder dans localStorage pour la synchronisation
      localStorage.setItem("users", JSON.stringify(data));
      setError("");
      setLoading(false);
    } catch (err) {
      logger.error("❌ Erreur lors du chargement des utilisateurs:", err);
      // En cas d'erreur, garder les utilisateurs en cache si disponibles
      if (!hasCachedUsers) {
      setError("Erreur lors du chargement des utilisateurs");
        setUsers([]);
        hasLoadedRef.current = false; // Réessayer au prochain montage en cas d'erreur
      }
      setLoading(false);
    }
  }, [token]);

  const loadRoles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || data);
        logger.log("✅ Rôles chargés:", data);
      }
    } catch (err) {
      logger.error("❌ Erreur chargement rôles:", err);
    }
  }, [token]);

  useEffect(() => {
    if (permissionsLoading) return; // Attendre le chargement des permissions

    if (!hasPermission("users_manage")) {
      logger.log("🔓 AdminPage - Mode test sans connexion");
      // navigate("/sources");
      // return;
    }
    loadUsers();
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading]); // Ne dépendre que de permissionsLoading

  // Synchronisation en temps réel avec les autres pages
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Seulement si c'est un changement de users
      if (e && e.key === "users") {
        logger.log(
          "🔄 Synchronisation des utilisateurs depuis localStorage..."
        );
        loadUsers();
      }
    };

    // Écouter les changements dans localStorage (entre onglets)
    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés (même onglet)
    const handleCustomEvent = () => {
      loadUsers();
    };
    window.addEventListener("usersUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("usersUpdated", handleCustomEvent);
    };
  }, [loadUsers]);

  const handleCreateUser = async (userData) => {
    try {
      logger.log("Données utilisateur à créer:", userData);
      logger.log("Token:", token ? "Présent" : "Manquant");

      const result = await createUser(userData, token);
      logger.log("Résultat de création:", result);

      // Recharger depuis l'API pour avoir les données à jour
      hasLoadedRef.current = false;
      await loadUsers();
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("usersUpdated"));
      setIsUserModalOpen(false);
      setError("");
      notify.success("Utilisateur créé avec succès");
    } catch (err) {
      logger.error("Erreur détaillée:", err);
      setError(`Erreur lors de la création de l'utilisateur: ${err.message}`);
      notify.error(`Erreur lors de la création de l'utilisateur: ${err.message}`);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData, token);
      // Recharger depuis l'API pour avoir les données à jour
      hasLoadedRef.current = false;
      await loadUsers();
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("usersUpdated"));
      setIsUserModalOpen(false);
      setEditingUser(null);
      setError("");
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await notify.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (confirmed) {
      try {
        await deleteUser(userId, token);
        // Recharger depuis l'API pour avoir les données à jour
        hasLoadedRef.current = false;
        await loadUsers();
        // Déclencher un événement pour notifier les autres composants
        window.dispatchEvent(new Event("usersUpdated"));
        setError("");
      } catch (err) {
        setError("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsViewMode(false);
    setIsUserModalOpen(true);
  };

  const openViewModal = (user) => {
    setEditingUser(user);
    setIsViewMode(true);
    setIsUserModalOpen(true);
  };

  const closeModals = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setIsViewMode(false);
  };

  // Afficher un loader pendant le chargement des permissions ou des données
  if (permissionsLoading || loading) {
    return (
      <div className="admin-page">
        <div className="loading">
          {permissionsLoading ? "Chargement des permissions..." : "Chargement des utilisateurs..."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* ══ HEADER ══ */}
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <button className="back-btn" onClick={() => navigate(-1)} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <i className="fas fa-users-cog" style={{ color: "#f67800", fontSize: "1rem" }}></i>
            Utilisateurs
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Compteur */}
          <span style={{
            fontSize: ".75rem", fontWeight: 600,
            color: "#6b7280", background: "#f8f9fa",
            border: "1px solid #e2e8f0", borderRadius: 20,
            padding: "4px 12px"
          }}>
            {users.length} utilisateur{users.length !== 1 ? "s" : ""}
          </span>

          {hasPermission("users_manage") && (
            <button
              className="add-user-btn"
              onClick={() => setIsUserModalOpen(true)}
              style={{ height: "36px", fontSize: "0.82rem" }}
            >
              <i className="fas fa-plus"></i>
              Nouvel Utilisateur
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <div className="loading" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
            <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 10, color: "#f67800" }}></i>
            Chargement des utilisateurs...
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead style={{ background: "#f67800", color: "white" }}>
                <tr>
                  <th style={{ color: "white" }}><i className="fas fa-user" style={{ marginRight: 6, opacity: .8 }}></i>Nom et prénom</th>
                  <th style={{ color: "white" }}><i className="fas fa-briefcase" style={{ marginRight: 6, opacity: .8 }}></i>Fonction</th>
                  <th style={{ color: "white" }}><i className="fas fa-user-shield" style={{ marginRight: 6, opacity: .8 }}></i>Rôle</th>
                  <th style={{ color: "white" }}><i className="fas fa-info-circle" style={{ marginRight: 6, opacity: .8 }}></i>Statut</th>
                  <th style={{ textAlign: "right", paddingRight: 24, color: "white" }}>Gérer</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.Fonction || "-"}</td>
                    <td>
                      {(() => {
                        const userRole = roles.find((r) => r.nom === user.role);
                        const roleColor = userRole?.couleur || "#6c757d";
                        return (
                          <span
                            className="role-badge-dynamic"
                            style={{
                              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`,
                              color: "white",
                              padding: "8px 16px",
                              borderRadius: "25px",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              display: "inline-block",
                              boxShadow: `0 2px 8px ${roleColor}40`,
                            }}
                          >
                            {user.role}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${user.statut || "actif"}`}
                      >
                        {user.statut || "actif"}
                      </span>
                    </td>
                    {/* <td>
                      <span
                        className={`manage-badge ${user.gerer ? "yes" : "no"}`}
                      >
                        <i
                          className={`fas ${
                            user.gerer ? "fa-check" : "fa-times"
                          }`}
                        ></i>
                        {user.gerer ? "Oui" : "Non"}
                      </span>
                    </td> */}
                    <td className="actions-cell">
                      <button
                        className="view-btn"
                        onClick={() => openViewModal(user)}
                        title="Voir les détails"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {/* Temporairement activé pour les tests */}
                      {(true || hasPermission("users_manage")) && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(user)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user._id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isUserModalOpen && (
        <UserModal
          user={editingUser}
          onSave={
            editingUser
              ? (userData) => handleUpdateUser(editingUser._id, userData)
              : handleCreateUser
          }
          onClose={closeModals}
          isViewMode={isViewMode}
        />
      )}
    </div>
  );
};

export default AdminPage;
