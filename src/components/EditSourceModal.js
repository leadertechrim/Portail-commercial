import React, { useState, useEffect } from "react";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./EditSourceModal.css";

const EditSourceModal = ({ isOpen, onClose, source, onSave, onDelete }) => {
  const { hasPermission } = usePermissionsImproved();
  const canDelete = hasPermission("sources_delete");
  
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
        <div className="modal-header" style={{ background: "#f67800", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 14px", minHeight: "80px", borderRadius: "16px 16px 0 0" }}>
          <h3 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.25rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-edit" style={{ fontSize: "1.1rem", opacity: .85 }}></i>
            {source ? "Modifier l'entité" : "Ajouter une entité"}
          </h3>
          <button onClick={onClose} style={{
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

          <div className="modal-actions-enhanced full-width">
            {canDelete && onDelete && source && (
              <button type="button" className="delete-btn-enhanced" onClick={handleDelete} style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "0 20px", borderRadius: "8px", fontWeight: "600", height: "38px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fas fa-trash"></i>
                Supprimer
              </button>
            )}
            <button type="button" onClick={onClose} className="cancel-btn">
              <i className="fas fa-times" style={{ marginRight: 6 }}></i>Annuler
            </button>
            <button type="submit" className="save-btn">
              <i className="fas fa-check" style={{ marginRight: 7 }}></i>Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSourceModal;


