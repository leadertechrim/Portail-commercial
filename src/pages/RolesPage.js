import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { rolesAPI, API_BASE_URL } from "../api";
import "./RolesPage.css";

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Rôles initiaux selon les spécifications
  const initialRoles = useMemo(
    () => [
      {
        _id: "1",
        nom: "Commercial",
        description: "Accès aux offres, devis et factures",
        permissions: [
          "view_offers",
          "create_quotes",
          "view_quotes",
          "create_invoices",
          "view_invoices",
          "view_clients",
        ],
        couleur: "#28a745",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "Visiteur",
        description: "Accès en lecture seule aux offres",
        permissions: ["view_offers", "view_quotes"],
        couleur: "#17a2b8",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "Directeur",
        description: "Accès complet à toutes les fonctionnalités",
        permissions: [
          "view_offers",
          "create_quotes",
          "view_quotes",
          "edit_quotes",
          "delete_quotes",
          "create_invoices",
          "view_invoices",
          "edit_invoices",
          "delete_invoices",
          "view_clients",
          "edit_clients",
          "delete_clients",
          "view_personnel",
          "edit_personnel",
          "view_partners",
          "edit_partners",
          "admin_settings",
        ],
        couleur: "#dc3545",
        ordre: 3,
      },
    ],
    []
  );

  const availablePermissions = [
    { id: "view_offers", name: "Voir les offres", category: "Offres" },
    { id: "create_quotes", name: "Créer des devis", category: "Devis" },
    { id: "view_quotes", name: "Voir les devis", category: "Devis" },
    { id: "edit_quotes", name: "Modifier les devis", category: "Devis" },
    { id: "delete_quotes", name: "Supprimer les devis", category: "Devis" },
    { id: "create_invoices", name: "Créer des factures", category: "Factures" },
    { id: "view_invoices", name: "Voir les factures", category: "Factures" },
    {
      id: "edit_invoices",
      name: "Modifier les factures",
      category: "Factures",
    },
    {
      id: "delete_invoices",
      name: "Supprimer les factures",
      category: "Factures",
    },
    { id: "view_clients", name: "Voir les clients", category: "Clients" },
    { id: "edit_clients", name: "Modifier les clients", category: "Clients" },
    {
      id: "delete_clients",
      name: "Supprimer les clients",
      category: "Clients",
    },
    { id: "view_personnel", name: "Voir le personnel", category: "RH" },
    { id: "edit_personnel", name: "Modifier le personnel", category: "RH" },
    {
      id: "view_partners",
      name: "Voir les partenaires",
      category: "Partenaires",
    },
    {
      id: "edit_partners",
      name: "Modifier les partenaires",
      category: "Partenaires",
    },
    {
      id: "admin_settings",
      name: "Paramètres administrateur",
      category: "Administration",
    },
  ];

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔧 loadRoles - Début du chargement");

      const token = localStorage.getItem("token");
      console.log("🔧 loadRoles - Token:", token ? "Présent" : "Manquant");

      if (!token) {
        throw new Error("Token manquant");
      }

      const apiResponse = await rolesAPI.getAll(token);
      console.log("🔧 loadRoles - Réponse API:", apiResponse);

      const apiRoles = apiResponse?.data || apiResponse || [];
      console.log("🔧 loadRoles - Rôles extraits:", apiRoles);
      console.log("🔧 loadRoles - Nombre de rôles:", apiRoles.length);

      if (apiRoles.length === 0) {
        console.warn("⚠️ Aucun rôle trouvé dans le backend");
        setError("Aucun rôle trouvé. Commencez par créer votre premier rôle.");
      } else {
        setError("");
      }

      setRoles(apiRoles);
      setLoading(false);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des rôles:", err);
      setError(`Erreur lors du chargement des rôles: ${err.message}`);
      setRoles([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur") {
      navigate("/sources");
      return;
    }
    loadRoles();
  }, [navigate, role, loadRoles]);

  const filteredRoles = roles.filter(
    (roleItem) =>
      roleItem.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleItem.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = async (roleData) => {
    try {
      console.log("🔧 handleCreateRole - Données:", roleData);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant");
      }

      const response = await rolesAPI.create(roleData, token);
      console.log("🔧 handleCreateRole - Réponse:", response);

      // Recharger les rôles depuis le backend
      await loadRoles();

      setIsAddModalOpen(false);
      alert("Rôle créé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la création du rôle:", error);
      alert(`Erreur lors de la création du rôle: ${error.message}`);
    }
  };

  const handleUpdateRole = async (roleId, roleData) => {
    try {
      console.log("🔧 handleUpdateRole - ID:", roleId, "Données:", roleData);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant");
      }

      const response = await rolesAPI.update(roleId, roleData, token);
      console.log("🔧 handleUpdateRole - Réponse:", response);

      // Recharger les rôles depuis le backend
      await loadRoles();

      setIsEditModalOpen(false);
      setEditingRole(null);
      alert("Rôle modifié avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la modification du rôle:", error);
      alert(`Erreur lors de la modification du rôle: ${error.message}`);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
      try {
        console.log("🔧 handleDeleteRole - ID:", roleId);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token manquant");
        }

        const response = await rolesAPI.delete(roleId, token);
        console.log("🔧 handleDeleteRole - Réponse:", response);

        // Recharger les rôles depuis le backend
        await loadRoles();

        alert("Rôle supprimé avec succès");
      } catch (error) {
        console.error("❌ Erreur lors de la suppression du rôle:", error);
        alert(`Erreur lors de la suppression du rôle: ${error.message}`);
      }
    }
  };

  const openEditModal = (roleItem) => {
    setEditingRole(roleItem);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingRole(null);
  };

  const getPermissionName = (permissionId) => {
    const permission = availablePermissions.find((p) => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  if (loading) {
    return (
      <div className="roles-page">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des rôles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-page">
      <Sidebar />

      <div className="main-content">
        <div className="roles-header">
          <div className="roles-header-left">
            <h1>Gestion des Rôles & Permissions</h1>
            <p>
              Configurez les rôles utilisateurs et leurs permissions d'accès
            </p>
          </div>
          <div className="roles-header-actions">
            <input
              type="text"
              placeholder="Rechercher un rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {role === "admin" && (
              <button
                className="add-role-btn"
                onClick={() => setIsAddModalOpen(true)}
              >
                <i className="fas fa-plus"></i>
                Nouveau Rôle
              </button>
            )}
          </div>
        </div>

        <div className="roles-content">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {filteredRoles.length === 0 ? (
            <div className="empty-roles">
              <i className="fas fa-shield-alt"></i>
              <h3>Aucun rôle trouvé</h3>
              <p>Commencez par créer votre premier rôle</p>
            </div>
          ) : (
            <div className="roles-grid">
              {filteredRoles.map((roleItem) => (
                <div key={roleItem._id} className="role-card">
                  <div className="role-header">
                    <div
                      className="role-color-indicator"
                      style={{ backgroundColor: roleItem.couleur }}
                    ></div>
                    <h3>{roleItem.nom}</h3>
                    <div className="role-actions">
                      {role === "admin" && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(roleItem)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteRole(roleItem._id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="role-details">
                    <p className="role-description">{roleItem.description}</p>
                    <div className="permissions-section">
                      <h4>Permissions ({roleItem.permissions.length})</h4>
                      <div className="permissions-list">
                        {roleItem.permissions.map((permissionId) => (
                          <span key={permissionId} className="permission-tag">
                            {getPermissionName(permissionId)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="role-meta">
                      <span className="role-color">
                        <i className="fas fa-palette"></i>
                        {roleItem.couleur}
                      </span>
                      <span className="role-order">
                        <i className="fas fa-sort-numeric-up"></i>
                        Ordre: {roleItem.ordre}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <RoleModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateRole}
          availablePermissions={availablePermissions}
          title="Nouveau Rôle"
        />
      )}

      {isEditModalOpen && editingRole && (
        <RoleModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={(data) => handleUpdateRole(editingRole._id, data)}
          role={editingRole}
          availablePermissions={availablePermissions}
          title="Modifier le Rôle"
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/modifier un rôle
const RoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  role,
  availablePermissions,
  title,
}) => {
  const [formData, setFormData] = useState({
    nom: "",
    couleur: "#28a745",
    description: "",
    permissions: [],
    ordre: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const predefinedColors = [
    { name: "Vert", value: "#28a745" },
    { name: "Bleu", value: "#17a2b8" },
    { name: "Rouge", value: "#dc3545" },
    { name: "Orange", value: "#f67800" },
    { name: "Violet", value: "#6f42c1" },
    { name: "Jaune", value: "#ffc107" },
    { name: "Gris", value: "#6c757d" },
    { name: "Noir", value: "#343a40" },
  ];

  useEffect(() => {
    if (role) {
      setFormData({
        nom: role.nom || "",
        couleur: role.couleur || "#28a745",
        description: role.description || "",
        permissions: role.permissions || [],
        ordre: role.ordre || 1,
      });
    } else {
      setFormData({
        nom: "",
        couleur: "#28a745",
        description: "",
        permissions: [],
        ordre: 1,
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((id) => id !== permissionId),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.couleur.trim()) newErrors.couleur = "La couleur est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionsByCategory = () => {
    const categories = {};
    availablePermissions.forEach((permission) => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nom">Nom du rôle *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? "error" : ""}
              placeholder="Ex: Commercial"
            />
            {errors.nom && <span className="error-message">{errors.nom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du rôle"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="couleur">Couleur *</label>
            <div className="color-input-group">
              <input
                type="color"
                id="couleur"
                name="couleur"
                value={formData.couleur}
                onChange={handleChange}
                className="color-picker"
              />
              <input
                type="text"
                value={formData.couleur}
                onChange={handleChange}
                className="color-text"
                placeholder="#28a745"
              />
            </div>
            <div className="predefined-colors">
              <p>Couleurs prédéfinies :</p>
              <div className="color-options">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`color-option ${
                      formData.couleur === color.value ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, couleur: color.value }))
                    }
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            {errors.couleur && (
              <span className="error-message">{errors.couleur}</span>
            )}
          </div>

          <div className="form-group">
            <label>Permissions</label>
            <div className="permissions-section">
              {Object.entries(getPermissionsByCategory()).map(
                ([category, permissions]) => (
                  <div key={category} className="permission-category">
                    <h4>{category}</h4>
                    <div className="permission-checkboxes">
                      {permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="permission-checkbox"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(
                              permission.id
                            )}
                            onChange={(e) =>
                              handlePermissionChange(
                                permission.id,
                                e.target.checked
                              )
                            }
                          />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ordre">Ordre d'affichage</label>
            <input
              type="number"
              id="ordre"
              name="ordre"
              value={formData.ordre}
              onChange={handleChange}
              min="1"
              placeholder="1"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "En cours..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesPage;
