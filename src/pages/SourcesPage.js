import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSourcesGrouped,
  addSource,
  updateSource,
  deleteSource,
} from "../api";
import { useCart } from "../hooks/useCart";
import { usePermissionsImproved as usePermissions } from "../hooks/usePermissionsImproved";
import RecentlyVisited from "../components/RecentlyVisited";
import EditSourceModal from "../components/EditSourceModal";
import "./../styles/SourcesPage.css";

export default function SourcesPage() {
  const [sourcesNat, setSourcesNat] = useState([]);
  const [sourcesInt, setSourcesInt] = useState([]);
  const [filteredNat, setFilteredNat] = useState([]);
  const [filteredInt, setFilteredInt] = useState([]);
  const [q, setQ] = useState("");
  const [nomEntite, setNomEntite] = useState("");
  const [url, setUrl] = useState("");
  const [categorie, setCategorie] = useState("Nationale");
  const [order, setOrder] = useState(1);
  const [editingSource, setEditingSource] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigate = useNavigate();
  const { recentlyVisited, addToRecentlyVisited, clearHistory } = useCart();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const loadSources = useCallback(async () => {
    console.log("Chargement des sources...");
    const currentToken = localStorage.getItem("token");
    console.log("Token actuel:", currentToken);
    const data = await fetchSourcesGrouped(currentToken);
    console.log("Sources chargées:", data);
    setSourcesNat(data.nationale || []);
    setSourcesInt(data.internationale || []);
    setFilteredNat(data.nationale || []);
    setFilteredInt(data.internationale || []);
  }, []); // Removed token dependency

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    console.log("🔐 Vérification token:", currentToken);
    if (!currentToken) {
      console.log("❌ Pas de token, redirection vers login");
      navigate("/login");
    } else {
      console.log("✅ Token trouvé, chargement des sources");
      loadSources();
    }
  }, [navigate, loadSources]); // Token checked directly in effect

  // Debug permissions
  useEffect(() => {
    if (!permissionsLoading) {
      console.log("🔐 SourcesPage - Permissions chargées:");
      console.log("  - edit:", hasPermission("sources_edit"));
      console.log("  - delete:", hasPermission("sources_delete"));
      console.log("  - create:", hasPermission("sources_create"));
      console.log("  - view:", hasPermission("sources_view"));
    }
  }, [permissionsLoading, hasPermission]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setQ(query);

    if (!query) {
      setFilteredNat(sourcesNat);
      setFilteredInt(sourcesInt);
      return;
    }

    // Recherche améliorée : nom d'entité, catégorie, URL, et mots-clés
    const searchInSource = (source) => {
      const searchFields = [
        source.nom_entite || "",
        source.categorie || "",
        source.url || "",
        // Ajouter des mots-clés basés sur le contenu
        source.nom_entite?.toLowerCase().includes("ministère")
          ? "ministère"
          : "",
        source.nom_entite?.toLowerCase().includes("banque") ? "banque" : "",
        source.nom_entite?.toLowerCase().includes("union") ? "union" : "",
        source.nom_entite?.toLowerCase().includes("international")
          ? "international"
          : "",
        source.nom_entite?.toLowerCase().includes("national") ? "national" : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchFields.includes(query);
    };

    setFilteredNat(sourcesNat.filter(searchInSource));
    setFilteredInt(sourcesInt.filter(searchInSource));
  };

  const handleAddSource = async (sourceData) => {
    try {
      const currentToken = localStorage.getItem("token");
      console.log("Tentative d'ajout de source:", sourceData);
      console.log("Token utilisé:", currentToken ? "Présent" : "Manquant");

      const newSource = await addSource(currentToken, sourceData);
      console.log("Source ajoutée avec succès:", newSource);
      setIsAddModalOpen(false);
      loadSources();
    } catch (error) {
      console.error("Erreur détaillée lors de l'ajout de la source:", error);

      // Afficher un message d'erreur plus informatif
      let errorMessage = "Erreur lors de l'ajout de la source.";

      if (error.message.includes("403")) {
        errorMessage =
          "Accès refusé. Seuls les administrateurs peuvent ajouter des sources.";
      } else if (error.message.includes("401")) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.message.includes("400")) {
        errorMessage =
          "Données invalides. Vérifiez que tous les champs sont remplis.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const handleEditSource = (source) => {
    setEditingSource(source);
    setIsEditModalOpen(true);
  };

  const handleSaveSource = async (sourceId, data) => {
    console.log("SourcesPage handleSaveSource - ID:", sourceId, "Data:", data);
    const currentToken = localStorage.getItem("token");
    const result = await updateSource(currentToken, sourceId, data);
    console.log("SourcesPage handleSaveSource - Result:", result);
    if (result.message === "Source mise à jour") {
      setIsEditModalOpen(false);
      setEditingSource(null);
      loadSources();
    } else {
      alert(result.message || "Erreur modification");
    }
  };

  const handleDeleteSource = async (sourceId) => {
    const currentToken = localStorage.getItem("token");
    const result = await deleteSource(currentToken, sourceId);
    if (result.message === "Source supprimée") {
      setIsEditModalOpen(false);
      setEditingSource(null);
      loadSources();
    } else {
      alert(result.message || "Erreur suppression");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const Section = ({ title, items }) => (
    <section className="links-section">
      <h2>{title}</h2>
      <ul className="links-list">
        {items.length === 0 && <li className="no-results">Aucun résultat</li>}
        {items.map((s) => (
          <li key={s._id} className="link-item">
            {/* Badge d'ordre en cercle en haut */}
            {s.order && <span className="order-badge">{s.order}</span>}

            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => addToRecentlyVisited(s)}
            >
              <h3>
                <i className="fas fa-link icon"></i>
                {s.nom_entite}
              </h3>
              {/* <p className="category">{s.categorie}</p> */}
            </a>

            {hasPermission("sources_edit") && (
              <div className="admin-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditSource(s)}
                  title="Agir"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="sources-page">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            {/* <img src="/logo512.png" alt="Logo" className="logo-img" />
            <span className="logo-text">Portail des appels d'offres</span> */}
          </div>
        </div>
        <div className="header-right">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher par nom d'entité, catégorie ou URL..."
              value={q}
              onChange={handleSearch}
              className="search-input-enhanced"
            />
            {q && (
              <button
                className="clear-search-btn"
                onClick={() => setQ("")}
                title="Effacer la recherche"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Section
          title="Sites des appels d'offres nationaux"
          items={filteredNat}
        />
        <Section
          title="Sites des appels d'offres internationaux"
          items={filteredInt}
        />

        <RecentlyVisited
          recentlyVisited={recentlyVisited}
          clearHistory={clearHistory}
        />

        {hasPermission("sources_create") && (
          <section className="admin-section">
            <h2>Gérer les Sources</h2>
            <div className="admin-info">
              <i className="fas fa-info-circle"></i>
              <p>
                <strong>Gestion des sources :</strong> Vous pouvez ajouter,
                modifier et supprimer des sources d'appels d'offres. L'ordre
                détermine la position d'affichage dans la liste.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const sourceData = {
                  nom_entite: nomEntite,
                  url: url,
                  categorie: categorie,
                  order: order,
                };
                handleAddSource(sourceData);
              }}
              className="add-source-form"
            >
              <input
                placeholder="Nom entité"
                value={nomEntite}
                onChange={(e) => setNomEntite(e.target.value)}
                required
              />
              <input
                placeholder="URL"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              >
                <option value="Nationale">Nationale</option>
                <option value="Internationale">Internationale</option>
              </select>
              <input
                type="number"
                placeholder="Ordre"
                min="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
              />
              <button type="submit">Ajouter</button>
            </form>
          </section>
        )}
      </main>

      <EditSourceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        source={editingSource}
        onSave={handleSaveSource}
        onDelete={handleDeleteSource}
      />

      {/* Modal pour ajouter une nouvelle offre */}
      {isAddModalOpen && (
        <EditSourceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          source={null}
          onSave={handleAddSource}
          onDelete={null}
        />
      )}
    </div>
  );
}
