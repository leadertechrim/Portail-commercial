import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchOffers,
  addOffer,
  updateOffer,
  deleteOffer,
  fetchUsers,
} from "../api";
import AddCallForTenderModal from "../components/AddCallForTenderModal";
import EditCallForTenderModal from "../components/EditCallForTenderModal";
import Sidebar from "../components/Sidebar";
import "./CartPage.css";

const CartPage = () => {
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);

  // Log des offres quand elles changent
  useEffect(() => {
    console.log("📋 State des offres mis à jour:", offers);
  }, [offers]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isSpectator = role === "spectateur";

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Chargement des offres...");
      const offersData = await fetchOffers(token);
      console.log("📦 Données reçues du backend:", offersData);

      // Charger les utilisateurs si c'est un admin ou un spectateur
      if (role === "admin" || role === "spectateur") {
        console.log(
          "👑 Chargement des utilisateurs pour " +
            (role === "admin" ? "l'admin" : "le spectateur") +
            "..."
        );
        const usersData = await fetchUsers(token);
        setUsers(usersData);
        console.log("👥 Utilisateurs chargés:", usersData.length);
      }

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
        if (role === "user") {
          // Les utilisateurs normaux ne voient que leurs offres
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
          console.log("🔍 Rôle utilisateur:", role);

          if (currentUserId) {
            filteredOffers = offersData.filter(
              (offer) => String(offer.responsable_id) === String(currentUserId)
            );
            console.log(
              "📋 Offres filtrées:",
              filteredOffers.length,
              "sur",
              offersData.length
            );
          } else {
            console.log("❌ Aucun ID utilisateur trouvé");
            console.log("🔍 Contenu localStorage:", {
              userId: localStorage.getItem("userId"),
              user_id: localStorage.getItem("user_id"),
              token: localStorage.getItem("token") ? "Présent" : "Absent",
              role: localStorage.getItem("role"),
            });
            // Si pas d'ID utilisateur, ne pas afficher d'offres
            filteredOffers = [];
          }
        } else if (role === "admin" || role === "spectateur") {
          // L'admin et le spectateur voient toutes les offres
          console.log(
            "👑 " +
              (role === "admin" ? "Admin" : "Spectateur") +
              " - Affichage de toutes les offres"
          );
        }

        setOffers(filteredOffers);
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
  }, [token, role]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadOffers();
  }, [navigate, token, loadOffers]);

  const handleCreateOffer = async (offerData) => {
    try {
      const result = await addOffer(offerData, token);
      if (result.message === "Offre créée avec succès") {
        alert("Offre créée avec succès !");
        setIsAddModalOpen(false);
        loadOffers();
      } else {
        alert(result.message || "Erreur lors de la création de l'offre");
      }
    } catch (error) {
      alert(`Erreur lors de la création de l'offre: ${error.message}`);
    }
  };

  const handleUpdateOffer = async (offerId, offerData) => {
    try {
      const result = await updateOffer(offerId, offerData, token);
      if (result.message === "Offre mise à jour avec succès") {
        alert("Offre modifiée avec succès !");
        setIsEditModalOpen(false);
        setEditingItem(null);
        loadOffers();
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
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
    const colors = {
      "Non préparé": "#6c757d",
      "En préparation": "#ffc107",
      Envoyée: "#17a2b8",
      // Anciens formats pour compatibilité
      non_prepare: "#6c757d",
      en_preparation: "#ffc107",
      envoyee: "#17a2b8",
      envoyeé: "#17a2b8",
      envoyée: "#17a2b8",
      Envoyé: "#17a2b8",
    };
    return colors[state] || "#6c757d";
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des appels d'offres...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Sidebar />

      <div className="cart-header">
        <div className="cart-header-left">
          <button className="back-btn" onClick={() => navigate("/sources")}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          {/* <h1>Mon Panier - Appels d'Offres</h1> */}
        </div>
        <div className="cart-header-actions">
          {!isSpectator && (
            <button
              className="add-offer-btn"
              onClick={() => setIsAddModalOpen(true)}
              title="Ajouter une nouvelle offre"
            >
              <i className="fas fa-plus"></i>
              Ajouter une offre
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
          <div className="empty-cart">
            <i className="fas fa-shopping-basket"></i>
            <h3>Votre panier est vide</h3>
            <p>Commencez par ajouter votre première offre</p>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "15px",
                fontSize: "14px",
                color: "#6c757d",
              }}
            >
              <strong>🔧 Mode Debug :</strong>
              <br />
              1. Vérifiez que le backend est démarré sur http://127.0.0.1:8000
              <br />
              2. Cliquez sur "Test Backend" pour vérifier la connectivité
              <br />
              3. Cliquez sur "Tester l'API" pour voir les données reçues
              <br />
              4. Cliquez sur "Créer Test" pour ajouter une offre de test
              <br />
              5. Cliquez sur "Test Filtrage" pour vérifier le localStorage
              <br />
              6. Cliquez sur "Créer Tests Alertes" pour tester les alertes
              <br />
              7. Cliquez sur "Test Demain (J-1)" pour tester une alerte demain
              <br />
              8. Ouvrez la console (F12) pour voir les logs détaillés
            </div>
            {error && (
              <div
                style={{
                  color: "red",
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#ffe6e6",
                  borderRadius: "5px",
                }}
              >
                <strong>Erreur:</strong> {error}
              </div>
            )}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={async () => {
                  console.log("🧪 Test de l'API...");
                  console.log("🔑 Token:", token ? "Présent" : "Absent");
                  console.log("🌐 URL:", "http://127.0.0.1:8000/api/offres");

                  try {
                    const response = await fetch(
                      "http://127.0.0.1:8000/api/offres",
                      {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    console.log("📡 Status:", response.status);
                    console.log("📡 OK:", response.ok);

                    if (response.ok) {
                      const data = await response.json();
                      console.log("📦 Données brutes:", data);
                    } else {
                      const errorText = await response.text();
                      console.log("❌ Erreur:", errorText);
                    }
                  } catch (err) {
                    console.error("💥 Erreur de fetch:", err);
                  }

                  loadOffers();
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f67800",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🧪 Tester l'API
              </button>
              <button
                onClick={async () => {
                  console.log("🔍 Test de connectivité backend...");
                  try {
                    const response = await fetch("http://127.0.0.1:8000/", {
                      method: "GET",
                    });
                    console.log("🌐 Backend accessible:", response.ok);
                    console.log("📡 Status:", response.status);
                  } catch (err) {
                    console.error("❌ Backend inaccessible:", err);
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🔍 Test Backend
              </button>
              <button
                onClick={async () => {
                  console.log("📝 Création d'une offre de test...");
                  const testOffer = {
                    intitulee:
                      "Test d'offre - " + new Date().toLocaleTimeString(),
                    lien: "https://example.com/test",
                    client: "Client Test",
                    date_limite: new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    statut: "En préparation",
                    note_commentaire: "Offre de test créée automatiquement",
                    documents: ["test.pdf", "test2.docx"],
                  };

                  try {
                    const result = await addOffer(testOffer, token);
                    console.log("✅ Offre de test créée:", result);
                    loadOffers(); // Recharger les offres
                  } catch (error) {
                    console.error("❌ Erreur création offre test:", error);
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                📝 Créer Test
              </button>
              <button
                onClick={() => {
                  console.log("🔍 Test du localStorage et filtrage:");
                  console.log(
                    "📋 Toutes les offres:",
                    offers.map((o) => ({
                      intitulee: o.intitulee,
                      responsable_id: o.responsable_id,
                    }))
                  );
                  console.log("👤 Utilisateur actuel:", {
                    userId: localStorage.getItem("userId"),
                    user_id: localStorage.getItem("user_id"),
                    role: localStorage.getItem("role"),
                    token: localStorage.getItem("token") ? "Présent" : "Absent",
                  });

                  const currentUserId =
                    localStorage.getItem("userId") ||
                    localStorage.getItem("user_id");
                  if (currentUserId) {
                    const userOffers = offers.filter(
                      (offer) =>
                        String(offer.responsable_id) === String(currentUserId)
                    );
                    console.log(
                      "🎯 Offres de l'utilisateur:",
                      userOffers.length,
                      "offres"
                    );
                  } else {
                    console.log("❌ Pas d'ID utilisateur trouvé");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#e83e8c",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🔍 Test Filtrage
              </button>
              <button
                onClick={async () => {
                  try {
                    const today = new Date();
                    const testDates = [
                      new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // J-1
                      new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // J-3
                      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // J-7
                      new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // J-14
                      new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // J-21
                    ];

                    for (let i = 0; i < testDates.length; i++) {
                      const testOffer = {
                        intitulee: `Test Alerte J-${[1, 3, 7, 14, 21][i]}`,
                        lien: "https://example.com/test",
                        client: "Client Test",
                        statut: "En préparation",
                        date_limite: testDates[i].toISOString().split("T")[0],
                        note_commentaire: `Test d'alerte pour J-${
                          [1, 3, 7, 14, 21][i]
                        }`,
                        documents: [],
                      };

                      console.log(
                        `🧪 Création offre test J-${[1, 3, 7, 14, 21][i]}:`,
                        testOffer
                      );
                      await addOffer(testOffer, token);
                    }

                    alert(
                      "Offres de test créées ! Rechargez la page pour voir les alertes."
                    );
                    loadOffers();
                  } catch (error) {
                    console.error("Erreur création test:", error);
                    alert("Erreur lors de la création des offres de test");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🧪 Créer Tests Alertes
              </button>
              <button
                onClick={async () => {
                  try {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const testOffer = {
                      intitulee: "Test Demain (J-1)",
                      lien: "https://example.com/test-demain",
                      client: "Client Test Demain",
                      statut: "En préparation",
                      date_limite: tomorrow.toISOString().split("T")[0],
                      note_commentaire: "Test d'alerte pour demain (J-1)",
                      documents: [],
                    };

                    console.log("🧪 Création offre test demain:", testOffer);
                    console.log(
                      "📅 Date demain:",
                      tomorrow.toISOString().split("T")[0]
                    );

                    await addOffer(testOffer, token);
                    alert(
                      "Offre de test pour demain créée ! Rechargez la page pour voir l'alerte J-1."
                    );
                    loadOffers();
                  } catch (error) {
                    console.error("Erreur création test demain:", error);
                    alert("Erreur lors de la création de l'offre de test");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ffc107",
                  color: "black",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🧪 Test Demain (J-1)
              </button>
              {!isSpectator && (
                <button
                  className="add-first-call-btn"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <i className="fas fa-plus"></i>
                  Ajouter ma première offre
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="calls-table-container">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Intitulé</th>
                  <th>Lien</th>
                  <th>Client</th>
                  <th>Date limite</th>
                  <th>Statut</th>
                  {(role === "admin" || role === "spectateur") && (
                    <th>Responsable</th>
                  )}
                  <th>Alertes</th>
                  <th>Note et commentaire</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  console.log("Offre complète:", offer);
                  return (
                    <tr key={offer._id}>
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

                      {/* Date limite */}
                      <td>{formatDate(offer.date_limite)}</td>

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

                      {/* Responsable - visible pour l'admin et le spectateur */}
                      {(role === "admin" || role === "spectateur") && (
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

                      {/* Note et commentaire */}
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
                                {documents.map((document, index) => (
                                  <a
                                    key={index}
                                    href={document}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="document-link"
                                  >
                                    <i className="fas fa-paperclip"></i>
                                    {document}
                                  </a>
                                ))}
                              </div>
                            );
                          }
                          return <span style={{ color: "#6c757d" }}>-</span>;
                        })()}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="actions">
                          {isSpectator ? (
                            <button
                              className="view-btn"
                              onClick={() => handleViewItem(offer)}
                              title="Voir les détails"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          ) : (
                            <>
                              <button
                                className="edit-btn"
                                onClick={() => handleEditItem(offer)}
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteOffer(offer._id)}
                                title="Supprimer"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                    <label>Intitulé :</label>
                    <span>{viewingItem.intitulee}</span>
                  </div>
                  <div className="view-item">
                    <label>Client :</label>
                    <span>{viewingItem.client}</span>
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

              {(role === "admin" || role === "spectateur") && (
                <div className="view-section">
                  <h3>Responsable</h3>
                  <div className="view-item">
                    <label>Nom :</label>
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
                </div>
              )}

              {viewingItem.note_commentaire && (
                <div className="view-section">
                  <h3>Note/Commentaire</h3>
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
                    {viewingItem.documents.map((document, index) => (
                      <div key={index} className="document-item">
                        <i className="fas fa-file"></i>
                        <span>{document}</span>
                      </div>
                    ))}
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
