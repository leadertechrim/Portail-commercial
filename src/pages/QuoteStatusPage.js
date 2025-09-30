import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { quoteStatusesAPI } from "../api";
import "./QuoteStatusPage.css";

const QuoteStatusPage = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // États initiaux pour les devis selon les spécifications
  const initialStatuses = useMemo(
    () => [
      {
        _id: "1",
        nom: "Validé",
        couleur: "#28a745", // Vert
        description: "Devis validé par le client",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "Transformé en facture",
        couleur: "#6c757d", // Gris
        description: "Devis transformé en facture",
        ordre: 2,
      },
    ],
    []
  );

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📋 Chargement des états de devis depuis l'API Flask...");

      // Charger depuis l'API Flask
      const apiStatuses = await quoteStatusesAPI.getAll();

      if (apiStatuses && apiStatuses.length > 0) {
        console.log("📋 États de devis chargés depuis l'API:", apiStatuses);
        setStatuses(apiStatuses);
      } else {
        console.log("📋 Aucun état trouvé, utilisation des états initiaux");
        setStatuses(initialStatuses);
        // Créer les états initiaux dans l'API
        for (const status of initialStatuses) {
          try {
            await quoteStatusesAPI.create(status);
          } catch (err) {
            console.warn("Erreur lors de la création de l'état initial:", err);
          }
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des états:", err);
      setError(`Erreur lors du chargement des états: ${err.message}`);
      // Fallback vers les états initiaux en cas d'erreur API
      setStatuses(initialStatuses);
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

  const filteredStatuses = statuses.filter(
    (status) =>
      status.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateStatus = async (statusData) => {
    try {
      const newStatusData = {
        ...statusData,
        ordre: statuses.length + 1,
      };

      // Créer via l'API Flask
      const newStatus = await quoteStatusesAPI.create(newStatusData);

      // Mettre à jour l'état local
      setStatuses([...statuses, newStatus]);
      setIsAddModalOpen(false);
      alert("État créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de l'état:", error);
      alert("Erreur lors de la création de l'état");
    }
  };

  const handleUpdateStatus = async (statusId, statusData) => {
    try {
      // Mettre à jour via l'API Flask
      const updatedStatus = await quoteStatusesAPI.update(statusId, statusData);

      // Mettre à jour l'état local
      const updatedStatuses = statuses.map((status) =>
        status._id === statusId ? updatedStatus : status
      );
      setStatuses(updatedStatuses);

      setIsEditModalOpen(false);
      setEditingStatus(null);
      alert("État modifié avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification de l'état:", error);
      alert("Erreur lors de la modification de l'état");
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet état ?")) {
      try {
        // Supprimer via l'API Flask
        await quoteStatusesAPI.delete(statusId);

        // Mettre à jour l'état local
        const updatedStatuses = statuses.filter(
          (status) => status._id !== statusId
        );
        setStatuses(updatedStatuses);

        alert("État supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'état:", error);
        alert("Erreur lors de la suppression de l'état");
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
      <Layout>
        <div className="quote-status-page">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Chargement des états...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="quote-status-page">
        <div className="main-content">
          <div className="status-header">
            <div className="status-header-left">
              <h1>Gestion des États de Devis</h1>
              <p>
                Configurez les états disponibles pour les devis avec leurs
                couleurs
              </p>
            </div>
            <div className="status-header-actions">
              <input
                type="text"
                placeholder="Rechercher un état..."
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
                  Nouvel État
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
                <i className="fas fa-clipboard-check"></i>
                <h3>Aucun état trouvé</h3>
                <p>Commencez par créer votre premier état de devis</p>
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
            title="Nouvel État"
          />
        )}

        {isEditModalOpen && editingStatus && (
          <StatusModal
            isOpen={isEditModalOpen}
            onClose={closeModals}
            onSubmit={(data) => handleUpdateStatus(editingStatus._id, data)}
            status={editingStatus}
            title="Modifier l'État"
          />
        )}
      </div>
    </Layout>
  );
};

// Composant Modal pour ajouter/modifier un état
const StatusModal = ({ isOpen, onClose, onSubmit, status, title }) => {
  const [formData, setFormData] = useState({
    nom: "",
    couleur: "#6c757d",
    description: "",
    ordre: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Couleurs prédéfinies
  const predefinedColors = [
    { name: "Gris", value: "#6c757d" },
    { name: "Jaune", value: "#ffc107" },
    { name: "Vert", value: "#28a745" },
    { name: "Rouge", value: "#dc3545" },
    { name: "Orange", value: "#f67800" },
    { name: "Bleu", value: "#007bff" },
    { name: "Violet", value: "#6f42c1" },
    { name: "Noir", value: "#343a40" },
  ];

  useEffect(() => {
    if (status) {
      setFormData({
        nom: status.nom || "",
        couleur: status.couleur || "#6c757d",
        description: status.description || "",
        ordre: status.ordre || 1,
      });
    } else {
      setFormData({
        nom: "",
        couleur: "#6c757d",
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
            <label htmlFor="nom">Nom de l'état *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? "error" : ""}
              placeholder="Ex: En attente"
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
              placeholder="Description de l'état"
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
                placeholder="#6c757d"
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

export default QuoteStatusPage;
