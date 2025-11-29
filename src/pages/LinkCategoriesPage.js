import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { linkCategoriesAPI } from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./LinkCategoriesPage.css";

const LinkCategoriesPage = () => {
  // Charger les catégories depuis localStorage en premier pour affichage immédiat
  const [categories, setCategories] = useState(() => {
    const cached = localStorage.getItem("linkCategories");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("📦 Catégories de liens chargées depuis le cache:", parsed);
        return parsed;
      } catch (e) {
        console.warn("Erreur lors du parsing des catégories en cache:", e);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false); // Commencer à false car on a déjà les catégories en cache
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const _navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const _role = localStorage.getItem("role");
  const hasLoadedRef = useRef(false);

  // Catégories initiales pour les liens
  const initialCategories = useMemo(
    () => [
      {
        _id: "1",
        nom: "Moteurs de recherche",
        description: "Sites de recherche et navigation",
        couleur: "#007bff",
        ordre: 1,
      },
      {
        _id: "2",
        nom: "Médias",
        description: "Plateformes de contenu multimédia",
        couleur: "#dc3545",
        ordre: 2,
      },
      {
        _id: "3",
        nom: "Développement",
        description: "Outils et ressources pour développeurs",
        couleur: "#28a745",
        ordre: 3,
      },
      {
        _id: "4",
        nom: "Réseaux sociaux",
        description: "Plateformes de réseaux sociaux",
        couleur: "#17a2b8",
        ordre: 4,
      },
      {
        _id: "5",
        nom: "Outils",
        description: "Outils et utilitaires en ligne",
        couleur: "#ffc107",
        ordre: 5,
      },
      {
        _id: "6",
        nom: "Documentation",
        description: "Ressources de documentation technique",
        couleur: "#6f42c1",
        ordre: 6,
      },
    ],
    []
  );

  const loadCategories = useCallback(async () => {
    // Vérifier si on a déjà des catégories en cache dans localStorage
    const cached = localStorage.getItem("linkCategories");
    const hasCachedCategories = cached && cached.length > 0;

    // Éviter le double chargement si déjà en cours
    if (hasLoadedRef.current) {
      return;
    }

    try {
      hasLoadedRef.current = true;
      // Ne pas bloquer si on a déjà des catégories en cache
      if (!hasCachedCategories) {
        setLoading(true);
        console.log("🔄 Début du chargement des catégories de liens...");
      }

      const categoriesData = await linkCategoriesAPI.getAll();
      setCategories(categoriesData);
      // Sauvegarder dans localStorage pour la synchronisation
      localStorage.setItem("linkCategories", JSON.stringify(categoriesData));
      setLoading(false);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des catégories:", err);
      // En cas d'erreur, garder les catégories en cache si disponibles
      if (!hasCachedCategories) {
        setError(`Erreur lors du chargement des catégories: ${err.message}`);
        setCategories(initialCategories);
        localStorage.setItem(
          "linkCategories",
          JSON.stringify(initialCategories)
        );
        hasLoadedRef.current = false; // Réessayer au prochain montage en cas d'erreur
      }
      setLoading(false);
    }
  }, [initialCategories]);

  useEffect(() => {
    if (permissionsLoading) return;
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading]); // Ne dépendre que de permissionsLoading

  const filteredCategories = categories.filter(
    (category) =>
      category.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = await linkCategoriesAPI.create(categoryData);
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      // Sauvegarder dans localStorage
      localStorage.setItem("linkCategories", JSON.stringify(updatedCategories));
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("linkCategoriesUpdated"));
      console.log("📁 Catégorie de lien créée:", newCategory);
      setIsAddModalOpen(false);
      alert("Catégorie créée avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error);
      alert(`Erreur lors de la création de la catégorie: ${error.message}`);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      const updatedCategory = await linkCategoriesAPI.update(
        categoryId,
        categoryData
      );
      const updatedCategories = categories.map((category) =>
        category._id === categoryId ? updatedCategory : category
      );
      setCategories(updatedCategories);
      // Sauvegarder dans localStorage
      localStorage.setItem("linkCategories", JSON.stringify(updatedCategories));
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event("linkCategoriesUpdated"));
      console.log("📁 Catégorie de lien modifiée:", updatedCategory);
      setIsEditModalOpen(false);
      setEditingCategory(null);
      alert("Catégorie modifiée avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification de la catégorie:", error);
      alert(`Erreur lors de la modification de la catégorie: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        await linkCategoriesAPI.delete(categoryId);
        const updatedCategories = categories.filter(
          (category) => category._id !== categoryId
        );
        setCategories(updatedCategories);
        // Sauvegarder dans localStorage
        localStorage.setItem(
          "linkCategories",
          JSON.stringify(updatedCategories)
        );
        // Déclencher un événement pour notifier les autres composants
        window.dispatchEvent(new Event("linkCategoriesUpdated"));
        console.log("📁 Catégorie de lien supprimée:", categoryId);
        alert("Catégorie supprimée avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error);
        alert(
          `Erreur lors de la suppression de la catégorie: ${error.message}`
        );
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
      <div className="link-categories-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des catégories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="link-categories-page">
      <div className="main-content">
        <div className="categories-header">
          <div className="categories-header-left"></div>
          <div className="categories-header-actions">
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {hasPermission("link_categories_manage") && (
              <button
                className="add-category-btn"
                onClick={() => setIsAddModalOpen(true)}
              >
                <i className="fas fa-plus"></i>
                Nouvelle Catégorie
              </button>
            )}
          </div>
        </div>

        <div className="categories-content">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {filteredCategories.length === 0 ? (
            <div className="empty-categories">
              <i className="fas fa-link"></i>
              <h3>Aucune catégorie trouvée</h3>
              <p>Commencez par créer votre première catégorie de lien</p>
            </div>
          ) : (
            <div className="categories-grid">
              {filteredCategories.map((category) => (
                <div key={category._id} className="category-card">
                  <div className="category-header">
                    <div
                      className="category-color-indicator"
                      style={{ backgroundColor: category.couleur }}
                    ></div>
                    <h3>{category.nom}</h3>
                    <div className="category-actions">
                      {hasPermission("link_categories_manage") && (
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
                  <div className="category-details">
                    <p className="category-description">
                      {category.description}
                    </p>
                    <div className="category-meta">
                      <span className="category-color">
                        <i className="fas fa-palette"></i>
                        {category.couleur}
                      </span>
                      <span className="category-order">
                        <i className="fas fa-sort-numeric-up"></i>
                        Ordre: {category.ordre}
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

// Composant Modal pour ajouter/modifier une catégorie
const CategoryModal = ({ isOpen, onClose, onSubmit, category, title }) => {
  const [formData, setFormData] = useState({
    nom: "",
    couleur: "#007bff",
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
    if (category) {
      setFormData({
        nom: category.nom || "",
        couleur: category.couleur || "#007bff",
        description: category.description || "",
        ordre: category.ordre || 1,
      });
    } else {
      setFormData({
        nom: "",
        couleur: "#007bff",
        description: "",
        ordre: 1,
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
            <label htmlFor="nom">Nom de la catégorie *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? "error" : ""}
              placeholder="Ex: Moteurs de recherche"
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
              placeholder="Description de la catégorie"
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
                placeholder="#007bff"
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

export default LinkCategoriesPage;
