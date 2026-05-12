import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSourcesGrouped,
  addSource,
  updateSource,
  deleteSource,
  exportSourcesDocx,
} from "../api";
import { useCart } from "../hooks/useCart";
import { usePermissionsImproved as usePermissions } from "../hooks/usePermissionsImproved";
import { useNotificationContext } from "../contexts/NotificationContext";
import RecentlyVisited from "../components/RecentlyVisited";
import EditSourceModal from "../components/EditSourceModal";
import { logger } from "../utils/logger";
import "./../styles/SourcesPage.css";
import "./../styles/HighlightNewItem.css";

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
  const [isReorganizing, setIsReorganizing] = useState(false); // Loader réorganisation
  const [reorganizingProgress, setReorganizingProgress] = useState({ current: 0, total: 0 }); // Progression réorganisation
  const [newSourceId, setNewSourceId] = useState(null); // ID de la nouvelle source à scroller
  const [isExporting, setIsExporting] = useState(false);


  const navigate = useNavigate();
  const { recentlyVisited, addToRecentlyVisited, clearHistory } = useCart();
  const { hasPermission } = usePermissions();
  const { showSuccess, showError, showWarning } = useNotificationContext();

  // Fonction pour trier les sources par ordre (définie avec useCallback pour éviter les re-créations)
  const sortSourcesByOrder = useCallback((sources) => {
    return [...sources].sort((a, b) => {
      const orderA = parseInt(a.order) || 9999; // Les sources sans ordre vont à la fin
      const orderB = parseInt(b.order) || 9999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // Si même ordre, trier par nom
      return (a.nom_entite || "").localeCompare(b.nom_entite || "");
    });
  }, []);

  // Fonction pour vérifier et corriger les ordres redondants
  const fixDuplicateOrders = useCallback((sources) => {
    const sorted = sortSourcesByOrder(sources);
    const fixed = [];
    const usedOrders = new Set();
    
    sorted.forEach((source) => {
      let order = parseInt(source.order) || 0;
      
      // Si l'ordre est déjà utilisé, trouver le prochain ordre disponible
      while (usedOrders.has(order)) {
        order++;
      }
      
      usedOrders.add(order);
      
      // Si l'ordre a changé, mettre à jour la source
      if (parseInt(source.order) !== order) {
        fixed.push({ ...source, order });
      } else {
        fixed.push(source);
      }
    });
    
    return fixed;
  }, [sortSourcesByOrder]);

  const loadSources = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    const data = await fetchSourcesGrouped(currentToken);
    
    // Trier et corriger les ordres pour chaque catégorie
    const sourcesNatSorted = sortSourcesByOrder(data.nationale || []);
    const sourcesIntSorted = sortSourcesByOrder(data.internationale || []);
    
    // Vérifier et corriger les ordres redondants
    const sourcesNatFixed = fixDuplicateOrders(sourcesNatSorted);
    const sourcesIntFixed = fixDuplicateOrders(sourcesIntSorted);
    
    setSourcesNat(sourcesNatFixed);
    setSourcesInt(sourcesIntFixed);
    setFilteredNat(sourcesNatFixed);
    setFilteredInt(sourcesIntFixed);
  }, [sortSourcesByOrder, fixDuplicateOrders]);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      navigate("/login");
    } else {
      loadSources();
    }
  }, [navigate, loadSources]);

  // Effet pour scroller vers la nouvelle source créée
  useEffect(() => {
    if (newSourceId && (sourcesNat.length > 0 || sourcesInt.length > 0)) {
      const scrollToNewSource = () => {
        const elementId = `item-${newSourceId}`;
        const element = document.getElementById(elementId);
        
        if (element) {
          logger.debug("Élément trouvé, scroll en cours vers:", elementId);
          // Scroll vers l'élément
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          
          // Ajouter le highlight
          element.classList.add("highlight-new-item");
          
          // Retirer le highlight après 3 secondes
          setTimeout(() => {
            element.classList.remove("highlight-new-item");
          }, 3000);
          
          // Réinitialiser l'ID après le scroll
          setNewSourceId(null);
          return true;
        }
        return false;
      };
      
      // Essayer de scroller avec un petit délai
      const timer = setTimeout(() => {
        if (!scrollToNewSource()) {
          // Si pas trouvé, réessayer après 500ms
          setTimeout(() => {
            scrollToNewSource();
          }, 500);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [newSourceId, sourcesNat, sourcesInt]);


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

    // Filtrer et trier les résultats
    const filteredNat = sourcesNat.filter(searchInSource);
    const filteredInt = sourcesInt.filter(searchInSource);
    
    setFilteredNat(sortSourcesByOrder(filteredNat));
    setFilteredInt(sortSourcesByOrder(filteredInt));
  };

  const handleAddSource = async (sourceData) => {
    try {
      const currentToken = localStorage.getItem("token");
      logger.debug("Tentative d'ajout de source:", sourceData);

      // Vérifier si l'URL existe déjà
      const allSources = [...sourcesNat, ...sourcesInt];
      const urlExists = allSources.some(
        (source) =>
          source.url.trim().toLowerCase() ===
          sourceData.url.trim().toLowerCase()
      );

      if (urlExists) {
        showWarning("Cette URL existe déjà dans la base de données. Veuillez vérifier la liste des sources existantes.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Vérifier si l'ordre existe déjà et décaler les ordres si nécessaire
      const newOrder = parseInt(sourceData.order) || 1;
      const sourcesInSameCategory =
        sourceData.categorie === "Nationale" ? sourcesNat : sourcesInt;

      // Trier les sources par ordre pour un décalage correct
      const sortedSources = sortSourcesByOrder(sourcesInSameCategory);

      const orderExists = sortedSources.some(
        (source) => parseInt(source.order) === newOrder
      );

      if (orderExists) {
        // Demander confirmation pour le décalage
        const confirmer = window.confirm(
          `L'ordre ${newOrder} existe déjà.\n\n` +
            `Si vous continuez, toutes les sources avec un ordre >= ${newOrder} ` +
            `seront décalées d'une position.\n\n` +
            `Voulez-vous continuer ?`
        );

        if (!confirmer) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        // Afficher le loader de réorganisation
        setIsReorganizing(true);

        // Décaler tous les ordres >= newOrder de la même catégorie (en ordre décroissant pour éviter les conflits)
        logger.debug(`Décalage des ordres >= ${newOrder} dans catégorie ${sourceData.categorie}`);

        try {
          // Trier par ordre décroissant pour décaler d'abord les plus grands ordres
          const sourcesToShift = sortedSources
            .filter((source) => parseInt(source.order) >= newOrder)
            .sort((a, b) => parseInt(b.order) - parseInt(a.order));

          const totalSources = sourcesToShift.length;
          logger.debug(`${totalSources} source(s) à décaler`);
          setReorganizingProgress({ current: 0, total: totalSources });

          // OPTIMISATION: Faire tous les appels API en parallèle au lieu de séquentiellement
          // Cela réduit considérablement le temps d'exécution (de N secondes à ~1 seconde)
          let completedCount = 0;
          
          const updatePromises = sourcesToShift.map(async (source) => {
            const nouvelOrdre = parseInt(source.order) + 1;
            logger.debug(`Décalage: ${source.nom_entite} ordre ${source.order} → ${nouvelOrdre}`);

            try {
              // Créer un objet sans _id pour la mise à jour
              const { _id, ...sourceWithoutId } = source;
              const result = await updateSource(currentToken, source._id, {
                ...sourceWithoutId,
                order: nouvelOrdre,
              });
              
              // Mettre à jour la progression de manière thread-safe
              completedCount++;
              setReorganizingProgress({ current: completedCount, total: totalSources });
              
              return result;
            } catch (error) {
              logger.error(`Erreur lors du décalage de ${source.nom_entite}:`, error);
              throw error;
            }
          });

          // Exécuter tous les appels en parallèle (beaucoup plus rapide que séquentiel)
          await Promise.all(updatePromises);
          logger.debug("Tous les décalages terminés en parallèle");
          setReorganizingProgress({ current: totalSources, total: totalSources });
          
          // Fermer le loader après un court délai pour voir la progression complète
          setTimeout(() => {
            setIsReorganizing(false);
            setReorganizingProgress({ current: 0, total: 0 });
          }, 500);
        } catch (error) {
          logger.error("Erreur lors du décalage des ordres:", error);
          setIsReorganizing(false);
          setReorganizingProgress({ current: 0, total: 0 });
          showError("Erreur lors de la réorganisation des ordres. Veuillez réessayer.");
          throw error;
        }
      }

      const newSource = await addSource(currentToken, sourceData);
      logger.debug("Source ajoutée avec succès:", newSource);

      // Message de succès
      if (orderExists) {
        showSuccess("Source ajoutée avec succès ! Les autres sources ont été décalées automatiquement.");
      } else {
        showSuccess("Source ajoutée avec succès !");
      }

      // Réinitialiser le formulaire
      setNomEntite("");
      setUrl("");
      setCategorie("Nationale");
      setOrder(1);

      setIsAddModalOpen(false);
      
      // Stocker l'ID de la nouvelle source pour le scroll automatique
      const sourceId = newSource._id || newSource.id;
      if (sourceId) {
        setNewSourceId(sourceId);
        logger.debug("ID de la nouvelle source stocké pour scroll:", sourceId);
      }
      
      // Recharger les sources (le useEffect se chargera du scroll)
      await loadSources();
    } catch (error) {
      logger.error("Erreur lors de l'ajout de la source:", error);

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

      showError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditSource = (source) => {
    setEditingSource(source);
    setIsEditModalOpen(true);
  };

  const handleSaveSource = async (sourceId, data) => {
    const currentToken = localStorage.getItem("token");
    const result = await updateSource(currentToken, sourceId, data);
    logger.debug("Source mise à jour:", result);
    if (result.message === "Source mise à jour") {
      setIsEditModalOpen(false);
      setEditingSource(null);
      loadSources();
      showSuccess("Source modifiée avec succès !");
    } else {
      showError(result.message || "Erreur lors de la modification");
    }
  };

  const handleDeleteSource = async (sourceId) => {
    const currentToken = localStorage.getItem("token");
    const result = await deleteSource(currentToken, sourceId);
    if (result.message === "Source supprimée") {
      setIsEditModalOpen(false);
      setEditingSource(null);
      loadSources();
      showSuccess("Source supprimée avec succès !");
    } else {
      showError(result.message || "Erreur lors de la suppression");
    }
  };

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");
      await exportSourcesDocx(token);
      showSuccess("Le fichier Word a été généré avec succès !");
    } catch (error) {
      console.error("Erreur export Word:", error);
      showError(error.message || "Erreur lors de la génération du fichier Word.");
    } finally {
      setIsExporting(false);
    }

  };

  const _handleLogout = () => {

    localStorage.clear();
    navigate("/login");
  };

  const Section = ({ title, items }) => {
    // Trier les items par ordre avant l'affichage
    const sortedItems = sortSourcesByOrder(items);
    
    return (
      <section className="links-section">
        <h2>{title}</h2>
        <ul className="links-list">
          {sortedItems.length === 0 && <li className="no-results">Aucun résultat</li>}
          {sortedItems.map((s) => (
            <li key={s._id} id={`item-${s._id}`} className="link-item">
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
  };

  return (
    <div className="sources-page">
      {/* Loader de réorganisation */}
      {isReorganizing && (
        <div className="reorganization-overlay">
          <div className="reorganization-loader">
            <div className="spinner-orange"></div>
            <p>🔄 Réorganisation des ordres en cours...</p>
            {reorganizingProgress.total > 0 && (
              <div className="reorganization-progress">
                <p className="loader-subtitle">
                  {reorganizingProgress.current} / {reorganizingProgress.total} source(s) mise(s) à jour
                </p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(reorganizingProgress.current / reorganizingProgress.total) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
            {reorganizingProgress.total === 0 && (
              <p className="loader-subtitle">Optimisation en cours...</p>
            )}
          </div>
        </div>
      )}

      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <i className="fas fa-shopping-cart" style={{ color: "#f67800", fontSize: "1rem" }}></i>
            Offres
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="search-container" style={{ margin: 0 }}>
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              value={q}
              onChange={handleSearch}
              className="search-input-enhanced"
              style={{ height: "36px", fontSize: "0.85rem", padding: "0 10px 0 35px", width: "250px" }}
            />
            {q && (
              <button
                className="clear-search-btn"
                onClick={() => setQ("")}
                style={{ right: "10px" }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button 
            className="export-word-btn" 
            onClick={handleExportWord}
            disabled={isExporting}
            style={{ 
              height: "36px",
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '0 15px',
              backgroundColor: '#2b579a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              opacity: isExporting ? 0.7 : 1,
              fontSize: "0.82rem"
            }}
          >
            <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-word'}`}></i>
            {isExporting ? 'Génération...' : 'Exporter Word'}
          </button>
        </div>
      </div>

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
        onDelete={hasPermission("sources_delete") ? handleDeleteSource : null}
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
