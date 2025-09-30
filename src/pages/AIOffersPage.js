import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./AIOffersPage.css";

const AIOffersPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className="ai-offers-page">
        <div className="main-content">
          <div className="ai-offers-container">
            <div className="ai-offers-header">
              <button className="back-button" onClick={handleGoBack}>
                <i className="fas fa-arrow-left"></i>
                Retour
              </button>
            </div>

            <div className="ai-offers-content">
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-robot"></i>
                  {/* Icône SVG de l'œil - Commentée pour le moment */}
                  {/* 
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="empty-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
                </svg>
                */}
                </div>
                <h2>Page en construction</h2>
                <p>Cette fonctionnalité sera bientôt disponible.</p>
                <p>
                  Les offres d'emploi avec intelligence artificielle arrivent
                  prochainement !
                </p>
              </div>

              {/* Section des outils - Commentée pour le moment */}
              {/* 
            <section className="tools-section">
              <div className="tool-cards">
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
            */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIOffersPage;
