import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from "../api";
import UserModal from "../components/UserModal";
import PasswordModal from "../components/PasswordModal";
import Sidebar from "../components/Sidebar";
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUserId, setPasswordUserId] = useState(null);

  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

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
    if (role !== "admin") {
      navigate("/sources");
      return;
    }
    loadUsers();
  }, [navigate, role, loadUsers]);

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData, token);
      await loadUsers();
      setIsUserModalOpen(false);
      setError("");
    } catch (err) {
      setError("Erreur lors de la création de l'utilisateur");
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

  const handleChangePassword = async (userId, passwordData) => {
    try {
      await changePassword(userId, passwordData, token);
      setIsPasswordModalOpen(false);
      setPasswordUserId(null);
      setError("");
    } catch (err) {
      setError("Erreur lors du changement de mot de passe");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const openPasswordModal = (userId) => {
    setPasswordUserId(userId);
    setIsPasswordModalOpen(true);
  };

  const closeModals = () => {
    setIsUserModalOpen(false);
    setIsPasswordModalOpen(false);
    setEditingUser(null);
    setPasswordUserId(null);
  };

  if (role !== "admin") {
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
        <button
          className="add-user-btn"
          onClick={() => setIsUserModalOpen(true)}
        >
          <i className="fas fa-plus"></i>
          Nouvel Utilisateur
        </button>
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
                  <th>Gérer</th>
                  <th>Actions</th>
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
                    <td>
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
                    </td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(user)}
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="password-btn"
                        onClick={() => openPasswordModal(user._id)}
                        title="Changer le mot de passe"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Supprimer"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
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
        />
      )}

      {isPasswordModalOpen && (
        <PasswordModal
          userId={passwordUserId}
          onSave={handleChangePassword}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default AdminPage;
