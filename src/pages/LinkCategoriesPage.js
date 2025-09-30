import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { linkCategoriesAPI } from "../api";
import "./LinkCategoriesPage.css";

const LinkCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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
    try {
      setLoading(true);
      const categoriesData = await linkCategoriesAPI.getAll();
      setCategories(categoriesData);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
      setError(`Erreur lors du chargement des catégories: ${err.message}`);
      // Fallback vers les données locales en cas d'erreur
      setCategories(initialCategories);
      setLoading(false);
    }
  }, [initialCategories]);

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur") {
      navigate("/sources");
      return;
    }
    loadCategories();
  }, [navigate, role, loadCategories]);

  const filteredCategories = categories.filter(
    (category) =>
      category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = await linkCategoriesAPI.create(categoryData);
      setCategories([...categories, newCategory]);
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
    <Layout>
      <div className="link-categories-page">
        <div className="main-content">
          <div className="categories-header">
            <div className="categories-header-left">
              <h1>Gestion des Catégories de Liens</h1>
              <p>
                Organisez vos liens utiles par catégories pour un accès rapide
              </p>
            </div>
            <div className="categories-header-actions">
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {role === "admin" && (
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
    </Layout>
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

  // Couleurs prédéfinies
  const predefinedColors = [
    { name: "Bleu", value: "#007bff" },
    { name: "Rouge", value: "#dc3545" },
    { name: "Vert", value: "#28a745" },
    { name: "Cyan", value: "#17a2b8" },
    { name: "Jaune", value: "#ffc107" },
    { name: "Violet", value: "#6f42c1" },
    { name: "Orange", value: "#f67800" },
    { name: "Gris", value: "#6c757d" },
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

export default LinkCategoriesPage;
