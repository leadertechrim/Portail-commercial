import React from "react";
import { useNavigate } from "react-router-dom";
import "./AIOffersPage.css";

const AIOffersPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (

      <div className="ai-offers-page">
        <div className="main-content">
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button className="back-btn" onClick={handleGoBack} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem" }}>
                <i className="fas fa-arrow-left"></i>
                Retour
              </button>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fas fa-robot" style={{ color: "#f67800", fontSize: "1rem" }}></i>
                Offres IA (En construction)
              </h1>
            </div>
          </div>

            <div className="ai-offers-content">
              <div className="empty-state-enhanced" style={{ padding: "80px 20px" }}>
                <div className="empty-graphic">
                  <div className="icon-circle">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="pulse-ring"></div>
                </div>
                <h2>Offres IA en Construction</h2>
                <p>Cette fonctionnalité innovante sera bientôt disponible.</p>
                <div className="empty-actions">
                  <button className="primary-empty-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                    Retour au Portail
                  </button>
                </div>
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
    );
};

export default AIOffersPage;
