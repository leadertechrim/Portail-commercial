// src/pages/SourcesPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSources, addSource } from "../api";
import "./../styles/SourcesPage.css";

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [q, setQ] = useState("");
  const [role] = useState(localStorage.getItem("role") || "user");
  const [token] = useState(localStorage.getItem("token") || "");
  const [nomEntite, setNomEntite] = useState("");
  const [url, setUrl] = useState("");
  const [categorie, setCategorie] = useState("");

  const navigate = useNavigate();

  // wrap loadSources dans useCallback pour useEffect
  const loadSources = useCallback(async () => {
    const data = await fetchSources(token);
    setSources(data);
  }, [token]);

  useEffect(() => {
    if (!token) navigate("/login");
    else loadSources();
  }, [token, navigate, loadSources]); // eslint ok

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setQ(query);
    if (!query) return loadSources();
    const filtered = sources.filter(
      (s) =>
        s.nom_entite.toLowerCase().includes(query) ||
        s.categorie.toLowerCase().includes(query)
    );
    setSources(filtered);
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!nomEntite || !url || !categorie)
      return alert("Remplis tous les champs");

    const data = await addSource(token, {
      nom_entite: nomEntite,
      url,
      categorie,
    });
    if (data.message === "Source ajoutée") {
      setNomEntite("");
      setUrl("");
      setCategorie("");
      loadSources();
    } else {
      alert(data.message || "Erreur ajout");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sources-page">
      <header className="header">
        <div className="header-left">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="links-section">
          <h2>Sources des Appels d'Offres</h2>
          <ul className="links-list">
            {sources.length === 0 && (
              <li className="no-results">Aucun résultat trouvé</li>
            )}
            {sources.map((s) => (
              <li key={s._id} className="link-item">
                <a href={s.url} target="_blank" rel="noreferrer">
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
              <input
                placeholder="Catégorie"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              />
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
