import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { quoteStatusesAPI } from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import logger from "../utils/logger";
import notify from "../utils/notifications";
import "./QuoteStatusPage.css";

const QuoteStatusPage = () => {
  // Charger les statuts depuis localStorage en premier pour affichage immédiat
  const [statuses, setStatuses] = useState(() => {
    const cached = localStorage.getItem("quoteStatuses");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        logger.log("📦 Statuts de devis chargés depuis le cache:", parsed);
        return parsed;
      } catch (e) {
        logger.warn("Erreur lors du parsing des statuts en cache:", e);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false); // Commencer à false car on a déjà les statuts en cache
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const _navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const _role = localStorage.getItem("role");
  const hasLoadedRef = useRef(false);

  // Statuts initiaux selon les spécifications
  const initialStatuses = useMemo(
    () => [
      {
        _id: "1",
        nom: "Brouillon",
        couleur: "#6c757d", // Gris
        description: "Devis en brouillon",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "Envoyé",
        couleur: "#17a2b8", // Bleu
        description: "Devis envoyé au client",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "Validé",
        couleur: "#28a745", // Vert
        description: "Devis validé par le client",
        ordre: 3,
      },
      {
        _id: "4",
        nom: "Refusé",
        couleur: "#dc3545", // Rouge
        description: "Devis refusé par le client",
        ordre: 4,
      },
      {
        _id: "5",
        nom: "Transformé en facture",
        couleur: "#f67800", // Orange
        description: "Devis transformé en facture",
        ordre: 5,
      },
    ],
    []
  );

  const loadStatuses = useCallback(async () => {
    // Vérifier si on a déjà des statuts en cache dans localStorage
    const cached = localStorage.getItem("quoteStatuses");
    const hasCachedStatuses = cached && cached.length > 0;

    // Éviter le double chargement si déjà en cours
    if (hasLoadedRef.current) {
      return;
    }

    try {
      hasLoadedRef.current = true;
      // Ne pas bloquer si on a déjà des statuts en cache
      if (!hasCachedStatuses) {
        setLoading(true);
        logger.log("📋 Chargement des statuts de devis depuis l'API Flask...");
      }

      // Charger depuis l'API Flask
      const apiStatuses = await quoteStatusesAPI.getAll();

      if (apiStatuses && apiStatuses.length > 0) {
        logger.log("📋 Statuts de devis chargés depuis l'API:", apiStatuses);
        setStatuses(apiStatuses);
        // Sauvegarder dans localStorage pour la synchronisation
        localStorage.setItem("quoteStatuses", JSON.stringify(apiStatuses));
      } else {
        // Si pas de cache, utiliser les statuts initiaux
        if (!hasCachedStatuses) {
          logger.log(
            "📋 Aucun statut trouvé, utilisation des statuts initiaux"
          );
          setStatuses(initialStatuses);
          localStorage.setItem(
            "quoteStatuses",
            JSON.stringify(initialStatuses)
          );
          // Créer les statuts initiaux dans l'API
          for (const status of initialStatuses) {
            try {
              await quoteStatusesAPI.create(status);
            } catch (err) {
              logger.warn("Erreur lors de la création du statut initial:", err);
            }
          }
        }
      }
      setLoading(false);
    } catch (err) {
      logger.error("Erreur lors du chargement des statuts:", err);
      // En cas d'erreur, garder les statuts en cache si disponibles
      if (!hasCachedStatuses) {
        setError(`Erreur lors du chargement des statuts: ${err.message}`);
        setStatuses(initialStatuses);
        localStorage.setItem("quoteStatuses", JSON.stringify(initialStatuses));
        hasLoadedRef.current = false; // Réessayer au prochain montage en cas d'erreur
      }
      setLoading(false);
    }
  }, [initialStatuses]);

  useEffect(() => {
    if (permissionsLoading) return;
    loadStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading]); // Ne dépendre que de permissionsLoading

  // Synchronisation en temps réel avec les autres pages
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Seulement si c'est un changement de quoteStatuses
      if (e && e.key === "quoteStatuses") {
        logger.log(
          "🔄 Synchronisation des statuts de devis depuis localStorage..."
        );
        loadStatuses();
      }
    };

    // Écouter les changements dans localStorage (entre onglets)
    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés (même onglet)
    const handleCustomEvent = () => {
      loadStatuses();
    };
    window.addEventListener("quoteStatusesUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("quoteStatusesUpdated", handleCustomEvent);
    };
  }, [loadStatuses]);

  const filteredStatuses = statuses.filter(
    (status) =>
      status.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateStatus = async (statusData) => {
    try {
      const newStatusData = {
        ...statusData,
        ordre: statuses.length + 1,
      };

      // Créer via l'API Flask
      const _newStatus = await quoteStatusesAPI.create(newStatusData);

      // Recharger depuis l'API pour avoir les données à jour
      hasLoadedRef.current = false;
      await loadStatuses();

      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("quoteStatusesUpdated"));

      setIsAddModalOpen(false);
      notify.success("Statut créé avec succès");
    } catch (error) {
      logger.error("Erreur lors de la création du statut:", error);
      notify.error(
        "Erreur lors de la création du statut: " +
          (error.message || "Erreur inconnue")
      );
    }
  };

  const handleUpdateStatus = async (statusId, statusData) => {
    try {
      // Mettre à jour via l'API Flask
      await quoteStatusesAPI.update(statusId, statusData);

      // Recharger depuis l'API pour avoir les données à jour
      hasLoadedRef.current = false;
      await loadStatuses();

      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("quoteStatusesUpdated"));

      setIsEditModalOpen(false);
      setEditingStatus(null);
      notify.success("Statut modifié avec succès");
    } catch (error) {
      logger.error("Erreur lors de la modification du statut:", error);
      notify.error(
        "Erreur lors de la modification du statut: " +
          (error.message || "Erreur inconnue")
      );
    }
  };

  const handleDeleteStatus = async (statusId) => {
    const confirmed = await notify.confirm(
      "Êtes-vous sûr de vouloir supprimer ce statut ?"
    );
    if (confirmed) {
      try {
        // Supprimer via l'API Flask
        await quoteStatusesAPI.delete(statusId);

        // Recharger depuis l'API pour avoir les données à jour
        hasLoadedRef.current = false;
        await loadStatuses();

        // Déclencher un événement pour notifier les autres composants
        window.dispatchEvent(new Event("quoteStatusesUpdated"));

        notify.success("Statut supprimé avec succès");
      } catch (error) {
        logger.error("Erreur lors de la suppression du statut:", error);
        notify.error(
          "Erreur lors de la suppression du statut: " +
            (error.message || "Erreur inconnue")
        );
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
      <div className="quote-status-page">
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
    <div className="quote-status-page">
      <div className="main-content">
        <div className="status-header">
          <div className="status-header-left"></div>
          <div className="status-header-actions">
            <input
              type="text"
              placeholder="Rechercher un statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {hasPermission("quote_status_manage") && (
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
              <p>Commencez par créer votre premier statut de devis</p>
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
                      {hasPermission("quote_status_manage") && (
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
  );
};

// Composant Modal pour ajouter/modifier un statut
const StatusModal = ({ isOpen, onClose, onSubmit, status, title }) => {
  const [formData, setFormData] = useState({
    nom: "",
    couleur: "#17a2b8",
    description: "",
    ordre: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Couleurs prédéfinies
  const predefinedColors = [
    { name: "Bleu", value: "#17a2b8" },
    { name: "Vert", value: "#28a745" },
    { name: "Rouge", value: "#dc3545" },
    { name: "Orange", value: "#f67800" },
    { name: "Gris", value: "#6c757d" },
    { name: "Violet", value: "#6f42c1" },
    { name: "Jaune", value: "#ffc107" },
    { name: "Noir", value: "#343a40" },
  ];

  useEffect(() => {
    if (status) {
      setFormData({
        nom: status.nom || "",
        couleur: status.couleur || "#17a2b8",
        description: status.description || "",
        ordre: status.ordre || 1,
      });
    } else {
      setFormData({
        nom: "",
        couleur: "#17a2b8",
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
      logger.error("Erreur:", error);
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
              placeholder="Ex: Validé"
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
                placeholder="#17a2b8"
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
