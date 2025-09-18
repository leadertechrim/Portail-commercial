import React from "react";
import { FaHistory, FaExternalLinkAlt, FaTrash, FaEye } from "react-icons/fa";
import "./RecentlyVisited.css";

const RecentlyVisited = ({ recentlyVisited, clearHistory }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Il y a moins d'une heure";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return "Hier";
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="recently-visited">
      <div className="recently-visited-header">
        <h3>
          <FaHistory />
          Récemment Visités ({recentlyVisited.length})
        </h3>
        {recentlyVisited.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            <FaTrash /> Effacer
          </button>
        )}
      </div>

      {recentlyVisited.length === 0 ? (
        <div className="empty-history">
          {/* <FaEye className="empty-icon" /> */}
          <p>Aucun lien visité récemment</p>
        </div>
      ) : (
        <div className="visited-list">
          {recentlyVisited.map((item, index) => (
            <div key={`${item._id}-${index}`} className="visited-item">
              <div className="visited-info">
                <h4>{item.nom_entite}</h4>
                <p className="visited-category">{item.categorie}</p>
                <div className="visited-meta">
                  <span className="visited-time">
                    {formatDate(item.visitedAt)}
                  </span>
                  {item.visitCount > 1 && (
                    <span className="visit-count">
                      <FaEye /> {item.visitCount} fois
                    </span>
                  )}
                </div>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="visit-again-btn"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyVisited;
