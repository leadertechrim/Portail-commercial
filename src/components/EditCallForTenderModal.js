import React, { useState, useEffect } from "react";
import "./EditCallForTenderModal.css";

const EditCallForTenderModal = ({ isOpen, onClose, call, onSave }) => {
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (call) {
      setFormData({
        title: call.title || "",
        source: call.source || "",
        client: call.client || "",
        state: call.state || "",
        description: call.description || "",
        deadline: call.deadline || "",
        price: call.price || "1",
        type: call.type || "appel_offre",
        commentaire: call.Commentaire || call.commentaire || "",
        quantity: call.quantity || 1,
        attachments: call.attachments || [],
      });
    }
  }, [call]);

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
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    }
    if (!formData.source.trim()) {
      newErrors.source = "La source est requise";
    }
    if (!formData.client.trim()) {
      newErrors.client = "Le client est requis";
    }
    if (!formData.state.trim()) {
      newErrors.state = "Le statut est requis";
    }
    if (!formData.deadline.trim()) {
      newErrors.deadline = "La date limite est requise";
    }
    if (!formData.type.trim()) {
      newErrors.type = "Le type est requis";
    }
    if (!formData.price || formData.price === "") {
      newErrors.price = "Le prix est requis";
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0 || priceNum < 0.01) {
        newErrors.price = "Le prix doit être un nombre positif (minimum 0.01)";
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
      console.log("Données du formulaire EditCallForTenderModal:", dataToSend);
      await onSave(call._id, dataToSend);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-call-modal">
        <div className="modal-header">
          <h2>Modifier l'Appel d'Offres</h2>
          <button className="modal-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-call-form">
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre de l'appel d'offres"
              className={errors.title ? "error" : ""}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="source">Source *</label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Source de l'appel d'offres"
              className={errors.source ? "error" : ""}
            />
            {errors.source && (
              <span className="error-message">{errors.source}</span>
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
            <label htmlFor="state">Statut *</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={errors.state ? "error" : ""}
            >
              <option value="">Sélectionner un état</option>
              <option value="en_preparation">En préparation</option>
              <option value="envoyee">Envoyée</option>
              <option value="non_prepare">Non préparé</option>
            </select>
            {errors.state && (
              <span className="error-message">{errors.state}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Date limite *</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={errors.deadline ? "error" : ""}
            />
            {errors.deadline && (
              <span className="error-message">{errors.deadline}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de l'appel d'offres"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Prix *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Prix en MRU"
              min="0.01"
              step="0.01"
              className={errors.price ? "error" : ""}
            />
            {errors.price && (
              <span className="error-message">{errors.price}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? "error" : ""}
            >
              <option value="">Sélectionner un type</option>
              <option value="appel_offre">Appel d'offres</option>
              <option value="consultation">Consultation</option>
              <option value="marché">Marché</option>
              <option value="prestation">Prestation</option>
            </select>
            {errors.type && (
              <span className="error-message">{errors.type}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="commentaire">Commentaire</label>
            <textarea
              id="commentaire"
              name="commentaire"
              value={formData.commentaire}
              onChange={handleChange}
              placeholder="Commentaire ou note sur l'appel d'offres"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="attachments">Nouvelles pièces jointes</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            {formData.attachments.length > 0 && (
              <div className="attachments-list">
                <h4>Fichiers sélectionnés:</h4>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <i className="fas fa-file"></i>
                    <span>{file.filename || file.name}</span>
                    <div className="attachment-actions">
                      <button
                        type="button"
                        onClick={() => {
                          if (file.file) {
                            window.open(
                              URL.createObjectURL(file.file),
                              "_blank"
                            );
                          } else if (file.url) {
                            window.open(file.url, "_blank");
                          }
                        }}
                        className="open-attachment"
                        title="Ouvrir le document"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (file.file) {
                            const url = URL.createObjectURL(file.file);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = file.filename || file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } else if (file.url) {
                            const a = document.createElement("a");
                            a.href = file.url;
                            a.download = file.filename || file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
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
                  Modification...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Modifier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCallForTenderModal;
