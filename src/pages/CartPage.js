import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchOffers,
  addOffer,
  updateOffer,
  deleteOffer,
  fetchUsers,
  fetchClients,
  fetchPartners,
} from "../api";
import AddCallForTenderModal from "../components/AddCallForTenderModal";
import EditCallForTenderModal from "../components/EditCallForTenderModal";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import { PERMISSIONS_CART } from "../constants/permissions";
import { navigateToCreatedItem } from "../utils/navigationUtils";
import "./CartPage.css";
import "../styles/HighlightNewItem.css";

const CartPage = () => {
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [offerStatuses, setOfferStatuses] = useState([]);


  // États pour les filtres
  const [filters, setFilters] = useState({
    categorie: "",
    responsable: "",
    statut: "",
    dateLimite: "",
    client: "",
    partenaire: "",
    alertes: "",
  });

  // Charger les statuts d'offres depuis OfferStatusPage
  const loadOfferStatuses = useCallback(() => {
    try {
      // Charger les états d'offres depuis le localStorage (stockés par OfferStatusPage)
      const savedStatuses = localStorage.getItem("offerStatuses");
      if (savedStatuses) {
        const statuses = JSON.parse(savedStatuses);
        console.log(
          "📋 États d'offres chargés depuis OfferStatusPage:",
          statuses
        );
        setOfferStatuses(statuses);
      } else {
        // États par défaut si aucun n'est configuré
        const defaultStatuses = [
          { nom: "Non préparée", couleur: "#dc3545" },
          { nom: "En préparation", couleur: "#ffc107" },
          { nom: "Envoyée", couleur: "#28a745" },
        ];
        setOfferStatuses(defaultStatuses);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des états d'offres:", err);
      setOfferStatuses([
        { nom: "Non préparée", couleur: "#dc3545" },
        { nom: "En préparation", couleur: "#ffc107" },
        { nom: "Envoyée", couleur: "#28a745" },
      ]);
    }
  }, []);

  // Log des offres quand elles changent
  useEffect(() => {
    console.log("📋 State des offres mis à jour:", offers);
  }, [offers]);

  // Fonction de filtrage
  const applyFilters = useCallback(() => {
    let filtered = [...offers];

    // Filtre par catégorie
    if (filters.categorie) {
      filtered = filtered.filter((offer) => {
        const categorie = offer.Catégorie || offer.categorie || "";
        return categorie.toLowerCase() === filters.categorie.toLowerCase();
      });
    }

    // Filtre par responsable
    if (filters.responsable) {
      filtered = filtered.filter((offer) => {
        const responsable = users.find(
          (user) => String(user._id) === String(offer.responsable_id)
        );
        return (
          responsable &&
          responsable.name
            .toLowerCase()
            .includes(filters.responsable.toLowerCase())
        );
      });
    }

    // Filtre par statut
    if (filters.statut) {
      filtered = filtered.filter((offer) => {
        const statut = offer.statut || "";
        return statut.toLowerCase().includes(filters.statut.toLowerCase());
      });
    }

    // Filtre par date limite
    if (filters.dateLimite) {
      filtered = filtered.filter((offer) => {
        if (!offer.date_limite) return false;
        const offerDate = new Date(offer.date_limite)
          .toISOString()
          .split("T")[0];
        return offerDate === filters.dateLimite;
      });
    }

    // Filtre par client
    if (filters.client) {
      filtered = filtered.filter((offer) => {
        const client = offer.client || "";
        return client === filters.client;
      });
    }

    // Filtre par partenaire
    if (filters.partenaire) {
      filtered = filtered.filter((offer) => {
        const partenaire = offer.Partenaire || offer.partenaire || "";
        return partenaire === filters.partenaire;
      });
    }

    // Filtre par alertes
    if (filters.alertes) {
      filtered = filtered.filter((offer) => {
        const alert = getDateAlert(offer.date_limite);
        if (!alert) return filters.alertes === "aucune";
        return alert.text.toLowerCase().includes(filters.alertes.toLowerCase());
      });
    }

    setFilteredOffers(filtered);
  }, [offers, filters, users]);

  // Appliquer les filtres quand les offres ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fonction pour gérer les changements de filtres
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      categorie: "",
      responsable: "",
      statut: "",
      dateLimite: "",
      client: "",
      partenaire: "",
      alertes: "",
    });
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Chargement des offres...");
      console.log("🔑 Token utilisé:", token ? "Présent" : "Absent");
      console.log("👤 Utilisateur connecté:", currentUserId);
      console.log(
        "🌐 URL API:",
        `${
          process.env.REACT_APP_API_URL ||
          "https://back-portail-commercial-32528505fc5a.herokuapp.com"
        }/api/offres`
      );

      const offersData = await fetchOffers(token);
      console.log("📦 Données reçues du backend:", offersData);
      console.log("📊 Type de données:", typeof offersData);
      console.log("📋 Est-ce un tableau?", Array.isArray(offersData));
      if (Array.isArray(offersData)) {
        console.log("✅ Nombre d'offres reçues:", offersData.length);
        if (offersData.length > 0) {
          console.log("🔍 Première offre:", offersData[0]);
        }
      } else {
        console.log("⚠️ Structure des données:", offersData);
      }

      // Charger les utilisateurs si l'utilisateur a la permission de voir tous les paniers
      if (hasPermission(PERMISSIONS_CART.VIEW_ALL)) {
        console.log(
          "👑 Chargement des utilisateurs pour afficher les responsables..."
        );
        const usersData = await fetchUsers(token);
        setUsers(usersData);
        console.log("👥 Utilisateurs chargés:", usersData.length);
      }

      // Charger les clients et partenaires pour les filtres
      console.log("🏢 Chargement des clients...");
      const clientsData = await fetchClients(token);
      setClients(clientsData);
      console.log("🏢 Clients chargés:", clientsData.length);

      console.log("🤝 Chargement des partenaires...");
      const partnersData = await fetchPartners(token);
      setPartners(partnersData);
      console.log("🤝 Partenaires chargés:", partnersData.length);

      if (offersData.message) {
        console.log("❌ Message d'erreur reçu:", offersData.message);
        setError(offersData.message);
        setOffers([]);
      } else if (Array.isArray(offersData)) {
        console.log(
          "✅ Données valides reçues, nombre d'offres:",
          offersData.length
        );

        // Filtrer les offres selon le rôle de l'utilisateur
        let filteredOffers = offersData;
        if (!hasPermission(PERMISSIONS_CART.VIEW_ALL)) {
          // Les utilisateurs normaux ne voient que leurs offres dans leur panier
          let currentUserId =
            localStorage.getItem("userId") || localStorage.getItem("user_id");

          // Si pas d'ID dans localStorage, essayer de le récupérer depuis le token
          if (!currentUserId && token) {
            try {
              const tokenPayload = JSON.parse(atob(token.split(".")[1]));
              currentUserId = tokenPayload.user_id || tokenPayload.id;
              console.log("🔍 ID récupéré depuis le token:", currentUserId);
            } catch (e) {
              console.log("❌ Impossible de décoder le token");
            }
          }

          console.log("🔍 ID utilisateur actuel:", currentUserId);
          console.log(
            "🔍 Permissions utilisateur:",
            hasPermission(PERMISSIONS_CART.VIEW_ALL)
              ? "Admin - Voir tous les paniers"
              : "Utilisateur - Voir son panier uniquement"
          );

          if (currentUserId) {
            console.log(
              "🔍 Filtrage des offres pour l'utilisateur:",
              currentUserId
            );
            console.log(
              "📋 Toutes les offres avant filtrage:",
              offersData.map((offer) => ({
                id: offer._id,
                intitulee: offer.intitulee,
                responsable_id: offer.responsable_id,
                responsable_nom: offer.responsable_nom,
              }))
            );

            filteredOffers = offersData.filter(
              (offer) => String(offer.responsable_id) === String(currentUserId)
            );
            console.log(
              "📋 Offres filtrées:",
              filteredOffers.length,
              "sur",
              offersData.length
            );
            console.log(
              "🔍 Offres après filtrage:",
              filteredOffers.map((offer) => ({
                id: offer._id,
                intitulee: offer.intitulee,
                responsable_id: offer.responsable_id,
              }))
            );
          } else {
            console.log("❌ Aucun ID utilisateur trouvé");
            console.log("🔍 Contenu localStorage:", {
              userId: localStorage.getItem("userId"),
              user_id: localStorage.getItem("user_id"),
              token: localStorage.getItem("token") ? "Présent" : "Absent",
            });
            console.log("🔍 Token décodé:", token ? "Présent" : "Absent");
            if (token) {
              try {
                const tokenPayload = JSON.parse(atob(token.split(".")[1]));
                console.log("🔍 Payload du token:", tokenPayload);
              } catch (e) {
                console.log("❌ Impossible de décoder le token:", e);
              }
            }
            // Si pas d'ID utilisateur, ne pas afficher d'offres
            filteredOffers = [];
          }
        } else if (hasPermission(PERMISSIONS_CART.VIEW_ALL)) {
          // L'admin voit toutes les offres de tous les utilisateurs
          console.log(
            "👑 Admin - Affichage de toutes les offres (tous les paniers)"
          );
        }

        // Normaliser les documents pour chaque offre
        const normalizedOffers = filteredOffers.map((offer) => {
          // Debug: Vérifier les documents
          console.log(
            `🔍 Offre ${offer.intitulee} - Documents:`,
            offer.document || offer.documents
          );

          return {
            ...offer,
            // Normaliser les documents (peuvent être dans 'document' ou 'documents')
            documents: offer.document || offer.documents || [],
          };
        });

        setOffers(normalizedOffers);
        setFilteredOffers(normalizedOffers); // Initialiser les offres filtrées
      } else {
        console.log(
          "⚠️ Format de données inattendu:",
          typeof offersData,
          offersData
        );
        setError("Format de données inattendu");
        setOffers([]);
      }
    } catch (error) {
      console.error("💥 Erreur lors du chargement des offres:", error);
      setError(`Erreur lors du chargement des offres: ${error.message}`);
      setOffers([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, hasPermission, currentUserId]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadOffers();
    // Charger les statuts d'offres dynamiques
    loadOfferStatuses();
  }, [navigate, token, loadOffers, loadOfferStatuses]);

  // Synchronisation en temps réel avec OfferStatusPage
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Seulement si c'est un changement de offerStatuses
      if (e && e.key === "offerStatuses") {
        console.log(
          "🔄 Synchronisation des états d'offres depuis OfferStatusPage..."
        );
        loadOfferStatuses();
      }
    };

    // Écouter les changements dans localStorage (entre onglets)
    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés (même onglet)
    const handleCustomEvent = () => {
      loadOfferStatuses();
    };
    window.addEventListener("offerStatusesUpdated", handleCustomEvent);

    // Vérification périodique réduite (30 secondes au lieu de 1 seconde)
    const interval = setInterval(() => {
      const savedStatuses = localStorage.getItem("offerStatuses");
      if (savedStatuses) {
        try {
          const statuses = JSON.parse(savedStatuses);
          // Vérifier si les statuts ont vraiment changé avant de recharger
          const currentStatusesStr = JSON.stringify(offerStatuses);
          const newStatusesStr = JSON.stringify(statuses);
          if (currentStatusesStr !== newStatusesStr) {
            console.log("🔄 Changement détecté dans les statuts d'offres");
            loadOfferStatuses();
          }
        } catch (err) {
          console.warn("Erreur lors de la vérification des statuts:", err);
        }
      }
    }, 30000); // 30 secondes au lieu de 1 seconde

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("offerStatusesUpdated", handleCustomEvent);
      clearInterval(interval);
    };
  }, [loadOfferStatuses, offerStatuses]);

  const handleCreateOffer = async (offerData) => {
    try {
      const result = await addOffer(offerData, token);
      if (result.message === "Offre créée avec succès") {
        alert("Offre créée avec succès !");
        setIsAddModalOpen(false);
        
        // Recharger les offres
        await loadOffers();
        
        // Naviguer vers la nouvelle offre créée
        const offerId = result.offer?._id || result._id || result.id;
        if (offerId) {
          setTimeout(() => {
            navigateToCreatedItem({
              itemId: offerId,
              items: [],
              scrollToItem: true,
              highlightDuration: 3000,
            });
          }, 800);
        }
      } else {
        alert(result.message || "Erreur lors de la création de l'offre");
      }
    } catch (error) {
      alert(`Erreur lors de la création de l'offre: ${error.message}`);
    }
  };

  const handleUpdateOffer = async (offerId, offerData) => {
    try {
      console.log("🔍 CartPage handleUpdateOffer - ID:", offerId);
      console.log("🔍 CartPage handleUpdateOffer - Data:", offerData);
      console.log(
        "🔍 CartPage handleUpdateOffer - Token:",
        token ? "Présent" : "Absent"
      );

      const result = await updateOffer(offerId, offerData, token);

      console.log("🔍 CartPage handleUpdateOffer - Résultat API:", result);
      console.log("🔍 CartPage handleUpdateOffer - Message:", result.message);

      if (result.message === "Offre mise à jour avec succès") {
        alert("Offre modifiée avec succès !");
        setIsEditModalOpen(false);
        setEditingItem(null);
        loadOffers();
      } else {
        console.log(
          "🔍 CartPage handleUpdateOffer - Message différent:",
          result.message
        );
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.log("🔍 CartPage handleUpdateOffer - Erreur:", error);
      alert(`Erreur lors de la modification: ${error.message}`);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        const result = await deleteOffer(offerId, token);
        if (result.message === "Offre supprimée avec succès") {
          alert("Offre supprimée avec succès !");
          loadOffers();
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        alert(`Erreur lors de la suppression: ${error.message}`);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleViewItem = (item) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getDateAlert = (dateString) => {
    if (!dateString) {
      console.log("❌ Pas de date limite fournie");
      return null;
    }

    try {
      const dateLimit = new Date(dateString);
      const now = new Date();

      // Normaliser les dates pour ne comparer que les jours (sans heures)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const limitDate = new Date(
        dateLimit.getFullYear(),
        dateLimit.getMonth(),
        dateLimit.getDate()
      );

      const diffTime = limitDate.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      console.log("📅 Calcul d'alerte:", {
        dateString,
        dateLimit: dateLimit.toISOString(),
        now: now.toISOString(),
        today: today.toISOString(),
        limitDate: limitDate.toISOString(),
        diffDays,
      });

      if (diffDays < 0) {
        console.log("🔴 Offre expirée");
        return {
          text: "EXPIRÉ",
          color: "#dc3545",
          icon: "fas fa-exclamation-triangle",
        };
      } else if (diffDays === 0) {
        console.log("🔴 Échéance aujourd'hui");
        return {
          text: "AUJOURD'HUI",
          color: "#dc3545",
          icon: "fas fa-exclamation-circle",
        };
      } else if (diffDays === 1) {
        console.log("🟠 J-1");
        return {
          text: "J-1",
          color: "#fd7e14",
          icon: "fas fa-exclamation-circle",
        };
      } else if (diffDays === 3) {
        console.log("🟡 J-3");
        return { text: "J-3", color: "#ffc107", icon: "fas fa-clock" };
      } else if (diffDays === 7) {
        console.log("🔵 J-7");
        return { text: "J-7", color: "#17a2b8", icon: "fas fa-clock" };
      } else if (diffDays === 14) {
        console.log("⚪ J-14");
        return { text: "J-14", color: "#6c757d", icon: "fas fa-calendar" };
      } else if (diffDays === 21) {
        console.log("⚪ J-21");
        return { text: "J-21", color: "#6c757d", icon: "fas fa-calendar" };
      }

      console.log("⚪ Aucune alerte pour", diffDays, "jours");
      return null;
    } catch (error) {
      console.log("❌ Erreur dans getDateAlert:", error);
      return null;
    }
  };

  const getStateColor = (state) => {
    // Chercher la couleur dans les statuts dynamiques
    const status = offerStatuses.find((s) => s.nom === state);
    if (status) {
      return status.couleur;
    }

    // Couleurs par défaut pour compatibilité avec les anciens formats
    const defaultColors = {
      "Non préparée": "#dc3545",
      "En préparation": "#ffc107",
      Envoyée: "#28a745",
      Clôturée: "#6c757d",
      // Anciens formats pour compatibilité
      "Non préparé": "#dc3545",
      "En prépa": "#f67800",
      "A préparer": "#dc3545",
      "En attente": "#dc3545",
      Clôturé: "#6c757d",
      non_prepare: "#6c757d",
      en_preparation: "#ffc107",
      envoyee: "#28a745",
      envoyeé: "#28a745",
      envoyée: "#28a745",
      Envoyé: "#28a745",
    };
    return defaultColors[state] || "#6c757d"; // Couleur par défaut
  };

  // Afficher un loader pendant le chargement des permissions ou des données
  if (permissionsLoading || loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>
              {permissionsLoading
                ? "Chargement des permissions..."
                : "Chargement des appels d'offres..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button className="back-btn" onClick={() => navigate("/sources")} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <i className="fas fa-shopping-cart" style={{ color: "#f67800", fontSize: "1rem" }}></i>
            Panier
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {hasPermission(PERMISSIONS_CART.ADD) && (
            <button
              className="add-offer-btn"
              onClick={() => setIsAddModalOpen(true)}
              title="Ajouter une nouvelle offre"
              style={{ height: "36px", fontSize: "0.82rem" }}
            >
              <i className="fas fa-plus"></i>
              Nouvelle Offre
            </button>
          )}
        </div>
      </div>

      <div className="cart-content">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <div className="error-help">
              <small>
                <i className="fas fa-info-circle"></i>
                Si l'erreur persiste, l'application utilise les données des
                appels d'offres comme alternative.
              </small>
            </div>
          </div>
        )}

        {/* {cartStats && (
          <div className="cart-stats">
            <div className="stat-item">
              <span className="stat-label">Total éléments:</span>
              <span className="stat-value">{cartStats.total_items}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Non préparés:</span>
              <span className="stat-value">
                {cartStats.non_prepare_items || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">En préparation:</span>
              <span className="stat-value">
                {cartStats.en_preparation_items || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Envoyées:</span>
              <span className="stat-value">{cartStats.envoyee_items || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">En attente:</span>
              <span className="stat-value">{cartStats.pending_items || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Approuvés:</span>
              <span className="stat-value">
                {cartStats.approved_items || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Terminés:</span>
              <span className="stat-value">
                {cartStats.completed_items || 0}
              </span>
            </div>
            <div className="stat-item total-value">
              <span className="stat-label">Valeur totale:</span>
              <span className="stat-value">
                {cartStats.total_value?.toLocaleString()} MRU
              </span>
            </div>
          </div>
        )} */}

        {offers.length === 0 ? (
          <div className="empty-state-enhanced">
            <div className="empty-graphic">
              <div className="icon-circle">
                <i className="fas fa-shopping-basket"></i>
              </div>
              <div className="pulse-ring"></div>
            </div>
            <h2>Votre panier est vide</h2>
            <p>Commencez à ajouter des offres pour les gérer ici.</p>
            <div className="empty-actions">
              <button className="primary-empty-btn" onClick={() => navigate("/sources")}>
                <i className="fas fa-search"></i>
                Parcourir les sources
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="filters-section">
              <h3>Filtres</h3>
              <div className="filters-grid">
                {/* Filtre Catégorie */}
                <div className="filter-group">
                  <label htmlFor="filter-categorie">Catégorie</label>
                  <select
                    id="filter-categorie"
                    value={filters.categorie}
                    onChange={(e) =>
                      handleFilterChange("categorie", e.target.value)
                    }
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="nationale">Nationale</option>
                    <option value="internationale">Internationale</option>
                  </select>
                </div>

                {/* Filtre Responsable (pour ceux qui voient tous les paniers) */}
                {hasPermission(PERMISSIONS_CART.VIEW_ALL) && (
                  <div className="filter-group">
                    <label htmlFor="filter-responsable">Responsable</label>
                    <select
                      id="filter-responsable"
                      value={filters.responsable}
                      onChange={(e) =>
                        handleFilterChange("responsable", e.target.value)
                      }
                    >
                      <option value="">Tous les responsables</option>
                      {users.map((user) => (
                        <option key={user._id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtre Statut */}
                <div className="filter-group">
                  <label htmlFor="filter-statut">Statut</label>
                  <select
                    id="filter-statut"
                    value={filters.statut}
                    onChange={(e) =>
                      handleFilterChange("statut", e.target.value)
                    }
                  >
                    <option value="">Tous les statuts</option>
                    {offerStatuses.map((status) => (
                      <option key={status._id || status.nom} value={status.nom}>
                        {status.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Date limite */}
                <div className="filter-group">
                  <label htmlFor="filter-date">Date limite</label>
                  <input
                    type="date"
                    id="filter-date"
                    value={filters.dateLimite}
                    onChange={(e) =>
                      handleFilterChange("dateLimite", e.target.value)
                    }
                  />
                </div>

                {/* Filtre Client */}
                <div className="filter-group">
                  <label htmlFor="filter-client">Client</label>
                  <select
                    id="filter-client"
                    value={filters.client}
                    onChange={(e) =>
                      handleFilterChange("client", e.target.value)
                    }
                  >
                    <option value="">Tous les clients</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client.raison_sociale}>
                        {client.raison_sociale}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Partenaire */}
                <div className="filter-group">
                  <label htmlFor="filter-partenaire">Partenaire</label>
                  <select
                    id="filter-partenaire"
                    value={filters.partenaire}
                    onChange={(e) =>
                      handleFilterChange("partenaire", e.target.value)
                    }
                  >
                    <option value="">Tous les partenaires</option>
                    {partners.map((partner) => (
                      <option key={partner._id} value={partner.raison_sociale}>
                        {partner.raison_sociale}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Alertes */}
                <div className="filter-group">
                  <label htmlFor="filter-alertes">Alertes</label>
                  <select
                    id="filter-alertes"
                    value={filters.alertes}
                    onChange={(e) =>
                      handleFilterChange("alertes", e.target.value)
                    }
                  >
                    <option value="">Toutes les alertes</option>
                    <option value="EXPIRÉ">EXPIRÉ</option>
                    <option value="AUJOURD'HUI">AUJOURD'HUI</option>
                    <option value="J-1">J-1</option>
                    <option value="J-3">J-3</option>
                    <option value="J-7">J-7</option>
                    <option value="J-14">J-14</option>
                    <option value="J-21">J-21</option>
                    <option value="aucune">Aucune alerte</option>
                  </select>
                </div>

                {/* Bouton de réinitialisation */}
                <div className="filter-group">
                  <button
                    type="button"
                    className="reset-filters-btn"
                    onClick={resetFilters}
                  >
                    <i className="fas fa-times"></i>
                    Réinitialiser
                  </button>
                </div>
              </div>

              <div className="filters-info">
                <span className="results-count">
                  {filteredOffers.length} offre
                  {filteredOffers.length > 1 ? "s" : ""} trouvée
                  {filteredOffers.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="calls-table-container">
              <table className="calls-table">
                <thead>
                  <tr>
                    <th>N-Offre</th>
                    <th>Intitulé</th>
                    <th>Lien</th>
                    <th>Client</th>
                    <th>Partenaire</th>
                    {hasPermission(PERMISSIONS_CART.VIEW_ALL) && (
                      <th>Responsable</th>
                    )}
                    <th>Date limite</th>
                    <th>Catégorie</th>
                    <th>Statut</th>
                    <th>Alertes</th>
                    <th>Commentaire</th>
                    <th>Documents</th>
                    <th>Gérer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => {
                    console.log("Offre complète:", offer);
                    return (
                      <tr key={offer._id} id={`item-${offer._id}`}>
                        {/* N-Offre */}
                        <td>{offer["N-Offre"] || offer.numero || "-"}</td>

                        {/* Intitulé */}
                        <td className="call-title">
                          <strong>{offer.intitulee}</strong>
                        </td>

                        {/* Lien */}
                        <td className="source-cell">
                          {offer.lien ? (
                            <a
                              href={offer.lien}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="source-link"
                            >
                              <i className="fas fa-external-link-alt"></i>
                              Voir lien
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Client */}
                        <td>{offer.client || "-"}</td>

                        {/* Partenaire */}
                        <td>{offer.Partenaire || offer.partenaire || "-"}</td>

                        {/* Responsable - visible pour ceux qui ont la permission de voir tous les paniers */}
                        {hasPermission(PERMISSIONS_CART.VIEW_ALL) && (
                          <td className="responsable-cell">
                            {(() => {
                              const responsable = users.find(
                                (user) =>
                                  String(user._id) ===
                                  String(offer.responsable_id)
                              );
                              return responsable ? (
                                <div className="responsable-info">
                                  <i className="fas fa-user"></i>
                                  <span>{responsable.name}</span>
                                </div>
                              ) : (
                                <span style={{ color: "#6c757d" }}>-</span>
                              );
                            })()}
                          </td>
                        )}

                        {/* Date limite */}
                        <td>{formatDate(offer.date_limite)}</td>

                        {/* Catégorie */}
                        <td>
                          {offer.Catégorie || offer.categorie ? (
                            <span
                              className={`category-badge ${(
                                offer.Catégorie || offer.categorie
                              ).toLowerCase()}`}
                            >
                              {offer.Catégorie || offer.categorie}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Statut */}
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStateColor(offer.statut),
                            }}
                          >
                            {offer.statut || "En préparation"}
                          </span>
                        </td>

                        {/* Alertes */}
                        <td className="alert-cell">
                          {(() => {
                            console.log(
                              "🔍 Calcul d'alerte pour offre:",
                              offer.intitulee,
                              "Date:",
                              offer.date_limite
                            );
                            const alert = getDateAlert(offer.date_limite);
                            console.log("📊 Résultat alerte:", alert);

                            if (alert) {
                              return (
                                <span
                                  className="alert-badge"
                                  style={{
                                    backgroundColor: alert.color,
                                  }}
                                >
                                  <i className={alert.icon}></i>
                                  {alert.text}
                                </span>
                              );
                            }
                            return <span style={{ color: "#6c757d" }}>-</span>;
                          })()}
                        </td>

                        {/* Commentaire */}
                        <td className="comment-cell">
                          {offer.note_commentaire &&
                          offer.note_commentaire.trim() !== "" ? (
                            <div className="comment-content">
                              <i
                                className="fas fa-comment-alt"
                                style={{
                                  marginRight: "5px",
                                  color: "#f67800",
                                }}
                              ></i>
                              {offer.note_commentaire}
                            </div>
                          ) : (
                            <span style={{ color: "#6c757d" }}>-</span>
                          )}
                        </td>

                        {/* Documents */}
                        <td className="documents-cell">
                          {(() => {
                            const documents = offer.documents || [];
                            console.log(
                              "Documents pour l'offre:",
                              offer.intitulee,
                              documents
                            );
                            if (documents && documents.length > 0) {
                              return (
                                <div className="documents-list">
                                  {documents.map((document, index) => {
                                    const url =
                                      typeof document === "string"
                                        ? document
                                        : document.url;
                                    const filename =
                                      typeof document === "string"
                                        ? document.split("/").pop()
                                        : document.filename ||
                                          document.name ||
                                          `Document ${index + 1}`;
                                    return (
                                      <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="document-link"
                                        title={`Voir ${filename}`}
                                      >
                                        <i className="fas fa-file"></i>
                                        <span className="document-name">
                                          {filename}
                                        </span>
                                      </a>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </td>

                        {/* Gérer */}
                        <td>
                          <div className="actions-cell">
                            <button
                              className="view-btn"
                              onClick={() => handleViewItem(offer)}
                              title="Voir les détails"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {hasPermission(PERMISSIONS_CART.ADD) && (
                              <button
                                className="edit-btn"
                                onClick={() => handleEditItem(offer)}
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            )}
                            {hasPermission(PERMISSIONS_CART.REMOVE) && (
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteOffer(offer._id)}
                                title="Supprimer"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddCallForTenderModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleCreateOffer}
      />

      <EditCallForTenderModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        call={editingItem}
        onSave={handleUpdateOffer}
      />

      {/* Modal de visualisation pour le spectateur */}
      {isViewModalOpen && viewingItem && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h2>Détails de l'offre</h2>
              <button className="modal-close" onClick={handleCloseModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="view-content">
              <div className="view-section">
                <h3>Informations générales</h3>
                <div className="view-grid">
                  <div className="view-item">
                    <label>N-Offre :</label>
                    <span>
                      {viewingItem["N-Offre"] ||
                        viewingItem.numero ||
                        "Non défini"}
                    </span>
                  </div>
                  <div className="view-item">
                    <label>Intitulé :</label>
                    <span>{viewingItem.intitulee}</span>
                  </div>
                  <div className="view-item">
                    <label>Client :</label>
                    <span>{viewingItem.client}</span>
                  </div>
                  <div className="view-item">
                    <label>Partenaire :</label>
                    <span>
                      {viewingItem.Partenaire ||
                        viewingItem.partenaire ||
                        "Non défini"}
                    </span>
                  </div>
                  {hasPermission(PERMISSIONS_CART.VIEW_ALL) && (
                    <div className="view-item">
                      <label>Responsable :</label>
                      <span>
                        {(() => {
                          const responsable = users.find(
                            (user) =>
                              String(user._id) ===
                              String(viewingItem.responsable_id)
                          );
                          return responsable ? (
                            <div className="responsable-info">
                              <i className="fas fa-user"></i>
                              {responsable.name}
                            </div>
                          ) : (
                            "Non trouvé"
                          );
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="view-item">
                    <label>Date limite :</label>
                    <span>{formatDate(viewingItem.date_limite)}</span>
                  </div>
                  <div className="view-item">
                    <label>Catégorie :</label>
                    <span>
                      {viewingItem.Catégorie || viewingItem.categorie ? (
                        <span
                          className={`category-badge ${(
                            viewingItem.Catégorie || viewingItem.categorie
                          ).toLowerCase()}`}
                        >
                          {viewingItem.Catégorie || viewingItem.categorie}
                        </span>
                      ) : (
                        "Non définie"
                      )}
                    </span>
                  </div>
                  <div className="view-item">
                    <label>Statut :</label>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStateColor(viewingItem.statut),
                      }}
                    >
                      {viewingItem.statut}
                    </span>
                  </div>
                  <div className="view-item">
                    <label>Date limite :</label>
                    <span>{formatDate(viewingItem.date_limite)}</span>
                  </div>
                  <div className="view-item">
                    <label>Lien :</label>
                    <span>
                      {viewingItem.lien ? (
                        <a
                          href={viewingItem.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          <i className="fas fa-external-link-alt"></i> Ouvrir le
                          lien
                        </a>
                      ) : (
                        "Non fourni"
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {viewingItem.note_commentaire && (
                <div className="view-section">
                  <h3>Commentaire</h3>
                  <div className="view-item">
                    <p className="comment-text">
                      {viewingItem.note_commentaire}
                    </p>
                  </div>
                </div>
              )}
              {viewingItem.documents && viewingItem.documents.length > 0 && (
                <div className="view-section">
                  <h3>Documents</h3>
                  <div className="documents-list">
                    {viewingItem.documents.map((document, index) => {
                      const url =
                        typeof document === "string" ? document : document.url;
                      const filename =
                        typeof document === "string"
                          ? document.split("/").pop()
                          : document.filename ||
                            document.name ||
                            `Document ${index + 1}`;
                      return (
                        <div key={index} className="document-item">
                          <i className="fas fa-file"></i>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={url}
                          >
                            <i className="fas fa-external-link-alt"></i>
                            {filename}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
