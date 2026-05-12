import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { linksAPI, linkCategoriesAPI, offerCategoriesAPI } from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./LinksPage.css";

const LinksPage = () => {
  const navigate = useNavigate();
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


  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const role = localStorage.getItem("role");

  // Charger les catégories dynamiquement depuis le paramétrage
  const loadCategories = useCallback(async () => {
    try {
      console.log("🔄 Chargement des catégories...");
      // Charger les catégories depuis l'API
      const [linkCategoriesData, offerCategoriesData] = await Promise.all([
        linkCategoriesAPI.getAll(),
        offerCategoriesAPI.getAll(),
      ]);

      console.log("📁 linkCategoriesData:", linkCategoriesData);
      console.log("📁 offerCategoriesData:", offerCategoriesData);

      const allCategories = [...linkCategoriesData, ...offerCategoriesData];
      console.log("📁 Toutes les catégories concaténées:", allCategories);

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
      console.log("🔄 Début du chargement des liens...");
      setLoading(true);
      console.log("🌐 Appel API linksAPI.getAll()...");
      const linksData = await linksAPI.getAll();
      console.log("✅ Liens chargés depuis l'API:", linksData);
      console.log("📊 Nombre de liens:", linksData?.length || 0);
      setLinks(linksData);
      console.log("✅ setLinks appelé, mise à jour de loading...");
      setLoading(false);
      console.log("✅ Loading mis à false");
    } catch (err) {
      console.error("❌ Erreur lors du chargement des liens:", err);
      setError(`Erreur lors du chargement des liens: ${err.message}`);
      // Fallback vers les données mock en cas毛erreur
      console.log("🔄 Utilisation des données mock...");
      setLinks(mockLinks);
      setLoading(false);
      console.log("✅ Fallback terminé, loading mis à false");
    }
  }, [mockLinks]);

  useEffect(() => {
    console.log("🚀 LinksPage useEffect - role:", role);
    if (permissionsLoading) return;

    if (!hasPermission("links_manage") && !hasPermission("links_view")) {
      console.log("🔓 LinksPage - Permission refusée");
      // navigate("/sources");
      // return;
    }
    console.log("✅ Appel loadLinks et loadCategories");
    loadLinks();
    loadCategories(); // Charger les catégories dynamiquement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, hasPermission, permissionsLoading, loadLinks, loadCategories]);

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
      link.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.categorie?.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Afficher un loader pendant le chargement des permissions ou des données
  if (permissionsLoading || loading) {
    return (
      <div className="links-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>{permissionsLoading ? "Chargement des permissions..." : "Chargement des liens..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="links-page">
      <div className="main-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <button className="back-btn" onClick={() => navigate(-1)} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              <i className="fas fa-arrow-left"></i>
              Retour
            </button>
            <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              <i className="fas fa-link" style={{ color: "#f67800", fontSize: "1rem" }}></i>
              Liens Utiles
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ height: "36px", fontSize: "0.85rem", padding: "0 12px", minWidth: "200px" }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
              style={{ height: "36px", fontSize: "0.85rem", padding: "0 8px" }}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {hasPermission("links_manage") && (
              <button
                className="add-link-btn"
                onClick={() => setIsAddModalOpen(true)}
                style={{ height: "36px", fontSize: "0.82rem", whiteSpace: "nowrap" }}
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
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", padding: "56px 20px",
                gap: 12
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#fff7ed", border: "2px solid #fed7aa",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <i className="fas fa-link" style={{ fontSize: "1.6rem", color: "#f67800" }}></i>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1a1d21", fontSize: "1rem" }}>
                  {searchTerm ? "Aucun lien trouvé" : "Aucun lien enregistré"}
                </p>
                <p style={{ margin: 0, color: "#6b7280", fontSize: ".88rem" }}>
                  {searchTerm
                    ? `Aucun résultat pour « ${searchTerm} »`
                    : "Cliquez sur « Nouveau Lien » pour commencer"}
                </p>
              </div>
            </div>
          ) : (
          <div className="links-sections">
            {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
              <div key={category} className="links-section" style={{ marginBottom: "30px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #eee" }}>
                <h2 className="section-title" style={{ background: "#f8f9fa", borderBottom: "1px solid #eee", padding: "12px 20px", fontSize: "1rem", color: "#2c3e50", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                  <i className="fas fa-folder" style={{ color: "#f67800" }}></i>
                  {category}
                  <span className="count" style={{ fontSize: "0.8rem", background: "#eee", padding: "2px 8px", borderRadius: "10px", marginLeft: "auto", color: "#666" }}>{categoryLinks.length}</span>
                </h2>
                <div className="table-container">
                  <table className="links-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f67800", color: "white" }}>
                        <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}><i className="fas fa-tag" style={{ marginRight: 8, opacity: 0.8 }}></i>Nom</th>
                        <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}><i className="fas fa-info-circle" style={{ marginRight: 8, opacity: 0.8 }}></i>Description</th>
                        <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}><i className="fas fa-globe" style={{ marginRight: 8, opacity: 0.8 }}></i>URL</th>
                        <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "0.85rem", fontWeight: 600 }}><i className="fas fa-sort-numeric-up" style={{ marginRight: 8, opacity: 0.8 }}></i>Ordre</th>
                        <th style={{ padding: "12px 20px", textAlign: "right", fontSize: "0.85rem", fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryLinks.map((link) => (
                        <tr key={link._id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "12px 20px", fontSize: "0.9rem", fontWeight: 500, color: "#2c3e50" }}>{link.nom}</td>
                          <td style={{ padding: "12px 20px", fontSize: "0.85rem", color: "#666" }}>{link.description || "-"}</td>
                          <td style={{ padding: "12px 20px" }}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: "#f67800", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 5 }}>
                              <i className="fas fa-external-link-alt" style={{ fontSize: "0.75rem" }}></i>
                              Visiter
                            </a>
                          </td>
                          <td style={{ padding: "12px 20px", textAlign: "center", fontSize: "0.85rem" }}>{link.ordre || 1}</td>
                          <td style={{ padding: "12px 20px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button onClick={() => openViewModal(link)} style={{ background: "none", border: "none", color: "#f67800", cursor: "pointer", padding: 5 }} title="Détails">
                                <i className="fas fa-eye"></i>
                              </button>
                              {hasPermission("links_manage") && (
                                <>
                                  <button onClick={() => openEditModal(link)} style={{ background: "none", border: "none", color: "#6c757d", cursor: "pointer", padding: 5 }} title="Modifier">
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button onClick={() => handleDeleteLink(link._id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", padding: 5 }} title="Supprimer">
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
        <div className="modal-header" style={{ background: "#f67800", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 14px", minHeight: "80px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.25rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-link" style={{ fontSize: "1.1rem", opacity: .85 }}></i>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", transition: "all .22s", flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          >
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

          <div className="modal-actions-enhanced full-width">
            <button type="button" onClick={onClose} className="cancel-btn">
              <i className="fas fa-times" style={{ marginRight: 6 }}></i>Annuler
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: 7 }}></i>Enregistrement…</>
                : <><i className="fas fa-check" style={{ marginRight: 7 }}></i>Enregistrer</>
              }
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
        <div className="modal-header" style={{ background: "#f67800", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 14px", minHeight: "80px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.25rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-id-card" style={{ fontSize: "1.1rem", opacity: .85 }}></i>
            Détails du Lien
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", transition: "all .22s", flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          >
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
            <button type="button" onClick={onClose} className="cancel-btn">
              <i className="fas fa-times" style={{ marginRight: 6 }}></i>Fermer
            </button>
          </div>
      </div>
    </div>
  );
};

export default LinksPage;
