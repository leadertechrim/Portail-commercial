import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { offresIAAPI } from "../api";
import { PERMISSIONS_OFFRES_IA } from "../constants/permissions";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
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
import { BsStar, BsTrash } from "react-icons/bs";
import "./OffresIAPage.css";

const OffresIAPage = () => {
  const [offres, setOffres] = useState([]);
  const [stats, setStats] = useState({ total: 0, informatique: 0, masques: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous"); // tous, masques
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();

  const canView = hasPermission(PERMISSIONS_OFFRES_IA.VIEW);
  const canViewStats = hasPermission(PERMISSIONS_OFFRES_IA.VIEW_STATS);
  const canMasquer = hasPermission(PERMISSIONS_OFFRES_IA.MASQUER);
  const canSupprimer = hasPermission(PERMISSIONS_OFFRES_IA.SUPPRIMER);
  const canFetchStats = canView || canViewStats;

  useEffect(() => {
    if (!permissionsLoading) {
      console.log("🔐 Permissions Offres IA:", {
        canView,
        canViewStats,
        canMasquer,
        canSupprimer,
      });
    }
  }, [permissionsLoading, canView, canViewStats, canMasquer, canSupprimer]);

  // Charger les données
  const loadData = async () => {
    if (!canFetchStats) return;
    setLoading(true);
    try {
      // Toujours charger les stats
      const statsData = await offresIAAPI.getStats(token);
      console.log("📊 Statistiques:", statsData);
      setStats(statsData);

      if (canView) {
        // Charger les offres en fonction du filtre actif
        let offresData;
        if (filter === "masques") {
          console.log("🔄 Chargement des offres MASQUÉES");
          offresData = await offresIAAPI.getMasques(token);
          console.log("✅ Offres masquées chargées:", offresData?.length || 0);
        } else {
          console.log("🔄 Chargement des offres INFORMATIQUES");
          offresData = await offresIAAPI.getAll(token);
          console.log(
            "✅ Offres informatiques chargées:",
            offresData?.length || 0
          );
        }

        console.log("📋 Exemple d'offre chargée:", offresData[0]);
        setOffres(offresData);
      } else {
        setOffres([]);
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissionsLoading || !canFetchStats) {
      return;
    }

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, permissionsLoading, canFetchStats, canView]); // Recharger quand le filtre ou les permissions changent

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
      console.log("Statistiques AVANT masquage:", stats);
      console.log("Nombre d'offres AVANT:", offres.length);

      const result = await offresIAAPI.masquer(url, token);

      console.log("✅ Résultat masquage:", result);

      alert("✅ Appel d'offres masqué avec succès");

      console.log("🔄 Rechargement des données...");
      await loadData();
      console.log("✅ Statistiques APRÈS rechargement:", stats);
      console.log("✅ Nombre d'offres APRÈS:", offres.length);
      console.log("=== FIN MASQUAGE ===");
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
      console.log("=== DÉBUT DÉMASQUAGE ===");
      console.log("URL à démasquer:", url);
      console.log("Statistiques AVANT démasquage:", stats);
      console.log("Nombre d'offres AVANT:", offres.length);

      const result = await offresIAAPI.demasquer(url, token);
      console.log("✅ Résultat démasquage:", result);

      alert("✅ Appel d'offres démasqué");

      console.log("🔄 Rechargement des données...");
      await loadData();
      console.log("=== FIN DÉMASQUAGE ===");
    } catch (error) {
      console.error("❌ Erreur démasquage:", error);
      alert(`❌ Erreur lors du démasquage: ${error.message || error}`);
    }
  };

  // Mettre en corbeille (suppression définitive de l'UI)
  const handleMettreEnCorbeille = async (url, titre) => {
    if (!canSupprimer) {
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
      console.log("🗑️ Mise en corbeille:", url);

      // Appeler l'API de masquage (le backend gère en_corbeille)
      // Note: Le backend doit mettre en_corbeille=True au lieu de juste masque=True
      const result = await offresIAAPI.masquer(url, token);

      console.log("✅ Résultat corbeille:", result);
      alert("✅ Lien mis en corbeille");
      loadData();
    } catch (error) {
      console.error("❌ Erreur corbeille:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erreur inconnue";
      alert(`❌ Erreur:\n${errorMessage}`);
    }
  };

  // Calculer le nombre de masqués depuis les stats backend
  // Si stats backend = 0 mais qu'on a des offres masquées localement, recalculer
  const nombreMasquesBackend = stats.masques || 0;
  const nombreMasquesLocal = offres.filter(
    (o) => o.est_masque && !o.en_corbeille
  ).length;
  const nombreMasques =
    nombreMasquesBackend > 0 ? nombreMasquesBackend : nombreMasquesLocal;

  // Filtrer les offres (par recherche seulement, le filtre masqué/non masqué est géré par l'API)
  const getFilteredOffres = () => {
    // TOUJOURS exclure les offres en corbeille
    let filtered = offres.filter((o) => !o.en_corbeille);

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

  if (permissionsLoading) {
    return (
      <div className="offres-ia-page">
        <div className="loading">⏳ Chargement en cours...</div>
      </div>
    );
  }

  if (!canFetchStats) {
    return (
      <div className="offres-ia-page">
        <div className="no-permission">
          Permission requise pour accéder aux Offres IA.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="offres-ia-page">
        <div className="loading">⏳ Chargement des appels d'offres...</div>
      </div>
    );
  }

  return (
    <div className="offres-ia-page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <i className="fas fa-robot" style={{ color: "#f67800", fontSize: "1rem" }}></i>
            Offres IA
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Détectés automatiquement par intelligence artificielle</p>
      </div>

      {/* Statistiques */}
      {canViewStats && (
        <div className="stats-container">
          <div className="stat-card">
            <FiLayers className="stat-icon" />
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Appels d'Offres</div>
          </div>
          <div className="stat-card informatique">
            <FiCpu className="stat-icon" />
            <div className="stat-number">{stats.informatique}</div>
            <div className="stat-label">Informatique (IA)</div>
          </div>
          {canMasquer && (
            <div className="stat-card masques">
              <FiEyeOff className="stat-icon" />
              <div className="stat-number">{stats.masques}</div>
              <div className="stat-label">Masqués</div>
            </div>
          )}
          <div className="stat-card pdf">
            <HiOutlineDocumentText className="stat-icon" />
            <div className="stat-number">{stats.avec_pdf || 0}</div>
            <div className="stat-label">Avec PDF</div>
          </div>
        </div>
      )}

      {/* Filtres, recherche et liste visibles uniquement si consultation autorisée */}
      {canView && (
        <>
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
                  className={`filter-btn ${
                    filter === "masques" ? "active" : ""
                  }`}
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

                    {/* Bouton Masquer : visible si NON masqué */}
                    {canMasquer && !offre.est_masque && !offre.en_corbeille && (
                      <button
                        className="btn btn-masquer"
                        onClick={() => handleMasquer(offre.url, offre.titre)}
                      >
                        <FiEyeOff /> Masquer
                      </button>
                    )}

                    {/* Boutons Démasquer et Corbeille : visibles si MASQUÉ */}
                    {canMasquer && offre.est_masque && !offre.en_corbeille && (
                      <>
                        <button
                          className="btn btn-demasquer"
                          onClick={() => handleDemasquer(offre.url)}
                        >
                          <FiEye /> Démasquer
                        </button>
                        {canSupprimer && (
                          <button
                            className="btn btn-corbeille"
                            onClick={() =>
                              handleMettreEnCorbeille(offre.url, offre.titre)
                            }
                            title="Supprimer définitivement (corbeille)"
                          >
                            <BsTrash /> Corbeille
                          </button>
                        )}
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
                    <span
                      key={`ellipsis-${index}`}
                      className="pagination-ellipsis"
                    >
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
        </>
      )}
    </div>
  );
};

export default OffresIAPage;
