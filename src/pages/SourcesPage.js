// src/pages/SourcesPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSourcesGrouped, addSource } from "../api";
import "./../styles/SourcesPage.css";
import { useCart } from "../hooks/useCart";
import RecentlyVisited from "../components/RecentlyVisited";

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

  const navigate = useNavigate();
  const { recentlyVisited, addToRecentlyVisited, clearHistory } = useCart();

  const loadSources = useCallback(async () => {
    const data = await fetchSourcesGrouped(token);
    // Le backend trie déjà par ("order", 1) puis ("nom_entite", 1)
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
      categorie, // "Nationale" | "Internationale"
    });
    if (data.message === "Source ajoutée") {
      setNomEntite("");
      setUrl("");
      setCategorie("Nationale");
      loadSources();
    } else {
      alert(data.message || "Erreur ajout");
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
            <img src="/logo192.png" alt="Logo" className="logo-img" />
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
            Déconnexion
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
            <form onSubmit={handleAddSource} className="add-source-form">
              <input
                placeholder="Nom entité"
                value={nomEntite}
                onChange={(e) => setNomEntite(e.target.value)}
              />
              <input
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              >
                <option value="Nationale">Nationale</option>
                <option value="Internationale">Internationale</option>
              </select>
              <button type="submit">Ajouter</button>
            </form>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 Portail des Appels d'Offres. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
