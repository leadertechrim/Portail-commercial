import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaTrash } from "react-icons/fa";
import "./EditSourceModal.css";

const EditSourceModal = ({ isOpen, onClose, source, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    nom_entite: "",
    url: "",
    categorie: "Nationale",
    order: 1,
  });

  useEffect(() => {
    if (source) {
      setFormData({
        nom_entite: source.nom_entite || "",
        url: source.url || "",
        categorie: source.categorie || "Nationale",
        order: source.order || 1,
      });
    }
  }, [source]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données du formulaire EditSourceModal:", formData);
    console.log("ID de la source:", source._id);
    onSave(source._id, formData);
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entité ?")) {
      onDelete(source._id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier l'entité</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Nom de l'entité</label>
            <input
              type="text"
              value={formData.nom_entite}
              onChange={(e) =>
                setFormData({ ...formData, nom_entite: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <select
              value={formData.categorie}
              onChange={(e) =>
                setFormData({ ...formData, categorie: e.target.value })
              }
            >
              <option value="Nationale">Nationale</option>
              <option value="Internationale">Internationale</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ordre d'affichage</label>
            <input
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 1,
                })
              }
              required
            />
            <small>Les entités sont triées par ordre croissant</small>
          </div>

          <div className="form-actions">
            <button type="button" className="delete-btn" onClick={handleDelete}>
              <FaTrash /> Supprimer
            </button>
            <button type="submit" className="save-btn">
              <FaSave /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSourceModal;
