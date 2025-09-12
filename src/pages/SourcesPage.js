// src/pages/SourcesPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSourcesGrouped,
  addSource,
  updateSource,
  deleteSource,
} from "../api";
import { useCart } from "../hooks/useCart";
import RecentlyVisited from "../components/RecentlyVisited";
import EditSourceModal from "../components/EditSourceModal";
import "./../styles/SourcesPage.css";

export default function SourcesPage() {
  const [sourcesNat, setSourcesNat] = useState([]);
  const [sourcesInt, setSourcesInt] = useState([]);
  const [filteredNat, setFilteredNat] = useState([]);
  const [filteredInt, setFilteredInt] = useState([]);
  const [q, setQ] = useState("");
  const [role] = useState(localStorage.getItem("role") || "user");
  const [token] = useState(localStorage.getItem("token") || "");
  const [nomEntite, setNomEntite] = useState("");
  const [url, setUrl] = useState("");
  const [categorie, setCategorie] = useState("Nationale");
  const [order, setOrder] = useState(1);
  const [editingSource, setEditingSource] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const navigate = useNavigate();
  const { recentlyVisited, addToRecentlyVisited, clearHistory } = useCart();

  const loadSources = useCallback(async () => {
    const data = await fetchSourcesGrouped(token);
    setSourcesNat(data.nationale || []);
    setSourcesInt(data.internationale || []);
    setFilteredNat(data.nationale || []);
    setFilteredInt(data.internationale || []);
  }, [token]);

  useEffect(() => {
    if (!token) navigate("/login");
    else loadSources();
  }, [token, navigate, loadSources]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setQ(query);
    if (!query) {
      setFilteredNat(sourcesNat);
      setFilteredInt(sourcesInt);
      return;
    }
    const fn = (arr) =>
      arr.filter(
        (s) =>
          (s.nom_entite || "").toLowerCase().includes(query) ||
          (s.categorie || "").toLowerCase().includes(query)
      );
    setFilteredNat(fn(sourcesNat));
    setFilteredInt(fn(sourcesInt));
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!nomEntite || !url || !categorie)
      return alert("Remplis tous les champs");

    const data = await addSource(token, {
      nom_entite: nomEntite,
      url,
      categorie,
      order: parseInt(order) || 1,
    });
    if (data.message === "Source ajoutée") {
      setNomEntite("");
      setUrl("");
      setCategorie("Nationale");
      setOrder(1);
      loadSources();
    } else {
      alert(data.message || "Erreur ajout");
    }
  };

  const handleEditSource = (source) => {
    setEditingSource(source);
    setIsEditModalOpen(true);
  };

  const handleSaveSource = async (sourceId, data) => {
    const result = await updateSource(token, sourceId, data);
    if (result.message === "Source mise à jour") {
      setIsEditModalOpen(false);
      setEditingSource(null);
      loadSources();
    } else {
      alert(result.message || "Erreur modification");
    }
  };

  const handleDeleteSource = async (sourceId) => {
    const result = await deleteSource(token, sourceId);
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
              <p className="category">{s.categorie}</p>
            </a>

            {role === "admin" && (
              <div className="admin-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditSource(s)}
                  title="Modifier"
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
          <a className="logo" href="#">
            <img src="/logo512.png" alt="Logo" className="logo-img" />
            <span className="logo-text">Appels d'Offres</span>
          </a>
        </div>
        <div className="header-right">
          <input
            type="text"
            placeholder="Rechercher..."
            value={q}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Se déconnecter</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <Section
          title="Sources des Appels d'Offres — Nationale"
          items={filteredNat}
        />
        <Section
          title="Sources des Appels d'Offres — Internationale"
          items={filteredInt}
        />

        <section className="tools-section">
          <div className="tool-cards">
            <div className="tool-card">
              <i className="fas fa-shopping-basket tool-icon"></i>
              <h3>Mon Panier</h3>
              <p>Enregistrez vos appels d'offres pour un suivi personnalisé.</p>
            </div>
            <div className="tool-card">
              <i className="fas fa-bell tool-icon"></i>
              <h3>Alertes</h3>
              <p>Recevez des notifications pour les nouvelles opportunités.</p>
            </div>
            <div className="tool-card">
              <i className="fas fa-tasks tool-icon"></i>
              <h3>Gestion de Cycle</h3>
              <p>Suivez le statut de vos candidatures.</p>
            </div>
            <div className="tool-card">
              <i className="fas fa-chart-line tool-icon"></i>
              <h3>Surveillance IA</h3>
              <p>Notre système collecte les données quotidiennement.</p>
            </div>
          </div>
        </section>

        <RecentlyVisited
          recentlyVisited={recentlyVisited}
          clearHistory={clearHistory}
        />

        {role === "admin" && (
          <section className="admin-section">
            <h2>Ajouter une Source</h2>
            <div className="admin-info">
              <i className="fas fa-info-circle"></i>
              <p>
                <strong>Ordre :</strong> Détermine la position d'affichage. Si
                vous mettez l'ordre 3, les entités avec ordre 3, 4, 5...
                deviendront 4, 5, 6... automatiquement.
              </p>
            </div>
            <form onSubmit={handleAddSource} className="add-source-form">
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

      <footer className="footer">
        <p>&copy; 2025 Portail des Appels d'Offres - LeaderTech Solutions</p>
      </footer>

      <EditSourceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        source={editingSource}
        onSave={handleSaveSource}
        onDelete={handleDeleteSource}
      />
    </div>
  );
}
