import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDevis,
  createDevis,
  updateDevis,
  deleteDevis,
  fetchOffers,
  fetchClients,
  transformDevisToFacture,
  fetchUsers,
  fetchPersonnel,
  quoteStatusesAPI,
} from "../api";
import SimpleFilestackUploader from "../components/SimpleFilestackUploader";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./DevisPage.css";
import "../components/SimpleFilestackUploader.css";

const DevisPage = () => {
  const [devis, setDevis] = useState([]);
  const [offers, setOffers] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  // Charger les états depuis localStorage en premier pour affichage immédiat
  const [etats, setEtats] = useState(() => {
    const cached = localStorage.getItem("quoteStatuses");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          console.log("📦 États de devis chargés depuis le cache:", parsed);
          return parsed;
        }
      } catch (e) {
        console.warn("Erreur lors du parsing des états en cache:", e);
      }
    }
    // États par défaut si pas de cache (correspondent à QuoteStatusPage)
    return [
      { nom: "Brouillon", couleur: "#6c757d" },
      { nom: "Envoyé", couleur: "#17a2b8" },
      { nom: "Validé", couleur: "#28a745" },
      { nom: "Refusé", couleur: "#dc3545" },
      { nom: "Transformé en facture", couleur: "#f67800" },
    ];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDevis, setEditingDevis] = useState(null);
  const [viewingDevis, setViewingDevis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const _navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();
  const hasLoadedRef = useRef(false);

  const loadQuoteStatuses = useCallback(async () => {
    try {
      console.log("📋 Chargement des états de devis depuis l'API Flask...");

      // Toujours charger depuis l'API Flask pour avoir les données à jour
      const apiStatuses = await quoteStatusesAPI.getAll();

      if (apiStatuses && apiStatuses.length > 0) {
        console.log("📋 États de devis chargés depuis l'API:", apiStatuses);
        setEtats(apiStatuses);
        // Sauvegarder dans localStorage pour le prochain chargement
        localStorage.setItem("quoteStatuses", JSON.stringify(apiStatuses));
      } else {
        // États par défaut si aucun n'est configuré
        const defaultStatuses = [
          { nom: "Brouillon", couleur: "#6c757d" },
          { nom: "Envoyé", couleur: "#17a2b8" },
          { nom: "Validé", couleur: "#28a745" },
          { nom: "Refusé", couleur: "#dc3545" },
          { nom: "Transformé en facture", couleur: "#f67800" },
        ];
        console.log("📋 Utilisation des états par défaut");
        setEtats(defaultStatuses);
        localStorage.setItem("quoteStatuses", JSON.stringify(defaultStatuses));
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des états de devis:", err);
      // En cas d'erreur, utiliser le cache ou les états par défaut
      const cached = localStorage.getItem("quoteStatuses");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            console.log("📋 Utilisation des états en cache");
            setEtats(parsed);
            return;
          }
        } catch (e) {
          console.warn("Erreur lors du parsing du cache:", e);
        }
      }
      // États par défaut en cas d'erreur
      const defaultStatuses = [
        { nom: "Brouillon", couleur: "#6c757d" },
        { nom: "Envoyé", couleur: "#17a2b8" },
        { nom: "Validé", couleur: "#28a745" },
        { nom: "Refusé", couleur: "#dc3545" },
        { nom: "Transformé en facture", couleur: "#f67800" },
      ];
      setEtats(defaultStatuses);
      localStorage.setItem("quoteStatuses", JSON.stringify(defaultStatuses));
    }
  }, []); // Pas de dépendances pour éviter les boucles infinies

  const loadDevis = useCallback(async () => {
    // Éviter le double chargement si déjà en cours
    if (loading) {
      console.log("⏭️ Chargement des devis déjà en cours, ignoré");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Chargement des devis...");
      const devisData = await fetchDevis(token);
      console.log("📋 Devis chargés bruts:", devisData?.length || 0);

      // Filtrer selon les permissions : view_all vs view_owner
      let filteredDevisData = Array.isArray(devisData) ? devisData : [];

      if (!hasPermission("devis_view_all") && hasPermission("devis_view")) {
        // L'utilisateur ne voit que ses propres devis
        console.log("🔐 Filtrage des devis - Mode view_owner uniquement");
        filteredDevisData = filteredDevisData.filter(
          (d) =>
            d.responsable_id === currentUserId ||
            d.user_id === currentUserId ||
            d.created_by === currentUserId
        );
        console.log("📋 Devis filtrés (view_owner):", filteredDevisData.length);
      } else if (hasPermission("devis_view_all")) {
        console.log(
          "✅ Permission devis_view_all - Affichage de tous les devis"
        );
      }

      // OPTIMISATION: Utiliser Map pour enrichissement rapide
      const clientsMap = new Map(clients.map((c) => [c._id, c]));
      const offersMap = new Map(offers.map((o) => [o._id, o]));

      // Enrichir les devis avec les détails complets des clients et offres
      const enrichedDevis = filteredDevisData.map((devis) => {
        const client = clientsMap.get(devis.client_id);
        const offre = offersMap.get(devis.offre_id);

        return {
          ...devis,
          client: client || { raison_sociale: "Client inconnu" },
          offre: offre || { intitulee: "Offre inconnue" },
          // Normaliser les documents (peuvent être dans 'document' ou 'documents')
          documents: devis.document || devis.documents || [],
        };
      });

      console.log("📋 Devis enrichis finaux:", enrichedDevis.length);
      setDevis(enrichedDevis);
      setError("");
    } catch (err) {
      console.error("❌ Erreur lors du chargement des devis:", err);
      setError(`Erreur lors du chargement des devis: ${err.message}`);
      setDevis([]);
    } finally {
      setLoading(false);
    }
  }, [token, clients, offers, hasPermission, currentUserId, loading]);

  const generateNumeroDevis = useCallback(
    (clientId, offreId) => {
      if (!clientId || !offreId) {
        return "";
      }

      // OPTIMISATION: Utiliser Map pour O(1) au lieu de O(n)
      const clientsMap = new Map(clients.map((c) => [c._id, c]));
      const offersMap = new Map(offers.map((o) => [o._id, o]));

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

      return `Dev_${nomClient}_${nomOffre}`;
    },
    [clients, offers]
  );

  const loadOffersAndClients = useCallback(async () => {
    // Éviter le double chargement
    if (hasLoadedRef.current) {
      console.log("⏭️ Chargement déjà effectué, ignoré");
      return;
    }

    try {
      hasLoadedRef.current = true;
      console.log(
        "🔄 DevisPage - Chargement des offres, clients, utilisateurs, personnel, états et devis en parallèle..."
      );

      // OPTIMISATION: Charger les devis en parallèle avec les autres données
      const [
        offersData,
        clientsData,
        usersData,
        personnelData,
        etatsData,
        devisData,
      ] = await Promise.all([
        fetchOffers(token).catch((err) => {
          console.error("❌ Erreur fetchOffers:", err);
          return [];
        }),
        fetchClients(token).catch((err) => {
          console.error("❌ Erreur fetchClients:", err);
          return [];
        }),
        fetchUsers(token).catch((err) => {
          console.error("❌ Erreur fetchUsers:", err);
          return [];
        }),
        fetchPersonnel(token).catch((err) => {
          console.error("❌ Erreur fetchPersonnel:", err);
          return [];
        }),
        quoteStatusesAPI.getAll().catch((err) => {
          console.error("❌ Erreur quoteStatusesAPI.getAll:", err);
          return [];
        }),
        fetchDevis(token).catch((err) => {
          console.error("❌ Erreur fetchDevis:", err);
          return [];
        }),
      ]);

      console.log("📋 Offres chargées:", offersData?.length || 0, offersData);
      console.log("👥 Clients chargés:", clientsData?.length || 0, clientsData);
      console.log(
        "👤 Utilisateurs chargés:",
        usersData?.length || 0,
        usersData
      );
      console.log(
        "👥 Personnel chargé:",
        personnelData?.length || 0,
        personnelData
      );
      console.log("📊 États chargés:", etatsData?.length || 0, etatsData);

      // Filtrer les offres selon les permissions
      let filteredOffers = Array.isArray(offersData) ? offersData : [];
      if (!hasPermission("devis_view_all")) {
        const currentUserId = localStorage.getItem("userId");
        console.log("🔍 Filtrage des offres - userId:", currentUserId);
        console.log("🔍 Total offres avant filtrage:", filteredOffers.length);
        filteredOffers = filteredOffers.filter(
          (offre) =>
            offre.responsable_id === currentUserId ||
            offre.user_id === currentUserId ||
            offre.created_by === currentUserId
        );
        console.log(
          "🔍 Offres filtrées pour l'utilisateur:",
          filteredOffers.length
        );
      } else {
        console.log(
          "✅ Permission devis_view_all - Affichage de toutes les offres"
        );
      }

      setOffers(filteredOffers);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPersonnel(Array.isArray(personnelData) ? personnelData : []);

      // Gestion spéciale pour les états - toujours avoir des valeurs par défaut
      if (Array.isArray(etatsData) && etatsData.length > 0) {
        console.log("📋 États chargés depuis l'API:", etatsData);
        setEtats(etatsData);
        localStorage.setItem("quoteStatuses", JSON.stringify(etatsData));
      } else {
        // Vérifier le cache avant d'utiliser les valeurs par défaut
        const cached = localStorage.getItem("quoteStatuses");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
              console.log("📋 Utilisation des états en cache");
              setEtats(parsed);
            } else {
              throw new Error("Cache vide");
            }
          } catch (e) {
            console.log("🔄 Utilisation des états par défaut pour les devis");
            const defaultStatuses = [
              { nom: "Brouillon", couleur: "#6c757d" },
              { nom: "Envoyé", couleur: "#17a2b8" },
              { nom: "Validé", couleur: "#28a745" },
              { nom: "Refusé", couleur: "#dc3545" },
              { nom: "Transformé en facture", couleur: "#f67800" },
            ];
            setEtats(defaultStatuses);
            localStorage.setItem(
              "quoteStatuses",
              JSON.stringify(defaultStatuses)
            );
          }
        } else {
          console.log("🔄 Utilisation des états par défaut pour les devis");
          const defaultStatuses = [
            { nom: "Brouillon", couleur: "#6c757d" },
            { nom: "Envoyé", couleur: "#17a2b8" },
            { nom: "Validé", couleur: "#28a745" },
            { nom: "Refusé", couleur: "#dc3545" },
            { nom: "Transformé en facture", couleur: "#f67800" },
          ];
          setEtats(defaultStatuses);
          localStorage.setItem(
            "quoteStatuses",
            JSON.stringify(defaultStatuses)
          );
        }
      }

      // Traiter les devis immédiatement avec les données chargées
      let filteredDevisData = Array.isArray(devisData) ? devisData : [];

      // Filtrer selon les permissions
      if (!hasPermission("devis_view_all") && hasPermission("devis_view")) {
        filteredDevisData = filteredDevisData.filter(
          (d) =>
            d.responsable_id === currentUserId ||
            d.user_id === currentUserId ||
            d.created_by === currentUserId
        );
      }

      // OPTIMISATION: Utiliser Map pour enrichissement rapide
      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      const clientsMap = new Map(clientsArray.map((c) => [c._id, c]));
      const offersMap = new Map(filteredOffers.map((o) => [o._id, o]));

      const enrichedDevis = filteredDevisData.map((devis) => {
        const client = clientsMap.get(devis.client_id);
        const offre = offersMap.get(devis.offre_id);

        return {
          ...devis,
          client: client || { raison_sociale: "Client inconnu" },
          offre: offre || { intitulee: "Offre inconnue" },
          documents: devis.document || devis.documents || [],
        };
      });

      setDevis(enrichedDevis);
      setLoading(false);
      setError("");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      // Valeurs par défaut en cas d'erreur
      setOffers([]);
      setClients([]);
      setUsers([]);
      setPersonnel([]);
      setEtats([
        { nom: "Validé", couleur: "#28a745" },
        { nom: "Transformé en facture", couleur: "#6c757d" },
      ]);
      setDevis([]);
      setLoading(false);
      setError(`Erreur lors du chargement: ${error.message}`);
      hasLoadedRef.current = false; // Réessayer au prochain montage en cas d'erreur
    }
  }, [token, hasPermission, currentUserId]);

  useEffect(() => {
    if (permissionsLoading) {
      // Afficher un loader pendant le chargement des permissions
      setLoading(true);
      return;
    }

    if (!hasPermission("devis_view") && !hasPermission("devis_view_all")) {
      console.log("🔓 DevisPage - Mode test sans connexion");
      setLoading(false);
      return;
    }

    // OPTIMISATION: Charger tout en une seule fois (devis inclus)
    setLoading(true);
    loadOffersAndClients();
    // Charger les états de devis dynamiques pour s'assurer qu'ils sont à jour
    loadQuoteStatuses().catch((err) => {
      console.warn("Erreur lors du chargement des états (non bloquant):", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading]); // Ne dépendre que de permissionsLoading

  // Synchronisation en temps réel avec les autres pages
  useEffect(() => {
    // Charger les statuts immédiatement au montage
    loadQuoteStatuses();

    const handleStorageChange = (e) => {
      if (e.key === "quoteStatuses") {
        try {
          const updatedStatuses = JSON.parse(e.newValue);
          setEtats(updatedStatuses);
          console.log("🔄 États de devis mis à jour depuis localStorage");
        } catch (err) {
          console.warn("Erreur lors de la mise à jour des états:", err);
        }
      }
    };

    const handleStatusesUpdated = () => {
      // Recharger depuis l'API quand les statuts sont mis à jour
      console.log(
        "🔄 Événement quoteStatusesUpdated reçu, rechargement des statuts..."
      );
      loadQuoteStatuses();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("quoteStatusesUpdated", handleStatusesUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("quoteStatusesUpdated", handleStatusesUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger une seule fois au montage

  const filteredDevis = devis.filter((devis) => {
    const search = searchTerm.toLowerCase();

    // Recherche dans les champs texte simples
    const matchesNumero =
      devis.numero_devis?.toLowerCase().includes(search) ||
      devis.numero?.toLowerCase().includes(search);
    const matchesIntitule = devis.intitule?.toLowerCase().includes(search);
    const matchesEtat = devis.etat?.toLowerCase().includes(search);

    // Recherche dans le client (gérer objet ou string)
    let matchesClient = false;
    if (devis.client) {
      if (typeof devis.client === "string") {
        matchesClient = devis.client.toLowerCase().includes(search);
      } else if (devis.client_id) {
        const client = clients.find((c) => c._id === devis.client_id);
        if (client) {
          matchesClient =
            client.raison_sociale?.toLowerCase().includes(search) ||
            client.nom?.toLowerCase().includes(search);
        }
      }
    }

    return matchesNumero || matchesIntitule || matchesEtat || matchesClient;
  });

  const handleCreateDevis = async (devisData) => {
    try {
      console.log("🔄 Création d'un devis...");
      console.log("📋 Données reçues:", devisData);
      console.log(
        "📋 Permissions utilisateur:",
        hasPermission("view_all_quotes") ? "Admin" : "Utilisateur standard"
      );
      console.log("📋 Current user ID:", currentUserId);

      // Vérifier et générer le numéro si nécessaire
      let numeroDevis = devisData.numero_devis;
      console.log("📋 Numéro devis initial:", numeroDevis);
      console.log("📋 Client ID:", devisData.client_id);
      console.log("📋 Offre ID:", devisData.offre_id);

      if (!numeroDevis && devisData.client_id && devisData.offre_id) {
        numeroDevis = generateNumeroDevis(
          devisData.client_id,
          devisData.offre_id
        );
        console.log("🔄 Numéro généré à la dernière minute:", numeroDevis);
      }

      console.log("📋 Numéro devis final:", numeroDevis);

      // S'assurer que le numéro n'est jamais vide
      if (!numeroDevis) {
        console.error("❌ ERREUR: Aucun numéro de devis généré!");
        alert(
          "Erreur: Impossible de générer le numéro de devis. Vérifiez que le client et l'offre sont sélectionnés."
        );
        return;
      }

      // Normalisation et validation de l'état
      const normalizedEtat = devisData.etat?.trim();

      // Utiliser uniquement les états chargés dynamiquement depuis QuoteStatusPage
      const validStates = etats.map((status) => status.nom);

      // Vérifier que les états sont chargés depuis QuoteStatusPage
      if (validStates.length === 0) {
        console.error("❌ Aucun état chargé depuis QuoteStatusPage");
        alert(
          "Erreur: Les états de devis ne sont pas chargés. Veuillez configurer les états dans la page de paramétrage."
        );
        return;
      }

      console.log("📋 États valides pour validation:", validStates);
      console.log("📋 État normalisé:", normalizedEtat);
      console.log(
        "📋 État dans la liste:",
        validStates.includes(normalizedEtat)
      );

      if (!normalizedEtat || !validStates.includes(normalizedEtat)) {
        console.error("❌ État invalide:", devisData.etat);
        console.error("❌ État normalisé:", normalizedEtat);
        console.error("❌ États valides:", validStates);
        console.error("❌ États chargés:", etats);
        alert(
          `État invalide: "${
            devisData.etat
          }". États valides: ${validStates.join(", ")}`
        );
        return;
      }

      // Utiliser l'état normalisé
      devisData.etat = normalizedEtat;

      // Mapper les données pour le backend - PRIORITÉ AU NUMÉRO FRONTEND
      const dataToSend = {
        numero: numeroDevis, // ✅ Numéro généré par le frontend
        numero_devis: numeroDevis, // ✅ Champ requis par le backend
        numero_frontend: numeroDevis, // ✅ Champ supplémentaire pour forcer le frontend
        intitule: devisData.intitule,
        date_emission: devisData.date_emission,
        offre_id: devisData.offre_id,
        client_id: devisData.client_id,
        etat: devisData.etat,
        document: devisData.document,
      };

      console.log("📋 Données mappées pour le backend:", dataToSend);
      console.log("📋 Champ numero (FRONTEND):", dataToSend.numero);
      console.log(
        "📋 Champ numero_frontend (FORCE):",
        dataToSend.numero_frontend
      );
      console.log("📋 Champ numero_devis (original):", devisData.numero_devis);
      console.log("📋 Toutes les clés mappées:", Object.keys(dataToSend));
      console.log("📋 Token:", token ? "Présent" : "Absent");
      console.log(
        "📋 URL API:",
        process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
      );

      const result = await createDevis(dataToSend, token);
      console.log("📋 Résultat de création:", result);

      if (result.message === "Devis créé avec succès" || result._id) {
        setIsAddModalOpen(false);
        loadDevis();
        alert("Devis créé avec succès");
      } else {
        const errorMsg = result.message || "Erreur lors de la création";
        console.error("❌ Erreur création devis:", errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création du devis:", error);

      if (error.message.includes("Failed to fetch")) {
        alert(
          "❌ Erreur de connexion au serveur backend.\n\nVérifiez que :\n1. Le serveur backend est démarré\n2. Il écoute sur le port 8000\n3. L'URL est correcte dans votre configuration"
        );
      } else {
        alert(`Erreur lors de la création du devis: ${error.message}`);
      }
    }
  };

  const handleUpdateDevis = async (devisId, devisData) => {
    try {
      console.log("🔄 Modification d'un devis...");
      console.log("📋 Devis ID:", devisId);
      console.log("📋 Données reçues:", devisData);

      // Vérifier et générer le numéro si nécessaire
      let numeroDevis = devisData.numero_devis;
      if (!numeroDevis && devisData.client_id && devisData.offre_id) {
        numeroDevis = generateNumeroDevis(
          devisData.client_id,
          devisData.offre_id
        );
        console.log("🔄 Numéro généré à la dernière minute:", numeroDevis);
      }

      // Normalisation et validation de l'état
      const normalizedEtat = devisData.etat?.trim();

      // Utiliser uniquement les états chargés dynamiquement depuis QuoteStatusPage
      const validStates = etats.map((status) => status.nom);

      // Vérifier que les états sont chargés depuis QuoteStatusPage
      if (validStates.length === 0) {
        console.error("❌ Aucun état chargé depuis QuoteStatusPage");
        alert(
          "Erreur: Les états de devis ne sont pas chargés. Veuillez configurer les états dans la page de paramétrage."
        );
        return;
      }

      console.log("📋 États valides pour validation:", validStates);
      console.log("📋 État normalisé:", normalizedEtat);
      console.log(
        "📋 État dans la liste:",
        validStates.includes(normalizedEtat)
      );

      if (!normalizedEtat || !validStates.includes(normalizedEtat)) {
        console.error("❌ État invalide:", devisData.etat);
        console.error("❌ État normalisé:", normalizedEtat);
        console.error("❌ États valides:", validStates);
        console.error("❌ États chargés:", etats);
        alert(
          `État invalide: "${
            devisData.etat
          }". États valides: ${validStates.join(", ")}`
        );
        return;
      }

      // Utiliser l'état normalisé
      devisData.etat = normalizedEtat;

      // Mapper les données pour le backend - PRIORITÉ AU NUMÉRO FRONTEND
      const dataToSend = {
        numero: numeroDevis, // ✅ Numéro généré par le frontend
        numero_devis: numeroDevis, // ✅ Champ requis par le backend
        numero_frontend: numeroDevis, // ✅ Champ supplémentaire pour forcer le frontend
        intitule: devisData.intitule,
        date_emission: devisData.date_emission,
        offre_id: devisData.offre_id,
        client_id: devisData.client_id,
        etat: devisData.etat,
        document: devisData.document,
      };

      console.log("📋 Données mappées pour le backend:", dataToSend);
      console.log("📋 Champ numero (FRONTEND):", dataToSend.numero);
      console.log(
        "📋 Champ numero_frontend (FORCE):",
        dataToSend.numero_frontend
      );
      console.log("📋 Champ numero_devis (original):", devisData.numero_devis);

      const result = await updateDevis(devisId, dataToSend, token);
      console.log("📋 Résultat de modification:", result);

      if (result.message === "Devis mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingDevis(null);
        loadDevis();
        alert("Devis modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la modification du devis:", error);
      alert("Erreur lors de la modification du devis");
    }
  };

  const handleDeleteDevis = async (devisId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      try {
        const result = await deleteDevis(devisId, token);
        if (result.message === "Devis supprimé avec succès") {
          loadDevis();
          alert("Devis supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        alert("Erreur lors de la suppression du devis");
      }
    }
  };

  const handleTransformToFacture = async (devisId) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir transformer ce devis en facture ?"
      )
    ) {
      try {
        const result = await transformDevisToFacture(devisId, token);
        if (result.message === "Devis transformé en facture avec succès") {
          loadDevis();
          alert("Devis transformé en facture avec succès");
        } else {
          alert(result.message || "Erreur lors de la transformation");
        }
      } catch (error) {
        alert("Erreur lors de la transformation du devis");
      }
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (devis) => {
    setEditingDevis(devis);
    setIsEditModalOpen(true);
  };
  const openViewModal = (devis) => {
    setViewingDevis(devis);
    setIsViewModalOpen(true);
  };
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setEditingDevis(null);
    setViewingDevis(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
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
      Validé: "#28a745",
      "Transformé en facture": "#6c757d",
    };
    return defaultColors[etat] || "#ffc107";
  };

  // Afficher un loader seulement pendant le chargement des permissions
  // Ne pas bloquer si on a déjà des états en cache
  if (permissionsLoading) {
    return (
      <div className="devis-page">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Chargement des permissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un loader seulement si on charge ET qu'on n'a pas encore de devis
  // Si on a déjà des devis, on peut afficher la page même si on recharge en arrière-plan
  if (loading && devis.length === 0 && offers.length === 0) {
    return (
      <div className="devis-page">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Chargement des devis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="devis-page">
      <div className="main-content">
        <div className="devis-header">
          <div className="devis-header-left"></div>
          <div className="devis-header-actions">
            <input
              type="text"
              placeholder="Rechercher un devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {hasPermission("devis_create") && (
              <button onClick={openAddModal} className="add-devis-btn">
                <i className="fas fa-plus"></i>
                Nouveau Devis
              </button>
            )}
          </div>
        </div>

        <div className="devis-content">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {filteredDevis.length === 0 ? (
            <div className="empty-devis">
              <i className="fas fa-file-invoice"></i>
              <h3>Aucun devis trouvé</h3>
              <p>Commencez par créer votre premier devis</p>
            </div>
          ) : (
            <div className="devis-table-container">
              <table className="devis-table">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Intitulé</th>
                    <th>Client</th>
                    <th>Offre</th>
                    <th>Date d'émission</th>
                    <th>État</th>
                    <th>Documents</th>
                    {hasPermission("view_all_quotes") && <th>Responsable</th>}
                    <th>Gérer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevis.map((devis) => (
                    <tr key={devis._id}>
                      <td>{devis.numero_devis || devis.numero || "-"}</td>
                      <td>{devis.intitule || "-"}</td>
                      <td>
                        {devis.client?.raison_sociale ||
                          devis.client?.nom ||
                          "-"}
                      </td>
                      <td>
                        {devis.offre?.intitulee || devis.offre?.titre || "-"}
                      </td>
                      <td>{formatDate(devis.date_emission)}</td>
                      <td>
                        <span
                          className="etat-badge"
                          style={{ backgroundColor: getEtatColor(devis.etat) }}
                        >
                          {devis.etat || "Non défini"}
                        </span>
                      </td>
                      <td>
                        {devis.documents && devis.documents.length > 0 ? (
                          <div className="documents-cell">
                            {devis.documents.map((document, index) => {
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
                      {hasPermission("view_all_quotes") && (
                        <td>
                          {(() => {
                            // Chercher le nom du responsable
                            let responsableNom = "-";
                            if (devis.offre?.responsable_id) {
                              // Chercher dans les utilisateurs ou le personnel
                              const responsable =
                                users.find(
                                  (u) => u._id === devis.offre.responsable_id
                                ) ||
                                personnel.find(
                                  (p) => p._id === devis.offre.responsable_id
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
                              "🔍 Responsable devis:",
                              devis.offre?.responsable_id,
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
                            onClick={() => openViewModal(devis)}
                            title="Voir les détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {hasPermission("devis_edit") && (
                            <button
                              className="edit-btn"
                              onClick={() => openEditModal(devis)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {hasPermission("devis_edit") &&
                            devis.etat === "Validé" && (
                              <button
                                className="transform-btn"
                                onClick={() =>
                                  handleTransformToFacture(devis._id)
                                }
                                title="Transformer en facture"
                              >
                                <i className="fas fa-exchange-alt"></i>
                              </button>
                            )}
                          {hasPermission("devis_delete") && (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteDevis(devis._id)}
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
        <DevisModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateDevis}
          offers={offers}
          clients={clients}
          etats={etats}
          hasPermission={hasPermission}
          currentUserId={currentUserId}
          generateNumeroDevis={generateNumeroDevis}
          title="Nouveau Devis"
        />
      )}

      {isEditModalOpen && editingDevis && (
        <DevisModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={(data) => handleUpdateDevis(editingDevis._id, data)}
          devis={editingDevis}
          offers={offers}
          clients={clients}
          etats={etats}
          hasPermission={hasPermission}
          currentUserId={currentUserId}
          generateNumeroDevis={generateNumeroDevis}
          title="Modifier le Devis"
        />
      )}

      {isViewModalOpen && viewingDevis && (
        <DevisViewModal
          isOpen={isViewModalOpen}
          onClose={closeModals}
          devis={viewingDevis}
          etats={etats}
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/modifier un devis
const DevisModal = ({
  isOpen,
  onClose,
  onSubmit,
  devis,
  offers,
  clients,
  etats,
  _role,
  _currentUserId,
  generateNumeroDevis,
  title,
}) => {
  const [formData, setFormData] = useState({
    numero_devis: "",
    intitule: "",
    date_emission: new Date().toISOString().split("T")[0],
    offre_id: "",
    client_id: "",
    etat: "Validé",
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

  useEffect(() => {
    if (devis) {
      const numeroDevis =
        generateNumeroDevis(devis.client_id, devis.offre_id) ||
        devis.numero_devis ||
        devis.numero ||
        "";
      setFormData({
        numero_devis: numeroDevis,
        intitule: devis.intitule || "",
        date_emission: devis.date_emission
          ? new Date(devis.date_emission).toISOString().split("T")[0]
          : "",
        offre_id: devis.offre_id || "",
        client_id: devis.client_id || "",
        etat: devis.etat || "Validé",
        documents: devis.documents
          ? devis.documents.map((doc) =>
              typeof doc === "string"
                ? { url: doc, filename: doc.split("/").pop(), id: doc }
                : doc
            )
          : [],
      });
    } else {
      setFormData({
        numero_devis: "",
        intitule: "",
        date_emission: new Date().toISOString().split("T")[0],
        offre_id: "",
        client_id: "",
        etat: "Validé",
        documents: [],
      });
    }
  }, [devis, clients, offers, generateNumeroDevis]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("🔄 handleChange appelé - name:", name, "value:", value);

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log("📋 Nouvelle data après changement:", newData);

      // Générer automatiquement le numéro si client ou offre change
      if (name === "client_id" || name === "offre_id") {
        console.log("🔄 Changement de client ou offre détecté");
        console.log("📋 Client ID actuel:", newData.client_id);
        console.log("📋 Offre ID actuel:", newData.offre_id);

        const numeroDevis = generateNumeroDevis(
          name === "client_id" ? value : newData.client_id,
          name === "offre_id" ? value : newData.offre_id
        );

        console.log("📋 Numéro généré:", numeroDevis);

        if (numeroDevis) {
          newData.numero_devis = numeroDevis;
          console.log("✅ Numéro mis à jour dans formData:", numeroDevis);
        } else {
          console.log("❌ Aucun numéro généré - client ou offre manquant");
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
    if (!formData.numero_devis.trim())
      newErrors.numero_devis = "Le numéro de devis est requis";
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

    console.log("🚀 handleSubmit - Données du formulaire:", submitData);
    console.log("🚀 handleSubmit - URLs des documents:", submitData.document);

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
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="numero_devis">Numéro de Devis *</label>
            <input
              type="text"
              id="numero_devis"
              name="numero_devis"
              value={formData.numero_devis}
              onChange={handleChange}
              className={`readonly-field ${errors.numero_devis ? "error" : ""}`}
              readOnly
              placeholder="Généré automatiquement"
            />
            {errors.numero_devis && (
              <span className="error-message">{errors.numero_devis}</span>
            )}
            <small className="form-help">
              Le numéro est généré automatiquement selon le format :
              Dev_Client_Offre
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
              placeholder="Intitulé du devis"
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
            {offers.length === 0 && (
              <small className="form-help" style={{ color: "#dc3545" }}>
                ⚠️ Aucune offre trouvée. Contactez l'administrateur.
              </small>
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
            <label htmlFor="documents">Documents</label>
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
            {formData.document && (
              <div className="file-info">
                <small>Fichier sélectionné: {formData.document}</small>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "En cours..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Modal pour voir les détails d'un devis
const DevisViewModal = ({ isOpen, onClose, devis, etats }) => {
  if (!isOpen) return null;

  const getEtatColor = (etat) => {
    // Chercher la couleur dans les états chargés dynamiquement
    const status = etats.find((s) => s.nom === etat);
    if (status) {
      return status.couleur;
    }

    // Couleurs par défaut pour compatibilité avec les anciens formats
    const defaultColors = {
      Validé: "#28a745",
      "Transformé en facture": "#6c757d",
    };
    return defaultColors[etat] || "#ffc107";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Détails du Devis</h2>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="view-details">
          <div className="detail-group">
            <label>Numéro</label>
            <div className="detail-value">
              {devis.numero_devis || devis.numero || "-"}
            </div>
          </div>

          <div className="detail-group">
            <label>Intitulé</label>
            <div className="detail-value">{devis.intitule || "-"}</div>
          </div>

          <div className="detail-group">
            <label>Client</label>
            <div className="detail-value">
              {devis.client?.raison_sociale || devis.client?.nom || "-"}
            </div>
          </div>

          <div className="detail-group">
            <label>Offre</label>
            <div className="detail-value">
              {devis.offre?.intitulee || devis.offre?.titre || "-"}
            </div>
          </div>

          <div className="detail-group">
            <label>Date d'émission</label>
            <div className="detail-value">
              {devis.date_emission
                ? new Date(devis.date_emission).toLocaleDateString("fr-FR")
                : "-"}
            </div>
          </div>

          <div className="detail-group">
            <label>État</label>
            <div className="detail-value">
              <span
                className="etat-badge"
                style={{
                  backgroundColor: getEtatColor(devis.etat),
                }}
              >
                {devis.etat || "Non défini"}
              </span>
            </div>
          </div>

          {devis.documents && devis.documents.length > 0 && (
            <div className="detail-group">
              <label>Documents</label>
              <div className="detail-value">
                <div className="documents-list">
                  {devis.documents.map((document, index) => {
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

export default DevisPage;
