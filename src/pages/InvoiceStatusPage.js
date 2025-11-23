import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { invoiceStatusesAPI } from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./InvoiceStatusPage.css";

const InvoiceStatusPage = () => {
  // Charger les états depuis localStorage en premier pour affichage immédiat
  const [statuses, setStatuses] = useState(() => {
    const cached = localStorage.getItem("invoiceStatuses");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("📦 États de factures chargés depuis le cache:", parsed);
        return parsed;
      } catch (e) {
        console.warn("Erreur lors du parsing des états en cache:", e);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false); // Commencer à false car on a déjà les états en cache
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

  // États initiaux pour les factures selon les spécifications
  const initialStatuses = useMemo(
    () => [
      {
        _id: "1",
        nom: "A envoyer au client",
        couleur: "#ffc107", // Jaune
        description: "Facture à envoyer au client",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "En attente de payement",
        couleur: "#f67800", // Orange
        description: "Facture en attente de paiement",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "Payée",
        couleur: "#28a745", // Vert
        description: "Facture payée par le client",
        ordre: 3,
      },
    ],
    []
  );

  const loadStatuses = useCallback(async () => {
    // Vérifier si on a déjà des états en cache dans localStorage
    const cached = localStorage.getItem("invoiceStatuses");
    const hasCachedStatuses = cached && cached.length > 0;

    // Éviter le double chargement si déjà en cours
    if (hasLoadedRef.current) {
      return;
    }

    try {
      hasLoadedRef.current = true;
      // Ne pas bloquer si on a déjà des états en cache
      if (!hasCachedStatuses) {
        setLoading(true);
        console.log(
          "📋 Chargement des états de factures depuis l'API Flask..."
        );
      }

      // Charger depuis l'API Flask
      const apiStatuses = await invoiceStatusesAPI.getAll();

      if (apiStatuses && apiStatuses.length > 0) {
        console.log("📋 États de factures chargés depuis l'API:", apiStatuses);
        setStatuses(apiStatuses);
        // Sauvegarder dans localStorage pour la synchronisation
        localStorage.setItem("invoiceStatuses", JSON.stringify(apiStatuses));
      } else {
        // Si pas de cache, utiliser les états initiaux
        if (!hasCachedStatuses) {
          console.log("📋 Aucun état trouvé, utilisation des états initiaux");
          setStatuses(initialStatuses);
          localStorage.setItem(
            "invoiceStatuses",
            JSON.stringify(initialStatuses)
          );
          // Créer les états initiaux dans l'API
          for (const status of initialStatuses) {
            try {
              await invoiceStatusesAPI.create(status);
            } catch (err) {
              console.warn(
                "Erreur lors de la création de l'état initial:",
                err
              );
            }
          }
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des états:", err);
      // En cas d'erreur, garder les états en cache si disponibles
      if (!hasCachedStatuses) {
        setError(`Erreur lors du chargement des états: ${err.message}`);
        setStatuses(initialStatuses);
        localStorage.setItem(
          "invoiceStatuses",
          JSON.stringify(initialStatuses)
        );
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
      const newStatus = await invoiceStatusesAPI.create(newStatusData);

      // Mettre à jour l'état local
      const updatedStatuses = [...statuses, newStatus];
      setStatuses(updatedStatuses);
      // Sauvegarder dans localStorage
      localStorage.setItem("invoiceStatuses", JSON.stringify(updatedStatuses));
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("invoiceStatusesUpdated"));
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
      const updatedStatus = await invoiceStatusesAPI.update(
        statusId,
        statusData
      );

      // Mettre à jour l'état local
      const updatedStatuses = statuses.map((status) =>
        status._id === statusId ? updatedStatus : status
      );
      setStatuses(updatedStatuses);
      // Sauvegarder dans localStorage
      localStorage.setItem("invoiceStatuses", JSON.stringify(updatedStatuses));
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("invoiceStatusesUpdated"));
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
        await invoiceStatusesAPI.delete(statusId);

        // Mettre à jour l'état local
        const updatedStatuses = statuses.filter(
          (status) => status._id !== statusId
        );
        setStatuses(updatedStatuses);
        // Sauvegarder dans localStorage
        localStorage.setItem(
          "invoiceStatuses",
          JSON.stringify(updatedStatuses)
        );
        // Déclencher un événement pour notifier les autres composants
        window.dispatchEvent(new Event("invoiceStatusesUpdated"));
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
      <div className="invoice-status-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des états...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-status-page">
      <div className="main-content">
        <div className="status-header">
          <div className="status-header-left"></div>
          <div className="status-header-actions">
            <input
              type="text"
              placeholder="Rechercher un état..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {hasPermission("invoice_status_manage") && (
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
              <i className="fas fa-file-invoice-dollar"></i>
              <h3>Aucun état trouvé</h3>
              <p>Commencez par créer votre premier état de facture</p>
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
                      {hasPermission("invoice_status_manage") && (
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
    { name: "Bleu", value: "#17a2b8" },
    { name: "Vert", value: "#28a745" },
    { name: "Rouge", value: "#dc3545" },
    { name: "Orange", value: "#f67800" },
    { name: "Violet", value: "#6f42c1" },
    { name: "Jaune", value: "#ffc107" },
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
              placeholder="Ex: Payée"
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

export default InvoiceStatusPage;
