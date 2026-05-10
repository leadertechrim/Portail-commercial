import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchFactures,
  createFacture,
  updateFacture,
  deleteFacture,
  fetchFacturesEtats,
  fetchOffers,
  fetchClients,
  fetchUsers,
  fetchPersonnel,
  invoiceStatusesAPI,
} from "../api";
import SimpleFilestackUploader from "../components/SimpleFilestackUploader";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./FacturesPage.css";
import "../components/SimpleFilestackUploader.css";

const FacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingFacture, setEditingFacture] = useState(null);
  const [viewingFacture, setViewingFacture] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [offers, setOffers] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [etats, setEtats] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();

  const loadInvoiceStatuses = useCallback(async () => {
    try {
      console.log("📋 Chargement des états de factures depuis l'API Flask...");

      // Charger depuis l'API Flask
      const apiStatuses = await invoiceStatusesAPI.getAll();

      if (apiStatuses && apiStatuses.length > 0) {
        console.log("📋 États de factures chargés depuis l'API:", apiStatuses);
        setEtats(apiStatuses);
      } else {
        // États par défaut si aucun n'est configuré
        const defaultStatuses = [
          { nom: "A envoyer au client", couleur: "#ffc107" },
          { nom: "En attente de payement", couleur: "#f67800" },
          { nom: "Payée", couleur: "#28a745" },
        ];
        console.log("📋 Utilisation des états par défaut");
        setEtats(defaultStatuses);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des états de factures:", err);
      // États par défaut en cas d'erreur
      const defaultStatuses = [
        { nom: "A envoyer au client", couleur: "#ffc107" },
        { nom: "En attente de payement", couleur: "#f67800" },
        { nom: "Payée", couleur: "#28a745" },
      ];
      setEtats(defaultStatuses);
    }
  }, []);

  const loadFactures = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des factures...");
      const data = await fetchFactures(token);
      console.log("📋 Factures chargées brutes:", data);

      // Vérifier si data est un tableau ou un objet avec une propriété data
      let facturesData = Array.isArray(data)
        ? data
        : data.data || data.factures || [];

      console.log("📋 Nombre de factures brutes:", facturesData.length);

      // Filtrer selon les permissions : view_all vs view_owner
      if (
        !hasPermission("factures_view_all") &&
        hasPermission("factures_view")
      ) {
        // L'utilisateur ne voit que ses propres factures
        const currentUserId = localStorage.getItem("userId");
        console.log("🔐 Filtrage des factures - Mode view_owner uniquement");
        console.log("👤 userId actuel:", currentUserId);
        facturesData = facturesData.filter(
          (f) =>
            f.responsable_id === currentUserId ||
            f.user_id === currentUserId ||
            f.created_by === currentUserId
        );
        console.log("📋 Factures filtrées (view_owner):", facturesData.length);
      } else if (hasPermission("factures_view_all")) {
        console.log(
          "✅ Permission factures_view_all - Affichage de toutes les factures"
        );
      }

      // OPTIMISATION: Utiliser Map pour O(1) au lieu de O(n) avec find()
      const clientsMap = new Map(clients.map(c => [c._id, c]));
      const offersMap = new Map(offers.map(o => [o._id, o]));

      // Enrichir les factures avec les détails complets des clients et offres
      const enrichedFactures = facturesData.map((facture) => {
        const client = clientsMap.get(facture.client_id);
        const offre = offersMap.get(facture.offre_id);

        return {
          ...facture,
          client: client || { raison_sociale: "Client inconnu" },
          offre: offre || { intitulee: "Offre inconnue" },
          // Normaliser les documents (peuvent être dans 'document' ou 'documents')
          documents: facture.document || facture.documents || [],
        };
      });

      console.log("📋 Factures enrichies finales:", enrichedFactures.length);
      setFactures(enrichedFactures);
      setError("");
    } catch (err) {
      console.error("❌ Erreur lors du chargement des factures:", err);
      setError(`Erreur lors du chargement des factures: ${err.message}`);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  }, [token, clients, offers, hasPermission]);

  const generateNumeroFacture = useCallback(
    (clientId, offreId) => {
      if (!clientId || !offreId) {
        return "";
      }

      // OPTIMISATION: Utiliser Map pour O(1) au lieu de O(n)
      const clientsMap = new Map(clients.map(c => [c._id, c]));
      const offersMap = new Map(offers.map(o => [o._id, o]));

      const client = clientsMap.get(clientId);
      const offre = offersMap.get(offreId);

      if (!client || !offre) {
        return "";
      }

      const nomClient = (
        client.raison_sociale ||
        client.nom ||
        "Client"
      ).replace(/\s+/g, "_");
      const nomOffre = (offre.intitulee || offre.titre || "Offre").replace(
        /\s+/g,
        "_"
      );

      return `Fac_${nomClient}_${nomOffre}`;
    },
    [clients, offers]
  );

  const loadOffersAndClients = useCallback(async () => {
    try {
      console.log(
        "🔄 Chargement des offres, clients, utilisateurs, personnel, états et factures en parallèle..."
      );
      // OPTIMISATION: Charger les factures en parallèle avec les autres données
      // Gérer fetchUsers séparément pour ignorer silencieusement l'erreur de permission
      const [offersData, clientsData, personnelData, etatsData, facturesData] =
        await Promise.all([
          fetchOffers(token),
          fetchClients(token),
          fetchPersonnel(token),
          fetchFacturesEtats(token),
          fetchFactures(token), // Charger les factures en parallèle
        ]);
      
      // Charger les utilisateurs séparément et ignorer l'erreur de permission
      let usersData = [];
      try {
        usersData = await fetchUsers(token);
      } catch (userError) {
        // Ignorer silencieusement l'erreur de permission pour les utilisateurs
        if (userError.message && userError.message.includes("users_manage") && userError.message.includes("cart_view_all")) {
          console.log("ℹ️ Permission insuffisante pour charger les utilisateurs - ignoré silencieusement");
        } else {
          console.warn("⚠️ Erreur lors du chargement des utilisateurs:", userError);
        }
        usersData = [];
      }

      // Filtrer les offres selon les permissions
      let filteredOffers = Array.isArray(offersData) ? offersData : [];
      if (!hasPermission("factures_view_all")) {
        const currentUserId = localStorage.getItem("userId");
        filteredOffers = filteredOffers.filter(
          (offre) =>
            offre.responsable_id === currentUserId ||
            offre.user_id === currentUserId ||
            offre.created_by === currentUserId
        );
      }

      setOffers(filteredOffers);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPersonnel(Array.isArray(personnelData) ? personnelData : []);

      // Gestion spéciale pour les états - toujours avoir des valeurs par défaut
      if (Array.isArray(etatsData) && etatsData.length > 0) {
        setEtats(etatsData);
      } else {
        setEtats(["A envoyer au client", "En attente de payement", "Payée"]);
      }

      // Traiter les factures immédiatement avec les données chargées
      let facturesArray = Array.isArray(facturesData)
        ? facturesData
        : facturesData?.data || facturesData?.factures || [];

      // Filtrer selon les permissions
      if (
        !hasPermission("factures_view_all") &&
        hasPermission("factures_view")
      ) {
        const currentUserId = localStorage.getItem("userId");
        facturesArray = facturesArray.filter(
          (f) =>
            f.responsable_id === currentUserId ||
            f.user_id === currentUserId ||
            f.created_by === currentUserId
        );
      }

      // OPTIMISATION: Utiliser Map pour enrichissement rapide
      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      const clientsMap = new Map(clientsArray.map(c => [c._id, c]));
      const offersMap = new Map(filteredOffers.map(o => [o._id, o]));

      const enrichedFactures = facturesArray.map((facture) => {
        const client = clientsMap.get(facture.client_id);
        const offre = offersMap.get(facture.offre_id);

        return {
          ...facture,
          client: client || { raison_sociale: "Client inconnu" },
          offre: offre || { intitulee: "Offre inconnue" },
          documents: facture.document || facture.documents || [],
        };
      });

      setFactures(enrichedFactures);
      setLoading(false);
      setError("");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      // Ne pas afficher l'erreur si c'est uniquement l'erreur de permission pour les utilisateurs
      const isUserPermissionError = error.message && 
        error.message.includes("users_manage") && 
        error.message.includes("cart_view_all");
      
      setOffers([]);
      setClients([]);
      setUsers([]);
      setPersonnel([]);
      // Garder les états par défaut avec couleurs (objets, pas strings)
      const defaultStatuses = [
        { nom: "A envoyer au client", couleur: "#ffc107" },
        { nom: "En attente de payement", couleur: "#f67800" },
        { nom: "Payée", couleur: "#28a745" },
      ];
      setEtats(defaultStatuses);
      setFactures([]);
      setLoading(false);
      
      // Ne pas afficher l'erreur de permission pour les utilisateurs
      if (!isUserPermissionError) {
        setError(`Erreur lors du chargement: ${error.message}`);
      } else {
        setError(""); // Pas d'erreur affichée
      }
    }
  }, [token, hasPermission]);

  useEffect(() => {
    if (permissionsLoading) return; // Attendre le chargement des permissions

    if (
      !hasPermission("factures_view") &&
      !hasPermission("factures_view_all")
    ) {
      console.log("🔓 FacturesPage - Permission refusée");
      return;
    }
    // OPTIMISATION: Charger tout en une seule fois (factures incluses)
    setLoading(true);
    loadOffersAndClients();
    // Charger les états de factures dynamiques
    loadInvoiceStatuses();
  }, [
    navigate,
    hasPermission,
    permissionsLoading,
    loadOffersAndClients,
    loadInvoiceStatuses,
  ]);

  // OPTIMISATION: Synchronisation moins fréquente (30 secondes au lieu de 5)
  useEffect(() => {
    const interval = setInterval(() => {
      loadInvoiceStatuses();
    }, 30000); // Vérification toutes les 30 secondes

    return () => {
      clearInterval(interval);
    };
  }, [loadInvoiceStatuses]);

  const filteredFactures = factures.filter((facture) => {
    const search = searchTerm.toLowerCase();

    // Recherche dans les champs texte simples
    const matchesNumero =
      facture.numero_facture?.toLowerCase().includes(search) ||
      facture.numero?.toLowerCase().includes(search);
    const matchesIntitule = facture.intitule?.toLowerCase().includes(search);
    const matchesEtat = facture.etat?.toLowerCase().includes(search);

    // Recherche dans le client (gérer objet ou string)
    let matchesClient = false;
    if (facture.client) {
      if (typeof facture.client === "string") {
        matchesClient = facture.client.toLowerCase().includes(search);
      } else if (facture.client_id) {
        const client = clients.find((c) => c._id === facture.client_id);
        if (client) {
          matchesClient =
            client.raison_sociale?.toLowerCase().includes(search) ||
            client.nom?.toLowerCase().includes(search);
        }
      }
    }

    return matchesNumero || matchesIntitule || matchesEtat || matchesClient;
  });

  const handleCreateFacture = async (factureData) => {
    try {
      console.log("🔄 Création d'une facture...");
      console.log("📋 Données reçues:", factureData);
      console.log("📋 États disponibles:", etats);
      console.log("📋 État sélectionné:", factureData.etat);
      console.log("📋 Type de l'état:", typeof factureData.etat);
      console.log("📋 Longueur de l'état:", factureData.etat?.length);

      // Normalisation et validation de l'état
      const normalizedEtat = factureData.etat?.trim();

      // Utiliser uniquement les états chargés dynamiquement depuis InvoiceStatusPage
      const validStates = etats.map((status) => status.nom);

      console.log("📋 États valides pour validation:", validStates);
      console.log("📋 État normalisé:", normalizedEtat);
      console.log(
        "📋 État dans la liste:",
        validStates.includes(normalizedEtat)
      );

      // Vérifier que les états sont chargés depuis InvoiceStatusPage
      if (validStates.length === 0) {
        console.error("❌ Aucun état chargé depuis InvoiceStatusPage");
        alert(
          "Erreur: Les états de factures ne sont pas chargés. Veuillez configurer les états dans la page de paramétrage."
        );
        return;
      }

      if (!normalizedEtat || !validStates.includes(normalizedEtat)) {
        console.error("❌ État invalide:", factureData.etat);
        console.error("❌ État normalisé:", normalizedEtat);
        console.error("❌ États valides:", validStates);
        console.error("❌ États chargés:", etats);
        alert(
          `État invalide: "${
            factureData.etat
          }". États valides: ${validStates.join(", ")}`
        );
        return;
      }

      // Utiliser l'état normalisé
      factureData.etat = normalizedEtat;

      // Vérifier et générer le numéro si nécessaire
      let numeroFacture = factureData.numero_facture;
      if (!numeroFacture && factureData.client_id && factureData.offre_id) {
        numeroFacture = generateNumeroFacture(
          factureData.client_id,
          factureData.offre_id
        );
        console.log("🔄 Numéro généré à la dernière minute:", numeroFacture);
      }

      // Mapper les données pour le backend - PRIORITÉ AU NUMÉRO FRONTEND
      const dataToSend = {
        numero: numeroFacture, // ✅ Numéro généré par le frontend
        numero_facture: numeroFacture, // ✅ Champ requis par le backend
        numero_frontend: numeroFacture, // ✅ Champ supplémentaire pour forcer le frontend
        intitule: factureData.intitule,
        date_emission: factureData.date_emission,
        offre_id: factureData.offre_id,
        client_id: factureData.client_id,
        etat: factureData.etat,
        document: factureData.document,
      };

      console.log("📋 Données mappées pour le backend:", dataToSend);
      console.log("📋 Champ numero (FRONTEND):", dataToSend.numero);
      console.log(
        "📋 Champ numero_frontend (FORCE):",
        dataToSend.numero_frontend
      );
      console.log(
        "📋 Champ numero_facture (original):",
        factureData.numero_facture
      );
      console.log("📋 Token:", token ? "Présent" : "Absent");
      console.log(
        "📋 URL API:",
        process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
      );

      const result = await createFacture(dataToSend, token);
      console.log("📋 Résultat de création:", result);

      if (result.message === "Facture créée avec succès" || result._id) {
        setIsAddModalOpen(false);
        loadFactures();
        alert("Facture créée avec succès");
      } else {
        const errorMsg = result.message || "Erreur lors de la création";
        console.error("❌ Erreur création facture:", errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de la facture:", error);

      if (error.message.includes("Failed to fetch")) {
        alert(
          "❌ Erreur de connexion au serveur backend.\n\nVérifiez que :\n1. Le serveur backend est démarré\n2. Il écoute sur le port 8000\n3. L'URL est correcte dans votre configuration"
        );
      } else {
        alert(`Erreur lors de la création de la facture: ${error.message}`);
      }
    }
  };

  const handleUpdateFacture = async (factureId, factureData) => {
    try {
      console.log("🔄 Modification d'une facture...");
      console.log("📋 Facture ID:", factureId);
      console.log("📋 Données reçues:", factureData);
      console.log("📋 États disponibles:", etats);
      console.log("📋 État sélectionné:", factureData.etat);
      console.log("📋 Type de l'état:", typeof factureData.etat);
      console.log("📋 Longueur de l'état:", factureData.etat?.length);

      // Normalisation et validation de l'état
      const normalizedEtat = factureData.etat?.trim();

      // Utiliser uniquement les états chargés dynamiquement depuis InvoiceStatusPage
      const validStates = etats.map((status) => status.nom);

      console.log("📋 États valides pour validation:", validStates);
      console.log("📋 État normalisé:", normalizedEtat);
      console.log(
        "📋 État dans la liste:",
        validStates.includes(normalizedEtat)
      );

      // Vérifier que les états sont chargés depuis InvoiceStatusPage
      if (validStates.length === 0) {
        console.error("❌ Aucun état chargé depuis InvoiceStatusPage");
        alert(
          "Erreur: Les états de factures ne sont pas chargés. Veuillez configurer les états dans la page de paramétrage."
        );
        return;
      }

      if (!normalizedEtat || !validStates.includes(normalizedEtat)) {
        console.error("❌ État invalide:", factureData.etat);
        console.error("❌ État normalisé:", normalizedEtat);
        console.error("❌ États valides:", validStates);
        console.error("❌ États chargés:", etats);
        alert(
          `État invalide: "${
            factureData.etat
          }". États valides: ${validStates.join(", ")}`
        );
        return;
      }

      // Utiliser l'état normalisé
      factureData.etat = normalizedEtat;

      // Vérifier et générer le numéro si nécessaire
      let numeroFacture = factureData.numero_facture;
      if (!numeroFacture && factureData.client_id && factureData.offre_id) {
        numeroFacture = generateNumeroFacture(
          factureData.client_id,
          factureData.offre_id
        );
        console.log("🔄 Numéro généré à la dernière minute:", numeroFacture);
      }

      // Mapper les données pour le backend - PRIORITÉ AU NUMÉRO FRONTEND
      const dataToSend = {
        numero: numeroFacture, // ✅ Numéro généré par le frontend
        numero_facture: numeroFacture, // ✅ Champ requis par le backend
        numero_frontend: numeroFacture, // ✅ Champ supplémentaire pour forcer le frontend
        intitule: factureData.intitule,
        date_emission: factureData.date_emission,
        offre_id: factureData.offre_id,
        client_id: factureData.client_id,
        etat: factureData.etat,
        document: factureData.document,
      };

      console.log("📋 Données mappées pour le backend:", dataToSend);
      console.log("📋 Champ numero (FRONTEND):", dataToSend.numero);
      console.log(
        "📋 Champ numero_frontend (FORCE):",
        dataToSend.numero_frontend
      );
      console.log(
        "📋 Champ numero_facture (original):",
        factureData.numero_facture
      );

      const result = await updateFacture(factureId, dataToSend, token);
      console.log("📋 Résultat de modification:", result);

      if (result.message === "Facture mise à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingFacture(null);
        loadFactures();
        alert("Facture modifiée avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la modification de la facture:", error);
      alert("Erreur lors de la modification de la facture");
    }
  };

  const handleDeleteFacture = async (factureId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      try {
        const result = await deleteFacture(factureId, token);
        if (result.message === "Facture supprimée avec succès") {
          loadFactures();
          alert("Facture supprimée avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        alert("Erreur lors de la suppression de la facture");
      }
    }
  };

  const openEditModal = (facture) => {
    setEditingFacture(facture);
    setIsEditModalOpen(true);
  };

  const openViewModal = (facture) => {
    setViewingFacture(facture);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setEditingFacture(null);
    setViewingFacture(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getEtatColor = (etat) => {
    // Chercher la couleur dans les états chargés dynamiquement
    const status = etats.find((s) => s.nom === etat);
    if (status) {
      return status.couleur;
    }

    // Couleurs par défaut pour compatibilité avec les anciens formats
    const defaultColors = {
      "A envoyer au client": "#ffc107",
      "En attente de payement": "#f67800",
      Payée: "#28a745",
    };
    return defaultColors[etat] || "#6c757d";
  };

  if (loading) {
    return (
      <div className="factures-page">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Chargement des factures...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="factures-page">
      <div className="main-content">
        <div className="factures-header">
          <div className="header-left" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
              Retour
            </button>
            <h1>
              <i className="fas fa-file-invoice" style={{ color: "#f67800", fontSize: "1.1rem" }}></i>
              Gestion des Factures
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Compteur */}
            <span style={{
              fontSize: ".8rem", fontWeight: 600,
              color: "#6b7280", background: "#f8f9fa",
              border: "1px solid #e2e8f0", borderRadius: 20,
              padding: "4px 12px"
            }}>
              {filteredFactures.length} facture{filteredFactures.length !== 1 ? "s" : ""}
            </span>

            {hasPermission("factures_create") && (
              <button
                className="add-facture-btn"
                onClick={() => setIsAddModalOpen(true)}
              >
                <i className="fas fa-plus"></i>
                Nouvelle Facture
              </button>
            )}
          </div>
        </div>

        <div className="factures-content">
          <div className="factures-search">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une facture par numéro, intitulé ou client…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {filteredFactures.length === 0 ? (
            <div className="empty-factures">
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#fff7ed", border: "2px solid #fed7aa",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <i className="fas fa-receipt" style={{ fontSize: "1.6rem", color: "#f67800" }}></i>
              </div>
              <h3>Aucune facture trouvée</h3>
              <p>Commencez par créer votre première facture</p>
            </div>
          ) : (
            <div className="factures-table-container">
              <table className="factures-table">
                <thead>
                  <tr>
                    <th><i className="fas fa-hashtag" style={{ marginRight: 6, opacity: .6 }}></i>Numéro</th>
                    <th><i className="fas fa-info-circle" style={{ marginRight: 6, opacity: .6 }}></i>Intitulé</th>
                    <th><i className="fas fa-user" style={{ marginRight: 6, opacity: .6 }}></i>Client</th>
                    <th><i className="fas fa-lightbulb" style={{ marginRight: 6, opacity: .6 }}></i>Offre</th>
                    <th><i className="fas fa-calendar-alt" style={{ marginRight: 6, opacity: .6 }}></i>Émission</th>
                    <th><i className="fas fa-tasks" style={{ marginRight: 6, opacity: .6 }}></i>État</th>
                    <th><i className="fas fa-file-alt" style={{ marginRight: 6, opacity: .6 }}></i>Docs</th>
                    {hasPermission("factures_view_all") && <th><i className="fas fa-user-shield" style={{ marginRight: 6, opacity: .6 }}></i>Responsable</th>}
                    <th style={{ textAlign: "right", paddingRight: 24 }}>Gérer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFactures.map((facture) => (
                    <tr key={facture._id}>
                      <td>{facture.numero_facture || facture.numero || "-"}</td>
                      <td>{facture.intitule || "-"}</td>
                      <td>
                        {facture.client?.raison_sociale ||
                          facture.client?.nom ||
                          "-"}
                      </td>
                      <td>
                        {facture.offre?.intitulee ||
                          facture.offre?.titre ||
                          "-"}
                      </td>
                      <td>{formatDate(facture.date_emission)}</td>
                      <td>
                        <span
                          className="etat-badge"
                          style={{
                            backgroundColor: getEtatColor(facture.etat),
                          }}
                        >
                          {facture.etat || "Non défini"}
                        </span>
                      </td>
                      <td>
                        {facture.documents && facture.documents.length > 0 ? (
                          <div className="documents-cell">
                            {facture.documents.map((document, index) => {
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
                        ) : null}
                      </td>
                      {hasPermission("factures_view_all") && (
                        <td>
                          {(() => {
                            // Chercher le nom du responsable
                            let responsableNom = "-";
                            if (facture.offre?.responsable_id) {
                              // Chercher dans les utilisateurs ou le personnel
                              const responsable =
                                users.find(
                                  (u) => u._id === facture.offre.responsable_id
                                ) ||
                                personnel.find(
                                  (p) => p._id === facture.offre.responsable_id
                                );
                              if (responsable) {
                                responsableNom =
                                  responsable.nom ||
                                  responsable.nom_prenom ||
                                  responsable.name ||
                                  "Responsable inconnu";
                              }
                            }
                            console.log(
                              "🔍 Responsable facture:",
                              facture.offre?.responsable_id,
                              "Nom:",
                              responsableNom
                            );
                            return responsableNom;
                          })()}
                        </td>
                      )}
                      <td>
                        <div className="actions-cell">
                          <button
                            className="view-btn"
                            onClick={() => openViewModal(facture)}
                            title="Voir les détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {hasPermission("factures_edit") && (
                            <button
                              className="edit-btn"
                              onClick={() => openEditModal(facture)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {hasPermission("factures_delete") && (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteFacture(facture._id)}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <FactureModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateFacture}
          offers={offers}
          clients={clients}
          etats={etats}
          title="Nouvelle Facture"
        />
      )}

      {isEditModalOpen && editingFacture && (
        <FactureModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={(data) => handleUpdateFacture(editingFacture._id, data)}
          facture={editingFacture}
          offers={offers}
          clients={clients}
          etats={etats}
          title="Modifier la Facture"
        />
      )}

      {isViewModalOpen && viewingFacture && (
        <FactureViewModal
          isOpen={isViewModalOpen}
          onClose={closeModals}
          facture={viewingFacture}
          etats={etats}
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/modifier une facture
const FactureModal = ({
  isOpen,
  onClose,
  onSubmit,
  facture,
  offers,
  clients,
  etats,
  title,
}) => {
  const [formData, setFormData] = useState({
    numero_facture: "",
    intitule: "",
    date_emission: new Date().toISOString().split("T")[0],
    offre_id: "",
    client_id: "",
    etat: "", // État initial vide, sera défini dans useEffect
    documents: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const generateNumeroFacture = useCallback(
    (clientId, offreId) => {
      if (!clientId || !offreId) {
        return "";
      }

      // OPTIMISATION: Utiliser Map pour O(1) au lieu de O(n)
      const clientsMap = new Map(clients.map(c => [c._id, c]));
      const offersMap = new Map(offers.map(o => [o._id, o]));

      const client = clientsMap.get(clientId);
      const offre = offersMap.get(offreId);

      if (!client || !offre) {
        return "";
      }

      const nomClient = (
        client.raison_sociale ||
        client.nom ||
        "Client"
      ).replace(/\s+/g, "_");
      const nomOffre = (offre.intitulee || offre.titre || "Offre").replace(
        /\s+/g,
        "_"
      );

      return `Fac_${nomClient}_${nomOffre}`;
    },
    [clients, offers]
  );

  useEffect(() => {
    if (facture) {
      const numeroFacture =
        generateNumeroFacture(facture.client_id, facture.offre_id) ||
        facture.numero_facture ||
        facture.numero ||
        "";
      setFormData({
        numero_facture: numeroFacture,
        intitule: facture.intitule || "",
        date_emission: facture.date_emission
          ? new Date(facture.date_emission).toISOString().split("T")[0]
          : "",
        offre_id: facture.offre_id || "",
        client_id: facture.client_id || "",
        etat: facture.etat || "",
        documents: facture.documents
          ? facture.documents.map((doc) =>
              typeof doc === "string"
                ? { url: doc, filename: doc.split("/").pop(), id: doc }
                : doc
            )
          : [],
      });
    } else {
      // Ne pas écraser l'état si l'utilisateur en a déjà sélectionné un
      setFormData((prev) => ({
        numero_facture: "",
        intitule: "",
        date_emission: new Date().toISOString().split("T")[0],
        offre_id: "",
        client_id: "",
        etat: prev.etat || "",
        documents: [],
      }));
    }
  }, [facture, clients, offers, generateNumeroFacture]); // Retirer etats pour éviter la réinitialisation

  // Initialiser l'état seulement si aucun n'est défini et que les états sont chargés
  useEffect(() => {
    if (!facture && etats.length > 0 && !formData.etat) {
      setFormData((prev) => ({
        ...prev,
        etat: etats[0].nom,
      }));
    }
  }, [etats, facture, formData.etat]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Normaliser l'état pour supprimer les espaces
      const normalizedValue = name === "etat" ? value?.trim() : value;
      const newData = { ...prev, [name]: normalizedValue };

      // Générer automatiquement le numéro si client ou offre change
      if (name === "client_id" || name === "offre_id") {
        const numeroFacture = generateNumeroFacture(
          name === "client_id" ? value : newData.client_id,
          name === "offre_id" ? value : newData.offre_id
        );
        if (numeroFacture) {
          newData.numero_facture = numeroFacture;
        }
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.intitule.trim()) newErrors.intitule = "L'intitulé est requis";
    if (!formData.date_emission)
      newErrors.date_emission = "La date d'émission est requise";
    if (!formData.offre_id) newErrors.offre_id = "L'offre est requise";
    if (!formData.client_id) newErrors.client_id = "Le client est requis";
    if (!formData.etat) newErrors.etat = "L'état est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Préparer les données pour le backend avec seulement les URLs
    const submitData = {
      ...formData,
      document: formData.documents.map((doc) => doc.url), // Seulement les URLs
    };

    console.log("🚀 handleSubmit Facture - Données du formulaire:", submitData);
    console.log(
      "🚀 handleSubmit Facture - URLs des documents:",
      submitData.document
    );

    setLoading(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header orange — titre BLANC GRAND */}
        <div className="modal-header" style={{ background: "#f67800", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 30px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.15rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 9,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className={`fas ${facture ? "fa-file-invoice-dollar" : "fa-file-medical"}`} style={{ fontSize: "1rem", opacity: .85 }}></i>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", transition: "all .22s", flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-grid" style={{ padding: "30px" }}>
          <div className="form-group full-width">
            <label htmlFor="numero_facture">Numéro de facture</label>
            <input
              type="text"
              id="numero_facture"
              name="numero_facture"
              value={formData.numero_facture || ""}
              readOnly
              className="readonly-field"
              placeholder="Sera généré automatiquement"
              style={{
                backgroundColor: "#f8f9fa",
                color: "#6c757d",
                cursor: "not-allowed",
              }}
            />
            <small className="form-help">
              Le numéro est généré automatiquement selon le format:
              Fac_NomClient_NomOffre
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="intitule">Intitulé *</label>
            <input
              type="text"
              id="intitule"
              name="intitule"
              value={formData.intitule}
              onChange={handleChange}
              className={errors.intitule ? "error" : ""}
              placeholder="Intitulé de la facture"
            />
            {errors.intitule && (
              <span className="error-message">{errors.intitule}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date_emission">Date d'émission *</label>
            <input
              type="date"
              id="date_emission"
              name="date_emission"
              value={formData.date_emission}
              onChange={handleChange}
              className={errors.date_emission ? "error" : ""}
            />
            {errors.date_emission && (
              <span className="error-message">{errors.date_emission}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="offre_id">Offre *</label>
            <select
              id="offre_id"
              name="offre_id"
              value={formData.offre_id}
              onChange={handleChange}
              className={errors.offre_id ? "error" : ""}
            >
              <option value="">Sélectionner une offre</option>
              {offers.map((offre) => (
                <option key={offre._id} value={offre._id}>
                  {offre.intitulee}
                </option>
              ))}
            </select>
            {errors.offre_id && (
              <span className="error-message">{errors.offre_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="client_id">Client *</label>
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className={errors.client_id ? "error" : ""}
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.raison_sociale}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <span className="error-message">{errors.client_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="etat">État *</label>
            <select
              id="etat"
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              className={errors.etat ? "error" : ""}
            >
              <option value="">Sélectionner un état</option>
              {etats.map((etat) => (
                <option key={etat._id || etat.nom} value={etat.nom}>
                  {etat.nom}
                </option>
              ))}
            </select>
            {errors.etat && (
              <span className="error-message">{errors.etat}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="documents">Documents (optionnel)</label>
            <SimpleFilestackUploader
              multiple={true}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              maxFiles={10}
              onUploadComplete={(uploadedFiles) => {
                setFormData((prev) => ({
                  ...prev,
                  documents: [...prev.documents, ...uploadedFiles],
                }));
              }}
              onUploadError={(error) => {
                console.error("Erreur upload:", error);
                alert("Erreur lors de l'upload des fichiers");
              }}
            />
            {formData.documents && formData.documents.length > 0 && (
              <div className="documents-list">
                <h4>Documents uploadés:</h4>
                {formData.documents.map((file, index) => (
                  <div key={file.id || index} className="document-item">
                    <i className="fas fa-file"></i>
                    <div className="file-details">
                      <span className="file-name">
                        {file.filename || file.name}
                      </span>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-url"
                        >
                          Voir le fichier
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="remove-document"
                      title="Supprimer le document"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions" style={{ gridColumn: "span 2", marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", height: "38px", padding: "0 20px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: "white", cursor: "pointer" }}
            >
              <i className="fas fa-times"></i>
              Annuler
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              disabled={loading}
              style={{ 
                display: "flex", alignItems: "center", gap: "6px",
                background: "#f67800", color: "white", border: "none",
                padding: "0 26px", borderRadius: "8px", fontWeight: "600",
                height: "38px", cursor: "pointer"
              }}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-check"></i>
              )}
              {facture ? "Mettre à jour" : "Créer la Facture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Modal pour voir les détails d'une facture
const FactureViewModal = ({ isOpen, onClose, facture, etats }) => {
  if (!isOpen || !facture) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getEtatColor = (etat) => {
    // Chercher la couleur dans les états chargés dynamiquement
    const status = etats.find((s) => s.nom === etat);
    if (status) {
      return status.couleur;
    }

    // Couleurs par défaut pour compatibilité avec les anciens formats
    const defaultColors = {
      "A envoyer au client": "#ffc107",
      "En attente de payement": "#f67800",
      Payée: "#28a745",
    };
    return defaultColors[etat] || "#6c757d";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Détails de la Facture</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="view-details">
          <div className="detail-group">
            <label>Numéro</label>
            <div className="detail-value">{facture.numero || "-"}</div>
          </div>

          <div className="detail-group">
            <label>Intitulé</label>
            <div className="detail-value">{facture.intitule || "-"}</div>
          </div>

          <div className="detail-group">
            <label>Client</label>
            <div className="detail-value">
              {facture.client?.raison_sociale || "-"}
            </div>
          </div>

          <div className="detail-group">
            <label>Offre</label>
            <div className="detail-value">
              {facture.offre?.intitulee || "-"}
            </div>
          </div>

          <div className="detail-group">
            <label>Date d'émission</label>
            <div className="detail-value">
              {formatDate(facture.date_emission)}
            </div>
          </div>

          <div className="detail-group">
            <label>État</label>
            <div className="detail-value">
              <span
                className="etat-badge"
                style={{ backgroundColor: getEtatColor(facture.etat) }}
              >
                {facture.etat || "Non défini"}
              </span>
            </div>
          </div>

          {facture.documents && facture.documents.length > 0 && (
            <div className="detail-group">
              <label>Documents</label>
              <div className="detail-value">
                <div className="documents-list">
                  {facture.documents.map((document, index) => {
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
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturesPage;
