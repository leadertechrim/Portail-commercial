import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api";
import UserModal from "../components/UserModal";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const token = localStorage.getItem("token");

  const loadUsers = useCallback(async () => {
    try {
      console.log("🔄 AdminPage loadUsers - Début du chargement");
      setLoading(true);
      console.log(
        "🌐 AdminPage - Appel fetchUsers avec token:",
        token ? "Présent" : "Manquant"
      );
      const data = await fetchUsers(token);
      console.log("✅ AdminPage - Utilisateurs chargés:", data);
      console.log("📊 AdminPage - Nombre d'utilisateurs:", data?.length || 0);
      setUsers(data);
      setError("");
      console.log("✅ AdminPage - setUsers appelé, données:", data);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
      console.log("✅ AdminPage - Loading mis à false");
    }
  }, [token]);

  const loadRoles = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"}/api/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || data);
        console.log("✅ Rôles chargés:", data);
      }
    } catch (err) {
      console.error("❌ Erreur chargement rôles:", err);
    }
  }, [token]);

  useEffect(() => {
    if (permissionsLoading) return; // Attendre le chargement des permissions

    if (!hasPermission("users_manage")) {
      console.log("🔓 AdminPage - Mode test sans connexion");
      // navigate("/sources");
      // return;
    }
    loadUsers();
    loadRoles();
  }, [navigate, hasPermission, permissionsLoading, loadUsers, loadRoles]);

  const handleCreateUser = async (userData) => {
    try {
      console.log("Données utilisateur à créer:", userData);
      console.log("Token:", token ? "Présent" : "Manquant");

      const result = await createUser(userData, token);
      console.log("Résultat de création:", result);

      await loadUsers();
      setIsUserModalOpen(false);
      setError("");
      alert("Utilisateur créé avec succès");
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(`Erreur lors de la création de l'utilisateur: ${err.message}`);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData, token);
      await loadUsers();
      setIsUserModalOpen(false);
      setEditingUser(null);
      setError("");
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await deleteUser(userId, token);
        await loadUsers();
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

  console.log("🎯 AdminPage render - users:", users);
  console.log("🎯 AdminPage render - loading:", loading);
  console.log(
    "🎯 AdminPage render - hasPermission('users_manage'):",
    hasPermission("users_manage")
  );

  // Temporairement désactivé pour les tests
  if (false && !hasPermission("users_manage")) {
    console.log("🚫 AdminPage - Permission refusée, rendu de null");
    return null;
  }

  console.log("✅ AdminPage - Rendu de l'interface");
  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate("/sources")}>
          <i className="fas fa-arrow-left"></i>
          Retour
        </button>
        {/* <h1>Gestion des Utilisateurs</h1> */}
        {hasPermission("users_manage") && (
          <button
            className="add-user-btn"
            onClick={() => setIsUserModalOpen(true)}
          >
            <i className="fas fa-plus"></i>
            Nouvel Utilisateur
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Chargement des utilisateurs...
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nom et prénom</th>
                  <th>Fonction</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Gérer</th>
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
