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
      <div className="modal-content">
        {/* Header orange — titre BLANC GRAND */}
        <div className="modal-header" style={{ background: "#f67800", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 14px", minHeight: "80px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.25rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-plus-circle" style={{ fontSize: "1.1rem", opacity: .85 }}></i>
            Ajouter une Offre
          </h2>
          <button
            onClick={handleClose}
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
            <label htmlFor="intitulee">Intitulé <span className="required-star">*</span></label>
            <input
              type="text"
              id="intitulee"
              name="intitulee"
              value={formData.intitulee}
              onChange={handleChange}
              placeholder="Intitulé de l'offre"
              className={errors.intitulee ? "error" : ""}
            />
            {errors.intitulee && <span className="error-message">{errors.intitulee}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="lien">Lien <span className="required-star">*</span></label>
            <input
              type="url"
              id="lien"
              name="lien"
              value={formData.lien}
              onChange={handleChange}
              placeholder="Lien vers l'offre (ex: https://...)"
              className={errors.lien ? "error" : ""}
            />
            {errors.lien && <span className="error-message">{errors.lien}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="client">Client <span className="required-star">*</span></label>
            <select
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className={errors.client ? "error" : ""}
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client._id} value={client.raison_sociale}>
                  {client.raison_sociale}
                </option>
              ))}
            </select>
            {errors.client && <span className="error-message">{errors.client}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categorie">Catégorie</label>
            <select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="nationale">Nationale</option>
              <option value="internationale">Internationale</option>
            </select>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_limite">Date limite <span className="required-star">*</span></label>
            <input
              type="date"
              id="date_limite"
              name="date_limite"
              value={formData.date_limite}
              onChange={handleChange}
              className={errors.date_limite ? "error" : ""}
            />
            {errors.date_limite && <span className="error-message">{errors.date_limite}</span>}
          </div>

          <div className="form-group">
            <PartnerSelector
              selectedPartners={formData.partenaire}
              onPartnersChange={handlePartnersChange}
              error={errors.partenaire}
            />
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut <span className="required-star">*</span></label>
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
            {errors.statut && <span className="error-message">{errors.statut}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="note_commentaire">Commentaire</label>
            <textarea
              id="note_commentaire"
              name="note_commentaire"
              value={formData.note_commentaire}
              onChange={handleChange}
              placeholder="Commentaire ou notes sur l'offre..."
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label>Documents</label>
            <SimpleFilestackUploader
              multiple={true}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              maxFiles={10}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
            {formData.documents.length > 0 && (
              <div className="uploaded-files-list" style={{ marginTop: "15px" }}>
                {formData.documents.map((file) => (
                  <div key={file.id} className="uploaded-file-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "8px", border: "1px solid #e9ecef" }}>
                    <div className="file-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i className="fas fa-file-pdf" style={{ color: "#ef4444" }}></i>
                      <span className="file-name" style={{ fontSize: "0.85rem", fontWeight: "500" }}>{file.filename}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(file.id)}
                      style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer" }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions-enhanced full-width">
            <button type="button" onClick={handleClose} className="cancel-btn">
              <i className="fas fa-times" style={{ marginRight: 6 }}></i>Annuler
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: 7 }}></i>Création…</>
                : <><i className="fas fa-check" style={{ marginRight: 7 }}></i>Créer l'offre</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCallForTenderModal;
