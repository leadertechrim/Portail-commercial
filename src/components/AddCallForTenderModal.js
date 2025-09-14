import React, { useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import "./AddCallForTenderModal.css";

const AddCallForTenderModal = ({ isOpen, onClose, onAdd, sourceEntity }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    deadline: "",
    value: "",
    category: "Nationale",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.url) {
      onAdd({
        ...formData,
        sourceEntity: sourceEntity.nom_entite,
        sourceUrl: sourceEntity.url,
      });
      setFormData({
        title: "",
        description: "",
        url: "",
        deadline: "",
        value: "",
        category: "Nationale",
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-call-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FaPlus />
            Ajouter un Appel d'Offres
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="source-info">
            <p>
              <strong>Source :</strong> {sourceEntity?.nom_entite}
            </p>
            <p>
              <strong>Site :</strong>{" "}
              <a href={sourceEntity?.url} target="_blank" rel="noreferrer">
                {sourceEntity?.url}
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="call-form">
            <div className="form-group">
              <label>Titre de l'appel d'offres *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Fourniture de matériel informatique"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de l'appel d'offres..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>URL de l'appel d'offres *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date limite</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Valeur estimée</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="Ex: 50 000 €"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Nationale">Nationale</option>
                <option value="Internationale">Internationale</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="add-btn">
                <FaPlus /> Ajouter au Panier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCallForTenderModal;
