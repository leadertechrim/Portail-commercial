import React, { useState, useEffect } from "react";
import { offresIAAPI } from "../api";
import { PERMISSIONS_OFFRES_IA } from "../constants/permissions";
import { usePermissions } from "../hooks/usePermissions";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiEyeOff,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiGlobe,
  FiFileText,
  FiPaperclip,
  FiCpu,
  FiBarChart2,
  FiLayers,
} from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { AiOutlineRobot } from "react-icons/ai";
import { BsCheckCircle, BsStar, BsTrash } from "react-icons/bs";
import "./OffresIAPage.css";

const OffresIAPage = () => {
  const [offres, setOffres] = useState([]);
  const [stats, setStats] = useState({ total: 0, informatique: 0, masques: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous"); // tous, masques
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("token");
  const { hasPermission } = usePermissions();

  const canMasquer = hasPermission(PERMISSIONS_OFFRES_IA.MASQUER);

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, offresData] = await Promise.all([
        offresIAAPI.getStats(token),
        offresIAAPI.getAll(token),
      ]);
      setStats(statsData);
      setOffres(offresData);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Masquer un appel d'offres
  const handleMasquer = async (url, titre) => {
    if (!canMasquer) {
      alert("❌ Vous n'avez pas la permission de masquer des appels d'offres");
      return;
    }

    if (
      !window.confirm(
        `⚠️ Êtes-vous sûr de vouloir masquer ce lien ?\n\n"${titre}"\n\nIl ne sera plus affiché mais restera dans la base.`
      )
    ) {
      return;
    }

    try {
      console.log("=== DÉBUT MASQUAGE ===");
      console.log("URL à masquer:", url);
      console.log("Token présent:", !!token);

      const result = await offresIAAPI.masquer(url, token);

      console.log("Résultat masquage:", result);
      console.log("=== FIN MASQUAGE RÉUSSI ===");

      alert("✅ Appel d'offres masqué avec succès");
      loadData();
    } catch (error) {
      console.error("=== ERREUR MASQUAGE ===");
      console.error("Type:", typeof error);
      console.error("Erreur complète:", error);
      console.error("Message:", error?.message);
      console.error("Stack:", error?.stack);

      const errorMessage =
        error?.message || error?.toString() || "Erreur inconnue";
      alert(`❌ Erreur lors du masquage:\n${errorMessage}`);
    }
  };

  // Démasquer un appel d'offres
  const handleDemasquer = async (url) => {
    if (!canMasquer) {
      alert(
        "❌ Vous n'avez pas la permission de démasquer des appels d'offres"
      );
      return;
    }

    try {
      const result = await offresIAAPI.demasquer(url, token);
      console.log("Résultat démasquage:", result);
      alert("✅ Appel d'offres démasqué");
      loadData();
    } catch (error) {
      console.error("Détails de l'erreur:", error);
      alert(`❌ Erreur lors du démasquage: ${error.message || error}`);
    }
  };

  // Mettre en corbeille (suppression définitive de l'UI)
  const handleMettreEnCorbeille = async (url, titre) => {
    if (!canMasquer) {
      alert("❌ Vous n'avez pas la permission de mettre en corbeille");
      return;
    }

    if (
      !window.confirm(
        `🗑️ Mettre en corbeille ?\n\n"${titre}"\n\n⚠️ Ce lien sera DÉFINITIVEMENT supprimé de la plateforme.\nIl restera en base mais ne sera plus affiché et ne sera jamais réanalysé.`
      )
    ) {
      return;
    }

    try {
      const result = await offresIAAPI.masquer(url, token, {
        raison: "Mis en corbeille par l'utilisateur",
      });
      console.log("Résultat corbeille:", result);
      alert("✅ Lien mis en corbeille");
      loadData();
    } catch (error) {
      console.error("Erreur corbeille:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erreur inconnue";
      alert(`❌ Erreur:\n${errorMessage}`);
    }
  };

  // Calculer les statistiques réelles depuis les données chargées
  const nombreCorbeille = offres.filter((o) => o.en_corbeille === true).length;
  const nombreMasques = offres.filter(
    (o) => o.est_masque === true && !o.en_corbeille
  ).length;
  const nombreNonMasques = offres.filter(
    (o) => !o.est_masque && !o.en_corbeille
  ).length;
  const nombreAvecPdf = offres.filter(
    (o) => !o.est_masque && !o.en_corbeille && (o.nb_pdf || 0) > 0
  ).length;
  const totalOffres = offres.filter((o) => !o.en_corbeille).length;

  // Filtrer les offres
  const getFilteredOffres = () => {
    let filtered = offres;

    // Filtre par type (toujours exclure la corbeille)
    if (filter === "masques") {
      // Seulement masqués (mais pas corbeille)
      filtered = filtered.filter((o) => o.est_masque && !o.en_corbeille);
    } else {
      // Tous sauf masqués et corbeille
      filtered = filtered.filter((o) => !o.est_masque && !o.en_corbeille);
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOffres = getFilteredOffres();

  // Pagination
  const totalPages = Math.ceil(filteredOffres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOffres = filteredOffres.slice(startIndex, endIndex);

  // Réinitialiser la page lors du changement de filtre ou recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Fonctions de pagination
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="offres-ia-page">
        <div className="loading">⏳ Chargement des appels d'offres...</div>
      </div>
    );
  }

  return (
    <div className="offres-ia-page">
      {/* En-tête */}
      <div className="page-header">
        <h1>
          <AiOutlineRobot className="icon-title" /> Offres IA
        </h1>
        <p>Détectés automatiquement par intelligence artificielle</p>
      </div>

      {/* Statistiques */}
      <div className="stats-container">
        <div className="stat-card">
          <FiLayers className="stat-icon" />
          <div className="stat-number">{totalOffres}</div>
          <div className="stat-label">Total Appels d'Offres</div>
        </div>
        <div className="stat-card informatique">
          <FiCpu className="stat-icon" />
          <div className="stat-number">{nombreNonMasques}</div>
          <div className="stat-label">Informatique (IA)</div>
        </div>
        {canMasquer && (
          <div className="stat-card masques">
            <FiEyeOff className="stat-icon" />
            <div className="stat-number">{nombreMasques}</div>
            <div className="stat-label">Masqués</div>
          </div>
        )}
        <div className="stat-card pdf">
          <HiOutlineDocumentText className="stat-icon" />
          <div className="stat-number">{nombreAvecPdf}</div>
          <div className="stat-label">Avec PDF</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="filters-buttons">
          <button
            className={`filter-btn ${filter === "tous" ? "active" : ""}`}
            onClick={() => setFilter("tous")}
          >
            <FiFilter /> Tous
          </button>
          {canMasquer && (
            <button
              className={`filter-btn ${filter === "masques" ? "active" : ""}`}
              onClick={() => setFilter("masques")}
            >
              <FiEyeOff /> Masqués ({nombreMasques})
            </button>
          )}
        </div>

        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher par titre ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Informations de pagination */}
      {filteredOffres.length > 0 && (
        <div className="pagination-info">
          <div className="results-count">
            <FiBarChart2 /> Affichage{" "}
            {filteredOffres.length === 0
              ? "d'aucun résultat"
              : `de ${startIndex + 1} à ${Math.min(
                  endIndex,
                  filteredOffres.length
                )} sur ${filteredOffres.length} résultat(s)`}
          </div>
          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Afficher :</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Liste des appels d'offres */}
      <div className="offres-list">
        {filteredOffres.length === 0 ? (
          <div className="no-results">Aucun appel d'offres trouvé</div>
        ) : (
          currentOffres.map((offre) => (
            <div
              key={offre.url}
              className={`offre-card ${offre.est_masque ? "masque" : ""}`}
            >
              <div className="offre-header">
                <h3 className="offre-titre">{offre.titre}</h3>
                <div className="offre-badges">
                  {offre.analysis_result?.est_informatique_ia && (
                    <span className="badge informatique">
                      <FiCpu /> INFORMATIQUE (IA)
                    </span>
                  )}
                  {offre.nb_pdf > 0 && (
                    <span className="badge pdf">
                      <HiOutlineDocumentText /> {offre.nb_pdf} PDF
                      {offre.nb_pdf_analyses > 0 &&
                        ` (${offre.nb_pdf_analyses} analysés)`}
                    </span>
                  )}
                  {offre.est_masque && (
                    <span className="badge masque">
                      <FiEyeOff /> Masqué
                    </span>
                  )}
                  {offre.ia_score && (
                    <span className="badge score">
                      <BsStar /> Score: {(offre.ia_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {offre.description && (
                <p className="offre-description">{offre.description}</p>
              )}

              <div className="offre-meta">
                <span className="meta-item">
                  <FiGlobe /> {offre.source_entite || "Source inconnue"}
                </span>
                <span className="meta-item">
                  <FiCalendar />{" "}
                  {new Date(offre.date_added).toLocaleDateString("fr-FR")}
                </span>
              </div>

              {/* PDF */}
              {offre.liens_pdf && offre.liens_pdf.length > 0 && (
                <div className="offre-documents">
                  <strong>
                    <FiFileText /> Documents PDF ({offre.liens_pdf.length})
                  </strong>
                  <div className="pdf-links">
                    {offre.liens_pdf.slice(0, 5).map((pdf, idx) => (
                      <a
                        key={idx}
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                        title={pdf.texte}
                      >
                        <FiPaperclip /> PDF {idx + 1}:{" "}
                        {pdf.texte?.substring(0, 40)}
                        {pdf.texte?.length > 40 ? "..." : ""}
                      </a>
                    ))}
                    {offre.liens_pdf.length > 5 && (
                      <small className="more-docs">
                        ... et {offre.liens_pdf.length - 5} autre(s) PDF
                      </small>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="offre-actions">
                <a
                  href={offre.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <FiExternalLink /> Voir l'annonce complète
                </a>

                {canMasquer && !offre.est_masque && !offre.en_corbeille && (
                  <button
                    className="btn btn-masquer"
                    onClick={() => handleMasquer(offre.url, offre.titre)}
                  >
                    <FiEyeOff /> Masquer
                  </button>
                )}

                {canMasquer && offre.est_masque && !offre.en_corbeille && (
                  <>
                    <button
                      className="btn btn-demasquer"
                      onClick={() => handleDemasquer(offre.url)}
                    >
                      <FiEye /> Démasquer
                    </button>
                    <button
                      className="btn btn-corbeille"
                      onClick={() =>
                        handleMettreEnCorbeille(offre.url, offre.titre)
                      }
                      title="Supprimer définitivement (corbeille)"
                    >
                      <BsTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOffres.length > 0 && totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-btn pagination-prev"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            title="Page précédente"
          >
            <FiChevronLeft />
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => goToPage(page)}
                  title={`Page ${page}`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="pagination-btn pagination-next"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            title="Page suivante"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default OffresIAPage;
