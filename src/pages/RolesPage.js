import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { rolesAPI, API_BASE_URL } from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./RolesPage.css";

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);

  // États pour les formulaires
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    couleur: "#f67800",
    ordre: 1,
    permissions: [],
  });

  const navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const token = localStorage.getItem("token");

  const loadRoles = useCallback(async () => {
    try {
      console.log("🔄 RolesPage loadRoles - Début du chargement");
      setLoading(true);
      setError(null);

      const response = await rolesAPI.getAll(token);
      console.log("🔄 RolesPage loadRoles - Réponse:", response);

      if (response && response.data) {
        setRoles(response.data);
        console.log(
          "✅ RolesPage loadRoles - Rôles chargés:",
          response.data.length
        );

        // Logs détaillés pour chaque rôle
        response.data.forEach((role, index) => {
          console.log(`🔍 Rôle ${index + 1}:`, role.nom);
          console.log(`🔍 Permissions du rôle ${role.nom}:`, role.permissions);
          console.log(`🔍 Type des permissions:`, typeof role.permissions);
          console.log(`🔍 Est-ce un tableau?`, Array.isArray(role.permissions));
          if (Array.isArray(role.permissions) && role.permissions.length > 0) {
            console.log(
              `🔍 Premier élément de permission:`,
              role.permissions[0]
            );
            console.log(
              `🔍 Type du premier élément:`,
              typeof role.permissions[0]
            );
          }
        });
      } else {
        console.log("⚠️ RolesPage loadRoles - Aucune donnée reçue");
        setRoles([]);
      }
    } catch (err) {
      console.error("❌ RolesPage loadRoles - Erreur:", err);
      setError(err.message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadPermissions = useCallback(async () => {
    try {
      console.log("🔄 Chargement des permissions disponibles");
      const response = await fetch(`${API_BASE_URL}/api/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 Structure des permissions reçues:", data);
        console.log("🔍 Permissions data:", data.data);

        if (data.data && data.data.length > 0) {
          console.log("🔍 Premier élément de permission:", data.data[0]);
          console.log("🔍 CLÉS du premier élément:", Object.keys(data.data[0]));
          console.log(
            "🔍 VALEURS du premier élément:",
            Object.values(data.data[0])
          );

          // Normaliser les permissions pour s'assurer qu'elles ont les bons champs
          const normalizedPermissions = data.data.map((perm) => {
            // Déterminer le nom de la permission
            const permName = perm.nom || perm.name || perm.code || perm._id;

            // Déterminer la catégorie
            const permCategory = perm.category || perm.categorie || "Autres";

            // Déterminer la description
            const permDescription =
              perm.description || perm.desc || perm.titre || permName;

            console.log(`🔄 Normalisation permission:`, {
              original: perm,
              nom: permName,
              category: permCategory,
              description: permDescription,
            });

            return {
              ...perm,
              nom: permName,
              category: permCategory,
              description: permDescription,
            };
          });

          console.log("✅ Permissions normalisées:", normalizedPermissions);
          setPermissions(normalizedPermissions);
        } else {
          setPermissions([]);
        }

        console.log("✅ Permissions chargées:", data.data?.length || 0);
      } else {
        console.log("⚠️ Erreur lors du chargement des permissions");
        setPermissions([]);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des permissions:", err);
      setPermissions([]);
    }
  }, [token]);

  useEffect(() => {
    if (permissionsLoading) return;

    if (!hasPermission("roles_manage")) {
      navigate("/sources");
      return;
    }

    loadRoles();
    loadPermissions();
  }, [hasPermission, permissionsLoading, navigate, loadRoles, loadPermissions]);

  // Log des changements de formData.permissions
  useEffect(() => {
    console.log("🔄 formData.permissions a changé:", formData.permissions);
    console.log("🔍 Nombre de permissions:", formData.permissions.length);
  }, [formData.permissions]);

  const filteredRoles = roles.filter(
    (role) =>
      role.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRole = async () => {
    try {
      console.log("🔄 Ouverture du modal d'ajout de rôle");
      setFormData({
        nom: "",
        description: "",
        couleur: "#f67800",
        ordre: roles.length + 1,
        permissions: [],
      });
      setIsAddModalOpen(true);
    } catch (err) {
      console.error("❌ Erreur lors de l'ouverture du modal:", err);
      setError(err.message);
    }
  };

  const handleViewRole = (role) => {
    console.log("👁️ Affichage du rôle:", role);
    setViewingRole(role);
    setIsViewModalOpen(true);
  };

  const handleEditRole = (role) => {
    console.log("✏️ Modification du rôle:", role);
    console.log("🔍 Permissions du rôle:", role.permissions);
    console.log("🔍 Type des permissions:", typeof role.permissions);
    console.log("🔍 Est-ce un tableau?", Array.isArray(role.permissions));

    // Extraire les noms des permissions si c'est un tableau d'objets
    let permissionNames = [];
    if (Array.isArray(role.permissions)) {
      permissionNames = role.permissions
        .map((perm) => {
          if (typeof perm === "string") {
            return perm; // C'est déjà un nom
          } else if (perm && perm.nom) {
            return perm.nom; // C'est un objet avec un champ 'nom'
          } else if (perm && perm.name) {
            return perm.name; // C'est un objet avec un champ 'name'
          }
          return perm;
        })
        .filter(Boolean); // Enlever les valeurs vides
    }

    console.log("🔍 Noms de permissions extraits:", permissionNames);

    setFormData({
      nom: role.nom || "",
      description: role.description || "",
      couleur: role.couleur || "#f67800",
      ordre: role.ordre || 1,
      permissions: permissionNames,
    });
    setEditingRole(role);
    setIsEditModalOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`
      )
    ) {
      try {
        console.log("🗑️ Suppression du rôle:", role);
        await rolesAPI.delete(role._id, token);
        console.log("✅ Rôle supprimé avec succès");
        loadRoles(); // Recharger la liste
      } catch (err) {
        console.error("❌ Erreur lors de la suppression:", err);
        setError(err.message);
      }
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      console.log("💾 Sauvegarde du rôle:", roleData);
      console.log("🔍 État editingRole:", editingRole);
      console.log("🔍 Token:", token ? "Présent" : "Manquant");

      if (editingRole) {
        // Modification
        console.log("🔄 Modification du rôle existant:", editingRole._id);
        const result = await rolesAPI.update(editingRole._id, roleData, token);
        console.log("✅ Rôle modifié avec succès:", result);
      } else {
        // Création
        console.log("🆕 Création d'un nouveau rôle");
        const result = await rolesAPI.create(roleData, token);
        console.log("✅ Rôle créé avec succès:", result);
      }

      console.log("🔄 Rechargement de la liste des rôles...");
      await loadRoles(); // Recharger la liste
      console.log("✅ Liste des rôles rechargée");

      console.log("🔄 Fermeture des modales...");
      closeModals();
      console.log("✅ Modales fermées");

      // Afficher le message de succès
      const action = editingRole ? "modifié" : "créé";
      setSuccessMessage(`Rôle ${action} avec succès !`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde:", err);
      console.error("❌ Message d'erreur:", err.message);
      console.error("❌ Stack trace:", err.stack);
      setError(err.message);
      setSuccessMessage(""); // Effacer le message de succès en cas d'erreur
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionToggle = (permissionName) => {
    console.log("🔄 Toggle permission:", permissionName);
    console.log("🔍 Type de permission:", typeof permissionName);
    console.log("🔍 Permissions actuelles:", formData.permissions);
    console.log(
      "🔍 Type des permissions actuelles:",
      formData.permissions.map((p) => typeof p)
    );
    console.log(
      "🔍 Permission déjà sélectionnée?",
      formData.permissions.includes(permissionName)
    );

    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permissionName);
      console.log("🔍 isSelected:", isSelected);

      let newPermissions;
      if (isSelected) {
        // Désélectionner : retirer la permission
        newPermissions = prev.permissions.filter((p) => p !== permissionName);
        console.log("➖ Désélection - Retrait de:", permissionName);
      } else {
        // Sélectionner : ajouter la permission
        newPermissions = [...prev.permissions, permissionName];
        console.log("➕ Sélection - Ajout de:", permissionName);
      }

      console.log("🔍 Nouvelles permissions:", newPermissions);
      console.log("🔍 Nombre de permissions:", newPermissions.length);
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: permissions.map((p) => p.nom),
    }));
  };

  const handleDeselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setEditingRole(null);
    setViewingRole(null);
    setFormData({
      nom: "",
      description: "",
      couleur: "#f67800",
      ordre: 1,
      permissions: [],
    });
  };

  if (loading) {
    return (
      <div className="roles-page">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Chargement des rôles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-page">
      <div className="main-content">
        <div className="roles-header">
          <div className="roles-header-left"></div>
          <div className="roles-header-actions">
            <input
              type="text"
              placeholder="Rechercher un rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              className="add-role-btn"
              onClick={handleAddRole}
              title="Ajouter un nouveau rôle"
              disabled={!hasPermission("roles_manage")}
            >
              <i className="fas fa-plus"></i>
              Ajouter un rôle
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            {successMessage}
          </div>
        )}

        <div className="roles-table-container">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Couleur</th>
                <th>Permissions</th>
                <th>Ordre</th>
                <th>Gérer</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="no-data-content">
                      <i className="fas fa-info-circle"></i>
                      <p>
                        {searchTerm
                          ? "Aucun rôle trouvé pour cette recherche"
                          : "Aucun rôle trouvé. Cliquez sur 'Ajouter un rôle' pour créer un nouveau rôle."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role._id}>
                    <td>
                      <div className="role-name">
                        <div
                          className="role-color-indicator"
                          style={{ backgroundColor: role.couleur }}
                        ></div>
                        <span>{role.nom}</span>
                      </div>
                    </td>
                    <td>{role.description}</td>
                    <td>
                      <div className="color-preview">
                        <div
                          className="color-circle"
                          style={{ backgroundColor: role.couleur }}
                        ></div>
                        <span>{role.couleur}</span>
                      </div>
                    </td>
                    <td>
                      <div className="permissions-count">
                        <i className="fas fa-key"></i>
                        {role.permissions ? role.permissions.length : 0}{" "}
                        permissions
                      </div>
                    </td>
                    <td>{role.ordre}</td>
                    <td>
                      <div className="role-actions-cell">
                        {hasPermission("roles_manage") && (
                          <button
                            className="view-btn"
                            title="Voir les détails"
                            onClick={() => handleViewRole(role)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        {hasPermission("roles_manage") && (
                          <button
                            className="edit-btn"
                            title="Modifier"
                            onClick={() => handleEditRole(role)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {hasPermission("roles_manage") && (
                          <button
                            className="delete-btn"
                            title="Supprimer"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                Ajouter un nouveau rôle
                {formData.permissions.length > 0 && (
                  <span className="permissions-count">
                    ({formData.permissions.length} permission
                    {formData.permissions.length > 1 ? "s" : ""} sélectionnée
                    {formData.permissions.length > 1 ? "s" : ""})
                  </span>
                )}
              </h3>
              <button className="close-btn" onClick={closeModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="role-form">
                <div className="form-group">
                  <label htmlFor="nom">Nom du rôle *</label>
                  <input
                    type="text"
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    placeholder="Ex: Administrateur"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Description du rôle..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="couleur">Couleur</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      id="couleur"
                      value={formData.couleur}
                      onChange={(e) =>
                        handleInputChange("couleur", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={formData.couleur}
                      onChange={(e) =>
                        handleInputChange("couleur", e.target.value)
                      }
                      placeholder="#f67800"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ordre">Ordre d'affichage</label>
                  <input
                    type="number"
                    id="ordre"
                    value={formData.ordre}
                    onChange={(e) =>
                      handleInputChange("ordre", parseInt(e.target.value))
                    }
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Permissions</label>
                  <p className="permissions-help-text">
                    Sélectionnez individuellement les permissions souhaitées
                  </p>
                  <div className="permissions-controls">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="select-all-btn"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="deselect-all-btn"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                  <div className="permissions-grid">
                    {console.log("🔍 Permissions dans le rendu:", permissions)}
                    {permissions.length === 0 ? (
                      <div className="no-permissions-message">
                        <p>Aucune permission disponible</p>
                        <p>Vérifiez la connexion à l'API</p>
                      </div>
                    ) : (
                      (() => {
                        // Grouper les permissions par catégorie
                        const groupedPermissions = permissions.reduce(
                          (acc, permission) => {
                            const category = permission.category || "Autres";
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(permission);
                            return acc;
                          },
                          {}
                        );

                        console.log(
                          "🔍 Permissions groupées:",
                          groupedPermissions
                        );

                        return Object.entries(groupedPermissions).map(
                          ([category, categoryPermissions]) => (
                            <div key={category} className="permission-category">
                              <h4 className="category-title">{category}</h4>
                              <div className="category-permissions">
                                {categoryPermissions.map((permission) => {
                                  const isChecked =
                                    formData.permissions.includes(
                                      permission.nom
                                    );
                                  console.log(
                                    `🔍 Rendu checkbox pour "${permission.nom}":`,
                                    {
                                      nom: permission.nom,
                                      isChecked,
                                      formDataPermissions: formData.permissions,
                                    }
                                  );
                                  return (
                                    <label
                                      key={
                                        permission.nom ||
                                        permission._id ||
                                        Math.random()
                                      }
                                      className="permission-checkbox"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "🖱️ Clic sur checkbox:",
                                            permission.nom
                                          );
                                          handlePermissionToggle(
                                            permission.nom
                                          );
                                        }}
                                      />
                                      <span className="permission-label">
                                        {permission.description ||
                                          permission.nom ||
                                          permission.name ||
                                          "Permission sans nom"}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        );
                      })()
                    )}
                  </div>
                </div>
              </form>
              <div className="modal-actions">
                <button
                  className="save-btn"
                  onClick={() => handleSaveRole(formData)}
                >
                  <i className="fas fa-save"></i>
                  Enregistrer
                </button>
                <button className="cancel-btn" onClick={closeModals}>
                  <i className="fas fa-times"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingRole && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                Modifier le rôle: {editingRole.nom}
                {formData.permissions.length > 0 && (
                  <span className="permissions-count">
                    ({formData.permissions.length} permission
                    {formData.permissions.length > 1 ? "s" : ""} sélectionnée
                    {formData.permissions.length > 1 ? "s" : ""})
                  </span>
                )}
              </h3>
              <button className="close-btn" onClick={closeModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="role-form">
                <div className="form-group">
                  <label htmlFor="edit-nom">Nom du rôle *</label>
                  <input
                    type="text"
                    id="edit-nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    placeholder="Ex: Administrateur"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Description du rôle..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-couleur">Couleur</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      id="edit-couleur"
                      value={formData.couleur}
                      onChange={(e) =>
                        handleInputChange("couleur", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={formData.couleur}
                      onChange={(e) =>
                        handleInputChange("couleur", e.target.value)
                      }
                      placeholder="#f67800"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-ordre">Ordre d'affichage</label>
                  <input
                    type="number"
                    id="edit-ordre"
                    value={formData.ordre}
                    onChange={(e) =>
                      handleInputChange("ordre", parseInt(e.target.value))
                    }
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Permissions</label>
                  <p className="permissions-help-text">
                    Sélectionnez individuellement les permissions souhaitées
                  </p>
                  <div className="permissions-controls">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="select-all-btn"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="deselect-all-btn"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                  <div className="permissions-grid">
                    {console.log("🔍 Permissions dans le rendu:", permissions)}
                    {permissions.length === 0 ? (
                      <div className="no-permissions-message">
                        <p>Aucune permission disponible</p>
                        <p>Vérifiez la connexion à l'API</p>
                      </div>
                    ) : (
                      (() => {
                        // Grouper les permissions par catégorie
                        const groupedPermissions = permissions.reduce(
                          (acc, permission) => {
                            const category = permission.category || "Autres";
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(permission);
                            return acc;
                          },
                          {}
                        );

                        console.log(
                          "🔍 Permissions groupées:",
                          groupedPermissions
                        );

                        return Object.entries(groupedPermissions).map(
                          ([category, categoryPermissions]) => (
                            <div key={category} className="permission-category">
                              <h4 className="category-title">{category}</h4>
                              <div className="category-permissions">
                                {categoryPermissions.map((permission) => {
                                  const isChecked =
                                    formData.permissions.includes(
                                      permission.nom
                                    );
                                  console.log(
                                    `🔍 Rendu checkbox pour "${permission.nom}":`,
                                    {
                                      nom: permission.nom,
                                      isChecked,
                                      formDataPermissions: formData.permissions,
                                    }
                                  );
                                  return (
                                    <label
                                      key={
                                        permission.nom ||
                                        permission._id ||
                                        Math.random()
                                      }
                                      className="permission-checkbox"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "🖱️ Clic sur checkbox:",
                                            permission.nom
                                          );
                                          handlePermissionToggle(
                                            permission.nom
                                          );
                                        }}
                                      />
                                      <span className="permission-label">
                                        {permission.description ||
                                          permission.nom ||
                                          permission.name ||
                                          "Permission sans nom"}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        );
                      })()
                    )}
                  </div>
                </div>
              </form>
              <div className="modal-actions">
                <button
                  className="save-btn"
                  onClick={() => handleSaveRole(formData)}
                >
                  <i className="fas fa-save"></i>
                  Enregistrer
                </button>
                <button className="cancel-btn" onClick={closeModals}>
                  <i className="fas fa-times"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewingRole && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails du rôle: {viewingRole.nom}</h3>
              <button className="close-btn" onClick={closeModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="role-details">
                <div className="detail-item">
                  <label>Nom:</label>
                  <span>{viewingRole.nom}</span>
                </div>
                <div className="detail-item">
                  <label>Description:</label>
                  <span>{viewingRole.description}</span>
                </div>
                <div className="detail-item">
                  <label>Couleur:</label>
                  <div className="color-preview">
                    <div
                      className="color-circle"
                      style={{ backgroundColor: viewingRole.couleur }}
                    ></div>
                    <span>{viewingRole.couleur}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Permissions:</label>
                  <div className="permissions-list">
                    {viewingRole.permissions &&
                    viewingRole.permissions.length > 0 ? (
                      viewingRole.permissions.map((permission, index) => (
                        <span key={index} className="permission-tag">
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="no-permissions">Aucune permission</span>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Ordre:</label>
                  <span>{viewingRole.ordre}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="close-btn" onClick={closeModals}>
                  <i className="fas fa-times"></i>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
