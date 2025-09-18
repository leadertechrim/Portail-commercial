import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api";
import UserModal from "../components/UserModal";
import Sidebar from "../components/Sidebar";
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const isSpectator = role === "spectateur";

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers(token);
      setUsers(data);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur") {
      navigate("/sources");
      return;
    }
    loadUsers();
  }, [navigate, role, loadUsers]);

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

  if (role !== "admin" && role !== "spectateur") {
    return null;
  }

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate("/sources")}>
          <i className="fas fa-arrow-left"></i>
          Retour
        </button>
        {/* <h1>Gestion des Utilisateurs</h1> */}
        {!isSpectator && (
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
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  {/* <th>Gérer</th> */}
                  <th>Gérer</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.telephone || "-"}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
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
                    <td className="actions">
                      <button
                        className="view-btn"
                        onClick={() => openViewModal(user)}
                        title="Voir les détails"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {!isSpectator && (
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
