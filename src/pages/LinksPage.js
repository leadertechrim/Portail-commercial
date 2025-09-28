import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { linksAPI, linkCategoriesAPI, offerCategoriesAPI } from "../api";
import "./LinksPage.css";

const LinksPage = () => {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [viewingLink, setViewingLink] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Charger les catégories dynamiquement depuis le paramétrage
  const loadCategories = useCallback(async () => {
    try {
      // Charger les catégories depuis l'API
      const [linkCategoriesData, offerCategoriesData] = await Promise.all([
        linkCategoriesAPI.getAll(),
        offerCategoriesAPI.getAll(),
      ]);

      const allCategories = [...linkCategoriesData, ...offerCategoriesData];
      console.log("📁 Catégories chargées depuis l'API:", allCategories);

      if (allCategories.length > 0) {
        setCategories(allCategories.map((cat) => cat.nom));
        // Stocker toutes les catégories pour utilisation dans l'interface
        localStorage.setItem(
          "allCategoriesWithDetails",
          JSON.stringify(allCategories)
        );
      } else {
        // Catégories par défaut si aucune n'est configurée
        const defaultCategories = [
          {
            nom: "Moteurs de recherche",
            couleur: "#007bff",
            description: "Liens vers des moteurs de recherche d'offres",
          },
          {
            nom: "Médias",
            couleur: "#dc3545",
            description: "Liens vers des médias spécialisés",
          },
          {
            nom: "Développement",
            couleur: "#28a745",
            description: "Liens utiles pour le développement",
          },
          {
            nom: "Outils",
            couleur: "#ffc107",
            description: "Outils et ressources utiles",
          },
        ];
        setCategories(defaultCategories.map((cat) => cat.nom));
        localStorage.setItem(
          "allCategoriesWithDetails",
          JSON.stringify(defaultCategories)
        );
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des catégories:", err);
      setCategories([
        "Moteurs de recherche",
        "Médias",
        "Développement",
        "Outils",
      ]);
    }
  }, []);

  // Données de démonstration
  const mockLinks = useMemo(
    () => [
      {
        _id: "1",
        nom: "Google",
        url: "https://www.google.com",
        categorie: "Moteurs de recherche",
        description: "Moteur de recherche principal",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "YouTube",
        url: "https://www.youtube.com",
        categorie: "Médias",
        description: "Plateforme de vidéos",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "GitHub",
        url: "https://www.github.com",
        categorie: "Développement",
        description: "Plateforme de développement",
        ordre: 3,
      },
      {
        _id: "4",
        nom: "LinkedIn",
        url: "https://www.linkedin.com",
        categorie: "Réseaux sociaux",
        description: "Réseau professionnel",
        ordre: 4,
      },
    ],
    []
  );

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true);
      const linksData = await linksAPI.getAll();
      console.log("🔗 Liens chargés depuis l'API:", linksData);
      setLinks(linksData);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des liens:", err);
      setError(`Erreur lors du chargement des liens: ${err.message}`);
      // Fallback vers les données mock en cas d'erreur
      setLinks(mockLinks);
      setLoading(false);
    }
  }, [mockLinks]);

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur") {
      navigate("/sources");
      return;
    }
    loadLinks();
    loadCategories(); // Charger les catégories dynamiquement
  }, [navigate, role, loadLinks, loadCategories]);

  // Écouter les changements dans le localStorage pour les catégories
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "linkCategories" || e.key === "offerCategories") {
        console.log("🔄 Catégories mises à jour, rechargement...");
        loadCategories();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Écouter aussi les changements dans la même fenêtre
    const interval = setInterval(() => {
      const currentLinkCategories = localStorage.getItem("linkCategories");
      const currentOfferCategories = localStorage.getItem("offerCategories");

      let allCurrentCategories = [];

      if (currentLinkCategories) {
        const linkCategoriesData = JSON.parse(currentLinkCategories);
        allCurrentCategories = [...allCurrentCategories, ...linkCategoriesData];
      }

      if (currentOfferCategories) {
        const offerCategoriesData = JSON.parse(currentOfferCategories);
        allCurrentCategories = [
          ...allCurrentCategories,
          ...offerCategoriesData,
        ];
      }

      if (allCurrentCategories.length > 0) {
        const currentCategoryNames = allCurrentCategories.map((cat) => cat.nom);
        const stateCategoryNames = categories;

        // Vérifier si les catégories ont changé
        if (
          JSON.stringify(currentCategoryNames) !==
          JSON.stringify(stateCategoryNames)
        ) {
          console.log(
            "🔄 Catégories détectées comme modifiées, mise à jour..."
          );
          loadCategories();
        }
      }
    }, 1000); // Vérifier toutes les secondes

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [loadCategories, categories]);

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.categorie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || link.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.categorie]) {
      acc[link.categorie] = [];
    }
    acc[link.categorie].push(link);
    return acc;
  }, {});

  const handleCreateLink = async (linkData) => {
    try {
      const newLink = await linksAPI.create(linkData);
      setLinks([...links, newLink]);
      console.log("🔗 Lien créé:", newLink);
      setIsAddModalOpen(false);
      alert("Lien créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du lien:", error);
      alert(`Erreur lors de la création du lien: ${error.message}`);
    }
  };

  const handleUpdateLink = async (linkId, linkData) => {
    try {
      const updatedLink = await linksAPI.update(linkId, linkData);
      const updatedLinks = links.map((link) =>
        link._id === linkId ? updatedLink : link
      );
      setLinks(updatedLinks);
      console.log("🔗 Lien modifié:", updatedLink);
      setIsEditModalOpen(false);
      setEditingLink(null);
      alert("Lien modifié avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification du lien:", error);
      alert(`Erreur lors de la modification du lien: ${error.message}`);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lien ?")) {
      try {
        await linksAPI.delete(linkId);
        const updatedLinks = links.filter((link) => link._id !== linkId);
        setLinks(updatedLinks);
        console.log("🔗 Lien supprimé:", linkId);
        alert("Lien supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression du lien:", error);
        alert(`Erreur lors de la suppression du lien: ${error.message}`);
      }
    }
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setIsEditModalOpen(true);
  };

  const openViewModal = (link) => {
    setViewingLink(link);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setEditingLink(null);
    setViewingLink(null);
  };

  if (loading) {
    return (
      <div className="links-page">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des liens...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="links-page">
      <Sidebar />

      <div className="main-content">
        <div className="links-header">
          <div className="links-header-left">
            <h1>Gestion des Liens Utiles</h1>
          </div>
          <div className="links-header-actions">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {role === "admin" && (
              <button
                className="add-link-btn"
                onClick={() => setIsAddModalOpen(true)}
              >
                <i className="fas fa-plus"></i>
                Nouveau Lien
              </button>
            )}
          </div>
        </div>

        <div className="links-content">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {Object.keys(groupedLinks).length === 0 ? (
            <div className="empty-links">
              <i className="fas fa-link"></i>
              <h3>Aucun lien trouvé</h3>
              <p>Commencez par créer votre premier lien utile</p>
            </div>
          ) : (
            <div className="links-sections">
              {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
                <div key={category} className="links-section">
                  <h2 className="section-title">
                    <i className="fas fa-folder"></i>
                    {category}
                    <span className="count">({categoryLinks.length})</span>
                  </h2>
                  <div className="links-grid">
                    {categoryLinks.map((link) => (
                      <div key={link._id} className="link-card">
                        <div className="link-header">
                          <h3>{link.nom}</h3>
                          <div className="link-actions">
                            <button
                              className="view-btn"
                              onClick={() => openViewModal(link)}
                              title="Voir les détails"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {role === "admin" && (
                              <>
                                <button
                                  className="edit-btn"
                                  onClick={() => openEditModal(link)}
                                  title="Modifier"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDeleteLink(link._id)}
                                  title="Supprimer"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="link-description">{link.description}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-url"
                        >
                          <i className="fas fa-external-link-alt"></i>
                          {link.url}
                        </a>
                        <div className="link-meta">
                          <span className="link-category">
                            <i className="fas fa-tag"></i>
                            {link.categorie}
                          </span>
                          <span className="link-order">
                            <i className="fas fa-sort-numeric-up"></i>
                            Ordre: {link.ordre}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <LinkModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateLink}
          categories={categories}
          title="Nouveau Lien"
        />
      )}

      {isEditModalOpen && editingLink && (
        <LinkModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={(data) => handleUpdateLink(editingLink._id, data)}
          link={editingLink}
          categories={categories}
          title="Modifier le Lien"
        />
      )}

      {isViewModalOpen && viewingLink && (
        <LinkViewModal
          isOpen={isViewModalOpen}
          onClose={closeModals}
          link={viewingLink}
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/modifier un lien
const LinkModal = ({ isOpen, onClose, onSubmit, link, categories, title }) => {
  const [formData, setFormData] = useState({
    nom: "",
    url: "",
    categorie: "",
    description: "",
    ordre: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setFormData({
        nom: link.nom || "",
        url: link.url || "",
        categorie: link.categorie || "",
        description: link.description || "",
        ordre: link.ordre || 1,
      });
    } else {
      setFormData({
        nom: "",
        url: "",
        categorie: "",
        description: "",
        ordre: 1,
      });
    }
  }, [link]);

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
    if (!formData.url.trim()) newErrors.url = "L'URL est requise";
    if (!formData.categorie.trim())
      newErrors.categorie = "La catégorie est requise";
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
            <label htmlFor="nom">Nom *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? "error" : ""}
              placeholder="Nom du lien"
            />
            {errors.nom && <span className="error-message">{errors.nom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="url">URL *</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className={errors.url ? "error" : ""}
              placeholder="https://exemple.com"
            />
            {errors.url && <span className="error-message">{errors.url}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categorie">Catégorie *</label>
            <select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className={errors.categorie ? "error" : ""}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.categorie && (
              <span className="error-message">{errors.categorie}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du lien"
              rows="3"
            />
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

// Composant Modal pour voir les détails d'un lien
const LinkViewModal = ({ isOpen, onClose, link }) => {
  if (!isOpen || !link) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Détails du Lien</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="view-details">
          <div className="detail-group">
            <label>Nom</label>
            <div className="detail-value">{link.nom}</div>
          </div>

          <div className="detail-group">
            <label>URL</label>
            <div className="detail-value">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-preview"
              >
                <i className="fas fa-external-link-alt"></i>
                {link.url}
              </a>
            </div>
          </div>

          <div className="detail-group">
            <label>Catégorie</label>
            <div className="detail-value">{link.categorie}</div>
          </div>

          <div className="detail-group">
            <label>Description</label>
            <div className="detail-value">
              {link.description || "Aucune description"}
            </div>
          </div>

          <div className="detail-group">
            <label>Ordre d'affichage</label>
            <div className="detail-value">{link.ordre}</div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinksPage;
