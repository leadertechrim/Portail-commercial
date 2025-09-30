import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./SettingsPage.css";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("quote-status");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // États initiaux pour les devis selon les spécifications
  const initialQuoteStatuses = useMemo(
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

  // États initiaux pour les factures selon les spécifications
  const initialInvoiceStatuses = useMemo(
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

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur") {
      navigate("/sources");
      return;
    }
  }, [navigate, role]);

  // États initiaux pour les offres selon les spécifications
  const initialOfferStatuses = useMemo(
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
        description: "Offre en cours de préparation",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "Envoyée",
        couleur: "#28a745", // Vert
        description: "Offre envoyée au client",
        ordre: 3,
      },
    ],
    []
  );

  // Rôles initiaux selon les spécifications
  const initialRoles = useMemo(
    () => [
      {
        _id: "1",
        nom: "Commercial",
        description: "Utilisateur commercial",
        permissions: ["read_offers", "create_quotes", "create_invoices"],
        couleur: "#007bff", // Bleu
      },
      {
        _id: "2",
        nom: "Visiteur",
        description: "Utilisateur spectateur",
        permissions: ["read_offers", "read_quotes", "read_invoices"],
        couleur: "#6c757d", // Gris
      },
      {
        _id: "3",
        nom: "Directeur",
        description: "Administrateur",
        permissions: ["all"],
        couleur: "#f67800", // Orange
      },
    ],
    []
  );

  // Catégories d'offres initiales
  const initialOfferCategories = useMemo(
    () => [
      {
        _id: "1",
        nom: "Informatique",
        description: "Offres liées à l'informatique et aux technologies",
        couleur: "#007bff",
      },
      {
        _id: "2",
        nom: "Construction",
        description: "Offres de construction et travaux",
        couleur: "#28a745",
      },
      {
        _id: "3",
        nom: "Services",
        description: "Offres de services divers",
        couleur: "#ffc107",
      },
      {
        _id: "4",
        nom: "Consulting",
        description: "Offres de conseil et expertise",
        couleur: "#6f42c1",
      },
    ],
    []
  );

  // Catégories de liens initiales
  const initialLinkCategories = useMemo(
    () => [
      {
        _id: "1",
        nom: "Moteurs de recherche",
        description: "Liens vers des moteurs de recherche d'offres",
        couleur: "#007bff",
      },
      {
        _id: "2",
        nom: "Médias",
        description: "Liens vers des médias spécialisés",
        couleur: "#dc3545",
      },
      {
        _id: "3",
        nom: "Développement",
        description: "Liens utiles pour le développement",
        couleur: "#28a745",
      },
      {
        _id: "4",
        nom: "Outils",
        description: "Outils et ressources utiles",
        couleur: "#ffc107",
      },
    ],
    []
  );

  const tabs = [
    {
      id: "quote-status",
      label: "États Devis",
      icon: "fas fa-file-invoice",
      description: "Gérer les états des devis",
    },
    {
      id: "invoice-status",
      label: "États Factures",
      icon: "fas fa-file-invoice-dollar",
      description: "Gérer les états des factures",
    },
    {
      id: "offer-status",
      label: "États Offres",
      icon: "fas fa-clipboard-check",
      description: "Gérer les états des offres",
    },
    {
      id: "roles",
      label: "Rôles & Permissions",
      icon: "fas fa-users-cog",
      description: "Gérer les rôles utilisateurs",
    },
    {
      id: "offer-categories",
      label: "Catégories Offres",
      icon: "fas fa-tags",
      description: "Gérer les catégories d'offres",
    },
    {
      id: "link-categories",
      label: "Catégories Liens",
      icon: "fas fa-link",
      description: "Gérer les catégories de liens",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "quote-status":
        return (
          <StatusManagement
            type="quote"
            title="Gestion des États de Devis"
            description="Configurez les états disponibles pour les devis avec leurs couleurs"
            initialStatuses={initialQuoteStatuses}
            storageKey="quoteStatuses"
          />
        );
      case "invoice-status":
        return (
          <StatusManagement
            type="invoice"
            title="Gestion des États de Factures"
            description="Configurez les états disponibles pour les factures avec leurs couleurs"
            initialStatuses={initialInvoiceStatuses}
            storageKey="invoiceStatuses"
          />
        );
      case "offer-status":
        return (
          <OfferStatusManagement initialOfferStatuses={initialOfferStatuses} />
        );
      case "roles":
        return <RolesManagement initialRoles={initialRoles} />;
      case "offer-categories":
        return (
          <OfferCategoriesManagement
            initialOfferCategories={initialOfferCategories}
          />
        );
      case "link-categories":
        return (
          <LinkCategoriesManagement
            initialLinkCategories={initialLinkCategories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="settings-page">
        <div className="main-content">
          <div className="settings-header">
            <h1>Paramétrage de l'Application</h1>
            <p>Configurez tous les paramètres de votre application</p>
          </div>

          <div className="settings-content">
            <div className="settings-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.description}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="tab-content">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Composant de gestion des états (devis et factures)
const StatusManagement = ({
  type,
  title,
  description,
  initialStatuses,
  storageKey,
}) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const role = localStorage.getItem("role");

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);
      // Charger depuis le localStorage ou utiliser les états initiaux
      const savedStatuses = localStorage.getItem(storageKey);
      if (savedStatuses) {
        setStatuses(JSON.parse(savedStatuses));
      } else {
        setStatuses(initialStatuses);
        // Sauvegarder les états initiaux dans le localStorage
        localStorage.setItem(storageKey, JSON.stringify(initialStatuses));
      }
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des états:", err);
      setError(`Erreur lors du chargement des états: ${err.message}`);
      setStatuses([]);
      setLoading(false);
    }
  }, [initialStatuses, storageKey]);

  useEffect(() => {
    loadStatuses();
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
      // Sauvegarder dans le localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedStatuses));
      setIsAddModalOpen(false);
      alert("État créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de l'état:", error);
      alert("Erreur lors de la création de l'état");
    }
  };

  const handleUpdateStatus = async (statusId, statusData) => {
    try {
      const updatedStatuses = statuses.map((status) =>
        status._id === statusId ? { ...status, ...statusData } : status
      );
      setStatuses(updatedStatuses);
      // Sauvegarder dans le localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedStatuses));
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
        const updatedStatuses = statuses.filter(
          (status) => status._id !== statusId
        );
        setStatuses(updatedStatuses);
        // Sauvegarder dans le localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedStatuses));
        alert("État supprimé avec succès");
      } catch (error) {
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
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Chargement des états...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-management">
      <div className="status-header">
        <div className="status-header-left">
          <h2>{title}</h2>
          <p>{description}</p>
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
            <p>Commencez par créer votre premier état</p>
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

// Composants pour les autres sections
const OfferStatusManagement = ({ initialOfferStatuses }) => (
  <StatusManagement
    type="offer"
    title="Gestion des États d'Offres"
    description="Configurez les états disponibles pour les offres avec leurs couleurs"
    initialStatuses={initialOfferStatuses}
    storageKey="offerStatuses"
  />
);

const RolesManagement = ({ initialRoles }) => (
  <RolesManagementComponent
    title="Gestion des Rôles & Permissions"
    description="Configurez les rôles utilisateurs et leurs permissions"
    initialRoles={initialRoles}
    storageKey="userRoles"
  />
);

const OfferCategoriesManagement = ({ initialOfferCategories }) => (
  <CategoriesManagement
    type="offer"
    title="Gestion des Catégories d'Offres"
    description="Configurez les catégories d'offres disponibles"
    initialCategories={initialOfferCategories}
    storageKey="offerCategories"
  />
);

const LinkCategoriesManagement = ({ initialLinkCategories }) => (
  <CategoriesManagement
    type="link"
    title="Gestion des Catégories de Liens"
    description="Configurez les catégories de liens utiles"
    initialCategories={initialLinkCategories}
    storageKey="linkCategories"
  />
);

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
  const [colorSearchTerm, setColorSearchTerm] = useState("");

  // Couleurs prédéfinies améliorées avec noms et codes
  const predefinedColors = [
    // Couleurs principales
    { name: "Gris", value: "#6c757d", description: "Neutre" },
    { name: "Jaune", value: "#ffc107", description: "Attention" },
    { name: "Vert", value: "#28a745", description: "Succès" },
    { name: "Rouge", value: "#dc3545", description: "Erreur" },
    { name: "Orange", value: "#f67800", description: "Votre couleur" },
    { name: "Bleu", value: "#007bff", description: "Information" },
    { name: "Violet", value: "#6f42c1", description: "Premium" },
    { name: "Noir", value: "#343a40", description: "Sombre" },

    // Couleurs secondaires
    { name: "Rose", value: "#e83e8c", description: "Féminin" },
    { name: "Cyan", value: "#17a2b8", description: "Moderne" },
    { name: "Indigo", value: "#6610f2", description: "Professionnel" },
    { name: "Teal", value: "#20c997", description: "Nature" },

    // Couleurs supplémentaires
    { name: "Bleu Clair", value: "#5bc0de", description: "Ciel" },
    { name: "Vert Clair", value: "#5cb85c", description: "Menthe" },
    { name: "Rouge Clair", value: "#d9534f", description: "Corail" },
    { name: "Jaune Clair", value: "#f0ad4e", description: "Ambre" },
    { name: "Violet Clair", value: "#9c27b0", description: "Lavande" },
    { name: "Orange Clair", value: "#ff9800", description: "Citrouille" },

    // Couleurs sombres
    { name: "Bleu Sombre", value: "#1e3a8a", description: "Nuit" },
    { name: "Vert Sombre", value: "#166534", description: "Forêt" },
    { name: "Rouge Sombre", value: "#991b1b", description: "Bordeaux" },
    { name: "Violet Sombre", value: "#4c1d95", description: "Aubergine" },
    { name: "Orange Sombre", value: "#c2410c", description: "Rouille" },
    { name: "Gris Sombre", value: "#374151", description: "Charbon" },

    // Couleurs pastel
    { name: "Rose Pastel", value: "#f8bbd9", description: "Pêche" },
    { name: "Bleu Pastel", value: "#b3d9ff", description: "Nuage" },
    { name: "Vert Pastel", value: "#c8e6c9", description: "Menthe" },
    { name: "Jaune Pastel", value: "#fff9c4", description: "Crème" },
    { name: "Violet Pastel", value: "#e1bee7", description: "Lilas" },
    { name: "Orange Pastel", value: "#ffcc80", description: "Pêche" },

    // Couleurs métalliques
    { name: "Or", value: "#ffd700", description: "Doré" },
    { name: "Argent", value: "#c0c0c0", description: "Argenté" },
    { name: "Bronze", value: "#cd7f32", description: "Bronzé" },
    { name: "Cuivre", value: "#b87333", description: "Cuivré" },

    // Couleurs spéciales
    { name: "Blanc", value: "#ffffff", description: "Pur" },
    { name: "Turquoise", value: "#40e0d0", description: "Océan" },
    { name: "Magenta", value: "#ff00ff", description: "Vif" },
    { name: "Lime", value: "#32cd32", description: "Acide" },
    { name: "Navy", value: "#000080", description: "Marine" },
    { name: "Maroon", value: "#800000", description: "Bordeaux" },
  ];

  // Filtrer les couleurs selon le terme de recherche
  const filteredColors = predefinedColors.filter(
    (color) =>
      color.name.toLowerCase().includes(colorSearchTerm.toLowerCase()) ||
      color.description.toLowerCase().includes(colorSearchTerm.toLowerCase()) ||
      color.value.toLowerCase().includes(colorSearchTerm.toLowerCase())
  );

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
              <input
                type="text"
                placeholder="Rechercher une couleur..."
                value={colorSearchTerm}
                onChange={(e) => setColorSearchTerm(e.target.value)}
                className="color-search-input"
              />
              <div className="color-options">
                {filteredColors.map((color) => (
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
                    title={`${color.name} - ${color.description}`}
                  >
                    <span className="color-name">{color.name}</span>
                    <span className="color-code">{color.value}</span>
                  </button>
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

// Composant de gestion des rôles
const RolesManagementComponent = ({
  title,
  description,
  initialRoles,
  storageKey,
}) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const role = localStorage.getItem("role");

  const availablePermissions = [
    { id: "read_offers", label: "Lire les offres", category: "Offres" },
    { id: "create_offers", label: "Créer des offres", category: "Offres" },
    { id: "edit_offers", label: "Modifier les offres", category: "Offres" },
    { id: "delete_offers", label: "Supprimer les offres", category: "Offres" },
    { id: "read_quotes", label: "Lire les devis", category: "Devis" },
    { id: "create_quotes", label: "Créer des devis", category: "Devis" },
    { id: "edit_quotes", label: "Modifier les devis", category: "Devis" },
    { id: "delete_quotes", label: "Supprimer les devis", category: "Devis" },
    { id: "read_invoices", label: "Lire les factures", category: "Factures" },
    {
      id: "create_invoices",
      label: "Créer des factures",
      category: "Factures",
    },
    {
      id: "edit_invoices",
      label: "Modifier les factures",
      category: "Factures",
    },
    {
      id: "delete_invoices",
      label: "Supprimer les factures",
      category: "Factures",
    },
    {
      id: "manage_users",
      label: "Gérer les utilisateurs",
      category: "Administration",
    },
    {
      id: "manage_settings",
      label: "Gérer les paramètres",
      category: "Administration",
    },
    { id: "all", label: "Toutes les permissions", category: "Administration" },
  ];

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const savedRoles = localStorage.getItem(storageKey);
      if (savedRoles) {
        setRoles(JSON.parse(savedRoles));
      } else {
        setRoles(initialRoles);
        localStorage.setItem(storageKey, JSON.stringify(initialRoles));
      }
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des rôles:", err);
      setError(`Erreur lors du chargement des rôles: ${err.message}`);
      setRoles([]);
      setLoading(false);
    }
  }, [initialRoles, storageKey]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const filteredRoles = roles.filter(
    (role) =>
      role.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = async (roleData) => {
    try {
      const newRole = {
        _id: Date.now().toString(),
        ...roleData,
      };
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      localStorage.setItem(storageKey, JSON.stringify(updatedRoles));
      setIsAddModalOpen(false);
      alert("Rôle créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du rôle:", error);
      alert("Erreur lors de la création du rôle");
    }
  };

  const handleUpdateRole = async (roleId, roleData) => {
    try {
      const updatedRoles = roles.map((role) =>
        role._id === roleId ? { ...role, ...roleData } : role
      );
      setRoles(updatedRoles);
      localStorage.setItem(storageKey, JSON.stringify(updatedRoles));
      setIsEditModalOpen(false);
      setEditingRole(null);
      alert("Rôle modifié avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
      alert("Erreur lors de la modification du rôle");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
      try {
        const updatedRoles = roles.filter((role) => role._id !== roleId);
        setRoles(updatedRoles);
        localStorage.setItem(storageKey, JSON.stringify(updatedRoles));
        alert("Rôle supprimé avec succès");
      } catch (error) {
        alert("Erreur lors de la suppression du rôle");
      }
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingRole(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Chargement des rôles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-management">
      <div className="status-header">
        <div className="status-header-left">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="status-header-actions">
          <input
            type="text"
            placeholder="Rechercher un rôle..."
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
              Nouveau Rôle
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

        {filteredRoles.length === 0 ? (
          <div className="empty-statuses">
            <i className="fas fa-users-cog"></i>
            <h3>Aucun rôle trouvé</h3>
            <p>Commencez par créer votre premier rôle</p>
          </div>
        ) : (
          <div className="status-grid">
            {filteredRoles.map((role) => (
              <div key={role._id} className="status-card">
                <div className="status-header">
                  <div
                    className="status-color-indicator"
                    style={{ backgroundColor: role.couleur }}
                  ></div>
                  <h3>{role.nom}</h3>
                  <div className="status-actions">
                    {role === "admin" && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(role)}
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteRole(role._id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="status-details">
                  <p className="status-description">{role.description}</p>
                  <div className="status-meta">
                    <span className="status-color">
                      <i className="fas fa-palette"></i>
                      {role.couleur}
                    </span>
                    <span className="status-order">
                      <i className="fas fa-shield-alt"></i>
                      {role.permissions.length} permissions
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <RoleModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateRole}
          title="Nouveau Rôle"
          availablePermissions={availablePermissions}
        />
      )}

      {isEditModalOpen && editingRole && (
        <RoleModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={(data) => handleUpdateRole(editingRole._id, data)}
          role={editingRole}
          title="Modifier le Rôle"
          availablePermissions={availablePermissions}
        />
      )}
    </div>
  );
};

// Composant de gestion des catégories
const CategoriesManagement = ({
  type,
  title,
  description,
  initialCategories,
  storageKey,
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const role = localStorage.getItem("role");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const savedCategories = localStorage.getItem(storageKey);
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        setCategories(initialCategories);
        localStorage.setItem(storageKey, JSON.stringify(initialCategories));
      }
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
      setError(`Erreur lors du chargement des catégories: ${err.message}`);
      setCategories([]);
      setLoading(false);
    }
  }, [initialCategories, storageKey]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter(
    (category) =>
      category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = {
        _id: Date.now().toString(),
        ...categoryData,
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem(storageKey, JSON.stringify(updatedCategories));
      setIsAddModalOpen(false);
      alert("Catégorie créée avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error);
      alert("Erreur lors de la création de la catégorie");
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      const updatedCategories = categories.map((category) =>
        category._id === categoryId
          ? { ...category, ...categoryData }
          : category
      );
      setCategories(updatedCategories);
      localStorage.setItem(storageKey, JSON.stringify(updatedCategories));
      setIsEditModalOpen(false);
      setEditingCategory(null);
      alert("Catégorie modifiée avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification de la catégorie:", error);
      alert("Erreur lors de la modification de la catégorie");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        const updatedCategories = categories.filter(
          (category) => category._id !== categoryId
        );
        setCategories(updatedCategories);
        localStorage.setItem(storageKey, JSON.stringify(updatedCategories));
        alert("Catégorie supprimée avec succès");
      } catch (error) {
        alert("Erreur lors de la suppression de la catégorie");
      }
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-management">
      <div className="status-header">
        <div className="status-header-left">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="status-header-actions">
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
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
              Nouvelle Catégorie
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

        {filteredCategories.length === 0 ? (
          <div className="empty-statuses">
            <i className="fas fa-folder"></i>
            <h3>Aucune catégorie trouvée</h3>
            <p>Commencez par créer votre première catégorie</p>
          </div>
        ) : (
          <div className="status-grid">
            {filteredCategories.map((category) => (
              <div key={category._id} className="status-card">
                <div className="status-header">
                  <div
                    className="status-color-indicator"
                    style={{ backgroundColor: category.couleur }}
                  ></div>
                  <h3>{category.nom}</h3>
                  <div className="status-actions">
                    {role === "admin" && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(category)}
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCategory(category._id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="status-details">
                  <p className="status-description">{category.description}</p>
                  <div className="status-meta">
                    <span className="status-color">
                      <i className="fas fa-palette"></i>
                      {category.couleur}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <CategoryModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateCategory}
          title="Nouvelle Catégorie"
        />
      )}

      {isEditModalOpen && editingCategory && (
        <CategoryModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={(data) => handleUpdateCategory(editingCategory._id, data)}
          category={editingCategory}
          title="Modifier la Catégorie"
        />
      )}
    </div>
  );
};

// Composant Modal pour les rôles
const RoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  role,
  title,
  availablePermissions,
}) => {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    couleur: "#6c757d",
    permissions: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        nom: role.nom || "",
        description: role.description || "",
        couleur: role.couleur || "#6c757d",
        permissions: role.permissions || [],
      });
    } else {
      setFormData({
        nom: "",
        description: "",
        couleur: "#6c757d",
        permissions: [],
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

  const handlePermissionChange = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.description.trim())
      newErrors.description = "La description est requise";
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
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              placeholder="Description du rôle"
              rows="3"
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="couleur">Couleur</label>
            <input
              type="color"
              id="couleur"
              name="couleur"
              value={formData.couleur}
              onChange={handleChange}
              className="color-picker"
            />
          </div>

          <div className="form-group">
            <label>Permissions</label>
            <div className="permissions-grid">
              {availablePermissions.map((permission) => (
                <label key={permission.id} className="permission-item">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                  <span className="permission-label">{permission.label}</span>
                  <span className="permission-category">
                    {permission.category}
                  </span>
                </label>
              ))}
            </div>
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

// Composant Modal pour les catégories
const CategoryModal = ({ isOpen, onClose, onSubmit, category, title }) => {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    couleur: "#6c757d",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        nom: category.nom || "",
        description: category.description || "",
        couleur: category.couleur || "#6c757d",
      });
    } else {
      setFormData({
        nom: "",
        description: "",
        couleur: "#6c757d",
      });
    }
  }, [category]);

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
    if (!formData.description.trim())
      newErrors.description = "La description est requise";
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
            <label htmlFor="nom">Nom de la catégorie *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? "error" : ""}
              placeholder="Ex: Informatique"
            />
            {errors.nom && <span className="error-message">{errors.nom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              placeholder="Description de la catégorie"
              rows="3"
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="couleur">Couleur</label>
            <input
              type="color"
              id="couleur"
              name="couleur"
              value={formData.couleur}
              onChange={handleChange}
              className="color-picker"
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

export default SettingsPage;
