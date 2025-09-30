import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./OfferStatusPage.css";

const OfferStatusPage = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Statuts initiaux selon les spécifications
  const initialStatuses = useMemo(
    () => [
      {
        _id: "1",
        nom: "Non préparée",
        couleur: "#dc3545", // Rouge
        description: "Offre non préparée",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "En préparation",
        couleur: "#ffc107", // Jaune
        description: "Offre en préparation",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "Envoyée",
        couleur: "#28a745", // Vert
        description: "Offre envoyée",
        ordre: 3,
      },
      {
        _id: "4",
        nom: "Clôturée",
        couleur: "#6c757d", // Gris
        description: "Offre clôturée",
        ordre: 4,
      },
    ],
    []
  );

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);

      // Charger depuis localStorage ou utiliser les statuts initiaux
      const savedStatuses = localStorage.getItem("offerStatuses");
      if (savedStatuses) {
        const parsedStatuses = JSON.parse(savedStatuses);
        console.log(
          "📋 Statuts d'offres chargés depuis localStorage:",
          parsedStatuses
        );
        setStatuses(parsedStatuses);
      } else {
        console.log("📋 Utilisation des statuts d'offres initiaux");
        setStatuses(initialStatuses);
        // Sauvegarder les statuts initiaux dans localStorage
        localStorage.setItem("offerStatuses", JSON.stringify(initialStatuses));
      }

      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des statuts:", err);
      setError(`Erreur lors du chargement des statuts: ${err.message}`);
      setStatuses([]);
      setLoading(false);
    }
  }, [initialStatuses]);

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur") {
      navigate("/sources");
      return;
    }
    loadStatuses();
  }, [navigate, role, loadStatuses]);

  // Synchronisation en temps réel avec les autres pages
  useEffect(() => {
    const handleStorageChange = () => {
      console.log(
        "🔄 Synchronisation des statuts d'offres depuis localStorage..."
      );
      loadStatuses();
    };

    // Écouter les changements dans localStorage
    window.addEventListener("storage", handleStorageChange);

    // Vérification périodique pour les changements dans le même onglet
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [loadStatuses]);

  const filteredStatuses = statuses.filter(
    (status) =>
      status.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateStatus = async (statusData) => {
    try {
      const newStatus = {
        _id: Date.now().toString(),
        ...statusData,
        ordre: statuses.length + 1,
      };
      const updatedStatuses = [...statuses, newStatus];
      setStatuses(updatedStatuses);

      // Sauvegarder dans localStorage pour la synchronisation
      localStorage.setItem("offerStatuses", JSON.stringify(updatedStatuses));

      setIsAddModalOpen(false);
      alert("Statut créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du statut:", error);
      alert("Erreur lors de la création du statut");
    }
  };

  const handleUpdateStatus = async (statusId, statusData) => {
    try {
      const updatedStatuses = statuses.map((status) =>
        status._id === statusId ? { ...status, ...statusData } : status
      );
      setStatuses(updatedStatuses);

      // Sauvegarder dans localStorage pour la synchronisation
      localStorage.setItem("offerStatuses", JSON.stringify(updatedStatuses));

      setIsEditModalOpen(false);
      setEditingStatus(null);
      alert("Statut modifié avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      alert("Erreur lors de la modification du statut");
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce statut ?")) {
      try {
        const updatedStatuses = statuses.filter(
          (status) => status._id !== statusId
        );
        setStatuses(updatedStatuses);

        // Sauvegarder dans localStorage pour la synchronisation
        localStorage.setItem("offerStatuses", JSON.stringify(updatedStatuses));

        alert("Statut supprimé avec succès");
      } catch (error) {
        alert("Erreur lors de la suppression du statut");
      }
    }
  };

  const openEditModal = (status) => {
    setEditingStatus(status);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingStatus(null);
  };

  if (loading) {
    return (
      <div className="offer-status-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des statuts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="offer-status-page">
        <div className="main-content">
          <div className="status-header">
            <div className="status-header-left">
              <h1>Gestion des Statuts d'Offres</h1>
              <p>
                Configurez les statuts disponibles pour les offres avec leurs
                couleurs
              </p>
            </div>
            <div className="status-header-actions">
              <input
                type="text"
                placeholder="Rechercher un statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {role === "admin" && (
                <button
                  className="add-status-btn"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <i className="fas fa-plus"></i>
                  Nouveau Statut
                </button>
              )}
            </div>
          </div>

          <div className="status-content">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            {filteredStatuses.length === 0 ? (
              <div className="empty-statuses">
                <i className="fas fa-tags"></i>
                <h3>Aucun statut trouvé</h3>
                <p>Commencez par créer votre premier statut d'offre</p>
              </div>
            ) : (
              <div className="status-grid">
                {filteredStatuses.map((status) => (
                  <div key={status._id} className="status-card">
                    <div className="status-header">
                      <div
                        className="status-color-indicator"
                        style={{ backgroundColor: status.couleur }}
                      ></div>
                      <h3>{status.nom}</h3>
                      <div className="status-actions">
                        {role === "admin" && (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() => openEditModal(status)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteStatus(status._id)}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="status-details">
                      <p className="status-description">{status.description}</p>
                      <div className="status-meta">
                        <span className="status-color">
                          <i className="fas fa-palette"></i>
                          {status.couleur}
                        </span>
                        <span className="status-order">
                          <i className="fas fa-sort-numeric-up"></i>
                          Ordre: {status.ordre}
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
          <StatusModal
            isOpen={isAddModalOpen}
            onClose={closeModals}
            onSubmit={handleCreateStatus}
            title="Nouveau Statut"
          />
        )}

        {isEditModalOpen && editingStatus && (
          <StatusModal
            isOpen={isEditModalOpen}
            onClose={closeModals}
            onSubmit={(data) => handleUpdateStatus(editingStatus._id, data)}
            status={editingStatus}
            title="Modifier le Statut"
          />
        )}
      </div>
    </Layout>
  );
};

// Composant Modal pour ajouter/modifier un statut
const StatusModal = ({ isOpen, onClose, onSubmit, status, title }) => {
  const [formData, setFormData] = useState({
    nom: "",
    couleur: "#f67800",
    description: "",
    ordre: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Couleurs prédéfinies
  const predefinedColors = [
    { name: "Orange", value: "#f67800" },
    { name: "Rouge", value: "#dc3545" },
    { name: "Vert", value: "#28a745" },
    { name: "Bleu", value: "#007bff" },
    { name: "Violet", value: "#6f42c1" },
    { name: "Jaune", value: "#ffc107" },
    { name: "Gris", value: "#6c757d" },
    { name: "Noir", value: "#343a40" },
  ];

  useEffect(() => {
    if (status) {
      setFormData({
        nom: status.nom || "",
        couleur: status.couleur || "#f67800",
        description: status.description || "",
        ordre: status.ordre || 1,
      });
    } else {
      setFormData({
        nom: "",
        couleur: "#f67800",
        description: "",
        ordre: 1,
      });
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nom">Nom du statut *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? "error" : ""}
              placeholder="Ex: En préparation"
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
              placeholder="Description du statut"
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
                placeholder="#f67800"
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

export default OfferStatusPage;
