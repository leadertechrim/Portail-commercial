import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { offerStatusesAPI } from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./OfferStatusPage.css";

const OfferStatusPage = () => {
  // Charger les statuts depuis localStorage en premier pour affichage immédiat
  const [statuses, setStatuses] = useState(() => {
    const cached = localStorage.getItem("offerStatuses");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("📦 Statuts d'offres chargés depuis le cache:", parsed);
        return parsed;
      } catch (e) {
        console.warn("Erreur lors du parsing des statuts en cache:", e);
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
    // Vérifier si on a déjà des statuts en cache dans localStorage
    const cached = localStorage.getItem("offerStatuses");
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
        console.log("📋 Chargement des statuts d'offres depuis l'API Flask...");
      }

      // Charger depuis l'API Flask
      const apiStatuses = await offerStatusesAPI.getAll();

      if (apiStatuses && apiStatuses.length > 0) {
        console.log("📋 Statuts d'offres chargés depuis l'API:", apiStatuses);
        setStatuses(apiStatuses);
        // Sauvegarder dans localStorage pour la synchronisation
        localStorage.setItem("offerStatuses", JSON.stringify(apiStatuses));
      } else {
        // Si pas de cache, utiliser les statuts initiaux
        if (!hasCachedStatuses) {
          console.log(
            "📋 Aucun statut trouvé, utilisation des statuts initiaux"
          );
          setStatuses(initialStatuses);
          localStorage.setItem(
            "offerStatuses",
            JSON.stringify(initialStatuses)
          );
          // Créer les statuts initiaux dans l'API
          for (const status of initialStatuses) {
            try {
              await offerStatusesAPI.create(status);
            } catch (err) {
              console.warn(
                "Erreur lors de la création du statut initial:",
                err
              );
            }
          }
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des statuts:", err);
      // En cas d'erreur, garder les statuts en cache si disponibles
      if (!hasCachedStatuses) {
        setError(`Erreur lors du chargement des statuts: ${err.message}`);
        setStatuses(initialStatuses);
        localStorage.setItem("offerStatuses", JSON.stringify(initialStatuses));
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
      // Seulement si c'est un changement de offerStatuses
      if (e && e.key === "offerStatuses") {
        console.log(
          "🔄 Synchronisation des statuts d'offres depuis localStorage..."
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
    window.addEventListener("offerStatusesUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("offerStatusesUpdated", handleCustomEvent);
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
      const _newStatus = await offerStatusesAPI.create(newStatusData);

      // Recharger depuis l'API pour avoir les données à jour
      hasLoadedRef.current = false;
      await loadStatuses();

      setIsAddModalOpen(false);
      alert("Statut créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du statut:", error);
      alert(
        "Erreur lors de la création du statut: " +
          (error.message || "Erreur inconnue")
      );
    }
  };

  const handleUpdateStatus = async (statusId, statusData) => {
    try {
      // Mettre à jour via l'API Flask
      await offerStatusesAPI.update(statusId, statusData);

      // Recharger depuis l'API pour avoir les données à jour
      hasLoadedRef.current = false;
      await loadStatuses();

      setIsEditModalOpen(false);
      setEditingStatus(null);
      alert("Statut modifié avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      alert(
        "Erreur lors de la modification du statut: " +
          (error.message || "Erreur inconnue")
      );
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce statut ?")) {
      try {
        // Supprimer via l'API Flask
        await offerStatusesAPI.delete(statusId);

        // Recharger depuis l'API pour avoir les données à jour
        hasLoadedRef.current = false;
        await loadStatuses();

        alert("Statut supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression du statut:", error);
        alert(
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
    <div className="offer-status-page">
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
            {hasPermission("offer_status_manage") && (
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
                      {hasPermission("offer_status_manage") && (
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
    couleur: "#f67800",
    description: "",
    ordre: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Couleurs prédéfinies - Palette épurée et élégante
  const predefinedColors = [
    { name: "Bleu Saphir", value: "#2563EB" },
    { name: "Vert Menthe", value: "#059669" },
    { name: "Rouge Rubis", value: "#DC2626" },
    { name: "Orange Sunset", value: "#EA580C" },
    { name: "Violet Améthyste", value: "#7C3AED" },
    { name: "Gris Perle", value: "#475569" },
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
                    style={{ 
                      backgroundColor: color.value,
                      backgroundImage: 'none'
                    }}
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
