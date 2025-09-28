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
import Sidebar from "../components/Sidebar";
import SimpleFilestackUploader from "../components/SimpleFilestackUploader";
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
  const role = localStorage.getItem("role");
  const isSpectator = role === "spectateur";

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
      console.log("📋 Factures chargées:", data);

      // Vérifier si data est un tableau ou un objet avec une propriété data
      const facturesData = Array.isArray(data)
        ? data
        : data.data || data.factures || [];

      // Enrichir les factures avec les détails complets des clients et offres
      const enrichedFactures = facturesData.map((facture) => {
        const client = clients.find((c) => c._id === facture.client_id);
        const offre = offers.find((o) => o._id === facture.offre_id);

        // Debug: Vérifier les documents
        console.log(
          `🔍 Facture ${facture.numero_facture} - Documents:`,
          facture.document || facture.documents
        );

        return {
          ...facture,
          client: client || { raison_sociale: "Client inconnu" },
          offre: offre || { intitulee: "Offre inconnue" },
          // Normaliser les documents (peuvent être dans 'document' ou 'documents')
          documents: facture.document || facture.documents || [],
        };
      });

      console.log("📋 Factures enrichies:", enrichedFactures);
      setFactures(enrichedFactures);
      setError("");
    } catch (err) {
      console.error("❌ Erreur lors du chargement des factures:", err);
      setError(`Erreur lors du chargement des factures: ${err.message}`);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  }, [token, clients, offers]);

  const generateNumeroFacture = useCallback(
    (clientId, offreId) => {
      console.log(
        "🔍 Génération numéro facture - clientId:",
        clientId,
        "offreId:",
        offreId
      );
      console.log("🔍 Clients disponibles:", clients);
      console.log("🔍 Offres disponibles:", offers);

      if (!clientId || !offreId) {
        console.log("❌ clientId ou offreId manquant");
        return "";
      }

      const client = clients.find((c) => c._id === clientId);
      const offre = offers.find((o) => o._id === offreId);

      console.log("🔍 Client trouvé:", client);
      console.log("🔍 Offre trouvée:", offre);

      if (!client || !offre) {
        console.log("❌ Client ou offre non trouvé");
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

      const numeroGenere = `Fac_${nomClient}_${nomOffre}`;
      console.log("✅ Numéro généré:", numeroGenere);

      return numeroGenere;
    },
    [clients, offers]
  );

  const loadOffersAndClients = useCallback(async () => {
    try {
      console.log(
        "🔄 Chargement des offres, clients, utilisateurs, personnel et états..."
      );
      const [offersData, clientsData, usersData, personnelData, etatsData] =
        await Promise.all([
          fetchOffers(token),
          fetchClients(token),
          fetchUsers(token),
          fetchPersonnel(token),
          fetchFacturesEtats(token),
        ]);

      console.log("📋 Offres chargées:", offersData);
      console.log("👥 Clients chargés:", clientsData);
      console.log("👤 Utilisateurs chargés:", usersData);
      console.log("👥 Personnel chargé:", personnelData);
      console.log("📊 États chargés:", etatsData);

      // Filtrer les offres pour les utilisateurs simples
      let filteredOffers = Array.isArray(offersData) ? offersData : [];
      if (role === "user") {
        const currentUserId = localStorage.getItem("userId");
        filteredOffers = filteredOffers.filter(
          (offre) =>
            offre.responsable_id === currentUserId ||
            offre.user_id === currentUserId ||
            offre.created_by === currentUserId
        );
        console.log(
          "🔍 Offres filtrées pour l'utilisateur simple:",
          filteredOffers
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
        console.log("🔄 Utilisation des états par défaut pour les factures");
        setEtats(["A envoyer au client", "En attente de payement", "Payée"]);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      // Valeurs par défaut en cas d'erreur
      setOffers([]);
      setClients([]);
      setUsers([]);
      setPersonnel([]);
      setEtats(["A envoyer au client", "En attente de payement", "Payée"]);
    }
  }, [token, role]);

  useEffect(() => {
    if (role !== "admin" && role !== "spectateur" && role !== "user") {
      navigate("/sources");
      return;
    }
    // Charger d'abord les clients et offres, puis les factures
    loadOffersAndClients();
    // Charger les états de factures dynamiques
    loadInvoiceStatuses();
  }, [navigate, role, loadOffersAndClients, loadInvoiceStatuses]);

  // Synchronisation périodique avec l'API Flask
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Synchronisation périodique des états de factures...");
      loadInvoiceStatuses();
    }, 5000); // Vérification toutes les 5 secondes

    return () => {
      clearInterval(interval);
    };
  }, [loadInvoiceStatuses]);

  useEffect(() => {
    // Charger les factures seulement après avoir chargé les clients et offres
    if (clients.length > 0 && offers.length > 0) {
      loadFactures();
    }
  }, [clients, offers, loadFactures]);

  const filteredFactures = factures.filter(
    (facture) =>
      facture.numero_facture
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      facture.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.intitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.etat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Sidebar />
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
      <Sidebar />

      <div className="main-content">
        <div className="factures-header">
          <div className="factures-header-left">
            <h1>Gestion des Factures</h1>
          </div>
          <div className="factures-header-actions">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {!isSpectator && (
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
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Section de debug temporaire */}

          {filteredFactures.length === 0 ? (
            <div className="empty-factures">
              <i className="fas fa-receipt"></i>
              <h3>Aucune facture trouvée</h3>
              <p>Commencez par créer votre première facture</p>
            </div>
          ) : (
            <div className="factures-table-container">
              <table className="factures-table">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Intitulé</th>
                    <th>Client</th>
                    <th>Offre</th>
                    <th>Date d'émission</th>
                    <th>État</th>
                    <th>Documents</th>
                    {role === "admin" && <th>Responsable</th>}
                    <th>Gérer</th>
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
                      {role === "admin" && (
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
                        <div className="actions">
                          <button
                            className="view-btn"
                            onClick={() => openViewModal(facture)}
                            title="Voir les détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {!isSpectator && (
                            <>
                              <button
                                className="edit-btn"
                                onClick={() => openEditModal(facture)}
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteFacture(facture._id)}
                                title="Supprimer"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </>
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
      console.log(
        "🔍 Génération numéro facture - clientId:",
        clientId,
        "offreId:",
        offreId
      );
      console.log("🔍 Clients disponibles:", clients);
      console.log("🔍 Offres disponibles:", offers);

      if (!clientId || !offreId) {
        console.log("❌ clientId ou offreId manquant");
        return "";
      }

      const client = clients.find((c) => c._id === clientId);
      const offre = offers.find((o) => o._id === offreId);

      console.log("🔍 Client trouvé:", client);
      console.log("🔍 Offre trouvée:", offre);

      if (!client || !offre) {
        console.log("❌ Client ou offre non trouvé");
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

      const numeroGenere = `Fac_${nomClient}_${nomOffre}`;
      console.log("✅ Numéro généré:", numeroGenere);

      return numeroGenere;
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
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
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
