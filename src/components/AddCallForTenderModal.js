import React, { useState, useEffect } from "react";
import "./AddCallForTenderModal.css";
import { fetchClients } from "../api";
import PartnerSelector from "./PartnerSelector";
import SimpleFilestackUploader from "./SimpleFilestackUploader";
import "./SimpleFilestackUploader.css";

const AddCallForTenderModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    intitulee: "",
    lien: "",
    client: "",
    categorie: "",
    numero: "",
    partenaire: [],
    statut: "Non préparée",
    note_commentaire: "",
    date_limite: "",
    documents: [],
    numero_devis: "",
    numero_facture: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [offerStatuses, setOfferStatuses] = useState([]);

  // Charger la liste des clients et des statuts d'offres
  useEffect(() => {
    const loadClients = async () => {
      const token = localStorage.getItem("token");
      console.log(
        "🔍 AddCallForTenderModal - Chargement des clients, token:",
        token ? "Présent" : "Absent"
      );
      if (token) {
        try {
          const clientsData = await fetchClients(token);
          console.log("🔍 AddCallForTenderModal - Clients reçus:", clientsData);
          setClients(clientsData);
        } catch (error) {
          console.error(
            "🔍 AddCallForTenderModal - Erreur lors du chargement des clients:",
            error
          );
        }
      }
    };

    const loadOfferStatuses = () => {
      try {
        const savedStatuses = localStorage.getItem("offerStatuses");
        if (savedStatuses) {
          const statuses = JSON.parse(savedStatuses);
          console.log(
            "📋 Statuts d'offres chargés dans AddCallForTenderModal:",
            statuses
          );
          setOfferStatuses(statuses);
        } else {
          const defaultStatuses = [
            { nom: "Non préparée", couleur: "#dc3545" },
            { nom: "En préparation", couleur: "#ffc107" },
            { nom: "Envoyée", couleur: "#28a745" },
            { nom: "Clôturée", couleur: "#6c757d" },
          ];
          setOfferStatuses(defaultStatuses);
        }
      } catch (err) {
        console.error(
          "❌ Erreur lors du chargement des statuts d'offres:",
          err
        );
        setOfferStatuses([
          { nom: "Non préparée", couleur: "#dc3545" },
          { nom: "En préparation", couleur: "#ffc107" },
          { nom: "Envoyée", couleur: "#28a745" },
          { nom: "Clôturée", couleur: "#6c757d" },
        ]);
      }
    };

    if (isOpen) {
      loadClients();
      loadOfferStatuses();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePartnersChange = (selectedPartners) => {
    setFormData((prev) => ({
      ...prev,
      partenaire: selectedPartners,
    }));
    if (errors.partenaire) {
      setErrors((prev) => ({
        ...prev,
        partenaire: "",
      }));
    }
  };

  const handleUploadComplete = (files) => {
    console.log("✅ Fichiers uploadés avec succès:", files);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const handleUploadError = (error) => {
    console.error("❌ Erreur upload:", error);
    alert("Erreur lors de l'upload: " + error.message);
  };

  const removeDocument = (fileId) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== fileId),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.intitulee.trim()) {
      newErrors.intitulee = "L'intitulé est requis";
    }
    if (!formData.lien.trim()) {
      newErrors.lien = "Le lien est requis";
    }
    if (!formData.client.trim()) {
      newErrors.client = "Le client est requis";
    }
    if (!formData.statut.trim()) {
      newErrors.statut = "Le statut est requis";
    }
    if (!formData.date_limite.trim()) {
      newErrors.date_limite = "La date limite est requise";
    } else {
      const deadlineDate = new Date(formData.date_limite);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.date_limite = "La date limite ne peut pas être dans le passé";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour le backend avec seulement les URLs
      const dataToSend = {
        ...formData,
        // Le backend attend les clés originales et les mappe automatiquement
        Catégorie: formData.categorie,
        "N-Offre": formData.numero,
        Partenaire: Array.isArray(formData.partenaire)
          ? formData.partenaire.join(", ")
          : formData.partenaire,
        price: parseFloat(formData.price) || 1,
        // Envoyer seulement les URLs des documents
        documents: formData.documents.map((doc) => doc.url),
      };

      console.log(
        "🚀 AddCallForTenderModal - Données du formulaire:",
        dataToSend
      );
      console.log(
        "🚀 AddCallForTenderModal - URLs des documents:",
        dataToSend.documents
      );
      await onSubmit(dataToSend);
      setFormData({
        intitulee: "",
        lien: "",
        client: "",
        categorie: "",
        numero: "",
        partenaire: "",
        statut: "Non préparée",
        note_commentaire: "",
        date_limite: "",
        documents: [],
      });
      setErrors({});
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      intitulee: "",
      lien: "",
      client: "",
      categorie: "",
      numero: "",
      partenaire: [],
      statut: "Non préparée",
      note_commentaire: "",
      date_limite: "",
      documents: [],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-call-modal">
        <div className="modal-header">
          <h2>Ajouter une Offre</h2>
          <button className="modal-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-call-form">
          <div className="form-group">
            <label htmlFor="intitulee">Intitulé *</label>
            <input
              type="text"
              id="intitulee"
              name="intitulee"
              value={formData.intitulee}
              onChange={handleChange}
              placeholder="Intitulé de l'offre"
              className={errors.intitulee ? "error" : ""}
            />
            {errors.intitulee && (
              <span className="error-message">{errors.intitulee}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lien">Lien *</label>
            <input
              type="url"
              id="lien"
              name="lien"
              value={formData.lien}
              onChange={handleChange}
              placeholder="Lien vers l'offre"
              className={errors.lien ? "error" : ""}
            />
            {errors.lien && (
              <span className="error-message">{errors.lien}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="client">Client *</label>
            <select
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className={errors.client ? "error" : ""}
            >
              <option value="">Sélectionner un client</option>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <option key={client._id} value={client.raison_sociale}>
                    {client.raison_sociale}
                  </option>
                ))
              ) : (
                <option disabled>Aucun client disponible</option>
              )}
            </select>
            {errors.client && (
              <span className="error-message">{errors.client}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="categorie">Catégorie</label>
            <select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className={errors.categorie ? "error" : ""}
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="nationale">Nationale</option>
              <option value="internationale">Internationale</option>
            </select>
            {errors.categorie && (
              <span className="error-message">{errors.categorie}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="numero">N-Offre</label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Numéro de l'offre"
              className={errors.numero ? "error" : ""}
            />
            {errors.numero && (
              <span className="error-message">{errors.numero}</span>
            )}
          </div>

          <div className="form-group">
            <PartnerSelector
              selectedPartners={formData.partenaire}
              onPartnersChange={handlePartnersChange}
              error={errors.partenaire}
            />
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut *</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className={errors.statut ? "error" : ""}
            >
              <option value="">Sélectionner un statut</option>
              {offerStatuses.map((status) => (
                <option key={status._id || status.nom} value={status.nom}>
                  {status.nom}
                </option>
              ))}
            </select>
            {errors.statut && (
              <span className="error-message">{errors.statut}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date_limite">Date limite *</label>
            <input
              type="date"
              id="date_limite"
              name="date_limite"
              value={formData.date_limite}
              onChange={handleChange}
              className={errors.date_limite ? "error" : ""}
            />
            {errors.date_limite && (
              <span className="error-message">{errors.date_limite}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="note_commentaire">Commentaire</label>
            <textarea
              id="note_commentaire"
              name="note_commentaire"
              value={formData.note_commentaire}
              onChange={handleChange}
              placeholder="Commentaire sur l'offre"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="documents">Documents</label>
            <SimpleFilestackUploader
              multiple={true}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              maxFiles={10}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
            {formData.documents.length > 0 && (
              <div className="uploaded-files-list">
                <h4>Fichiers uploadés ({formData.documents.length}):</h4>
                {formData.documents.map((file) => (
                  <div key={file.id} className="uploaded-file-item">
                    <div className="file-info">
                      <i className="fas fa-file"></i>
                      <div className="file-details">
                        <span className="file-name">{file.filename}</span>
                        <span className="file-url">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Voir le fichier
                          </a>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(file.id)}
                      className="remove-file-btn"
                      title="Supprimer le fichier"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            {/* <button
              type="button"
              onClick={handleClose}
              className="cancel-btn"
              disabled={loading}
            >
              <i className="fas fa-times"></i>
              Annuler
            </button> */}
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Ajout...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Créer l'offre
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCallForTenderModal;
