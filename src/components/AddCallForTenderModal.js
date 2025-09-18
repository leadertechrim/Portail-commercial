import React, { useState } from "react";
import "./AddCallForTenderModal.css";

const AddCallForTenderModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    intitulee: "",
    lien: "",
    client: "",
    statut: "Non préparé",
    note_commentaire: "",
    date_limite: "",
    documents: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
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
      // Convertir le prix en nombre avant l'envoi
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price) || 1,
      };
      console.log("Données du formulaire AddCallForTenderModal:", dataToSend);
      await onSubmit(dataToSend);
      setFormData({
        title: "",
        source: "",
        client: "",
        state: "",
        description: "",
        deadline: "",
        price: "1",
        type: "appel_offre",
        commentaire: "",
        quantity: 1,
        attachments: [],
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
      statut: "Non préparé",
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
            <input
              type="text"
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              placeholder="Nom du client"
              className={errors.client ? "error" : ""}
            />
            {errors.client && (
              <span className="error-message">{errors.client}</span>
            )}
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
              <option value="Non préparé">Non préparé</option>
              <option value="En préparation">En préparation</option>
              <option value="Envoyée">Envoyée</option>
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
            <label htmlFor="note_commentaire">Note/Commentaire</label>
            <textarea
              id="note_commentaire"
              name="note_commentaire"
              value={formData.note_commentaire}
              onChange={handleChange}
              placeholder="Note ou commentaire sur l'offre"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="documents">Documents</label>
            <input
              type="file"
              id="documents"
              name="documents"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            {formData.documents.length > 0 && (
              <div className="attachments-list">
                <h4>Fichiers sélectionnés:</h4>
                {formData.documents.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <i className="fas fa-file"></i>
                    <span>{file.name}</span>
                    <div className="attachment-actions">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(URL.createObjectURL(file), "_blank")
                        }
                        className="open-attachment"
                        title="Ouvrir le document"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = URL.createObjectURL(file);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = file.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="download-attachment"
                        title="Télécharger le document"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="remove-attachment"
                        title="Supprimer le document"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
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
