import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./PersonnelPage.css";

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
const PersonnelPage = () => {
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [viewingPersonnel, setViewingPersonnel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const { hasPermission, loading: permissionsLoading } = usePermissionsImproved();
  
  // Permissions spécifiques
  const canView = hasPermission("personnel_view");
  const canCreate = hasPermission("personnel_create");
  const canManage = hasPermission("personnel_manage");

  useEffect(() => {
    if (permissionsLoading) return;
    if (!canView) {
      navigate("/sources");
      return;
    }

    const loadPersonnel = async () => {
      try {
        setLoading(true);
        const data = await fetchPersonnel(token);
        setPersonnel(data);
      } catch (error) {
        console.error("Erreur lors du chargement du personnel:", error);
        alert("Erreur lors du chargement du personnel");
      } finally {
        setLoading(false);
      }
    };
    loadPersonnel();
  }, [token, canView, permissionsLoading, navigate]);

  const handleAddPersonnel = async (personnelData) => {
    try {
      const result = await createPersonnel(personnelData, token);
      if (result.message === "Personnel créé avec succès") {
        setIsAddModalOpen(false);
        const data = await fetchPersonnel(token);
        setPersonnel(data);
        alert("Personnel ajouté avec succès");
      } else {
        alert(result.message || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur lors de l'ajout du personnel");
    }
  };

  const handleEditPersonnel = async (personnelId, personnelData) => {
    try {
      const result = await updatePersonnel(personnelId, personnelData, token);
      if (result.message === "Personnel mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingPersonnel(null);
        const data = await fetchPersonnel(token);
        setPersonnel(data);
        alert("Personnel modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch {
      alert("Erreur lors de la modification du personnel");
    }
  };

  const handleDeletePersonnel = async (personnelId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce personnel ?")) {
      try {
        const result = await deletePersonnel(personnelId, token);
        if (result.message === "Personnel supprimé avec succès") {
          const data = await fetchPersonnel(token);
          setPersonnel(data);
          alert("Personnel supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch {
        alert("Erreur lors de la suppression du personnel");
      }
    }
  };

  const filteredPersonnel = personnel.filter(
    (person) =>
      person.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.Fonction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.telephone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (permissionsLoading || loading) {
    return (
      <div className="personnel-page">
        <div className="loading">
          <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 10, color: "#f67800" }}></i>
          Chargement du personnel…
        </div>
      </div>
    );
  }

  return (
    <div className="personnel-page">
      {/* ══ HEADER ══ */}
      <div className="personnel-header">
        <div className="header-left" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1>
            <i className="fas fa-user-tie" style={{ color: "#f67800", fontSize: "1.1rem" }}></i>
            Gestion du Personnel
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
            {filteredPersonnel.length} personnel{filteredPersonnel.length !== 1 ? "s" : ""}
          </span>

          {canCreate && (
            <button className="add-personnel-btn" onClick={() => setIsAddModalOpen(true)}>
              <i className="fas fa-plus"></i>
              Nouveau Personnel
            </button>
          )}
        </div>
      </div>

      {/* ══ RECHERCHE ══ */}
      <div className="personnel-search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Rechercher un personnel par nom, fonction ou email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#9da8b3", fontSize: ".85rem"
              }}
              title="Effacer"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* ══ TABLE ══ */}
      <div className="personnel-table-container">
        <table className="personnel-table">
          <thead>
            <tr>
              <th><i className="fas fa-user" style={{ marginRight: 6, opacity: .6 }}></i>Nom &amp; Prénom</th>
              <th><i className="fas fa-phone" style={{ marginRight: 6, opacity: .6 }}></i>Téléphone</th>
              <th><i className="fab fa-whatsapp" style={{ marginRight: 6, opacity: .6 }}></i>WhatsApp</th>
              <th><i className="fas fa-envelope" style={{ marginRight: 6, opacity: .6 }}></i>Email</th>
              <th><i className="fas fa-map-marker-alt" style={{ marginRight: 6, opacity: .6 }}></i>Adresse</th>
              <th style={{ textAlign: "right", paddingRight: 24 }}>Gérer</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", padding: "56px 20px",
                    gap: 12
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: "#fff7ed", border: "2px solid #fed7aa",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <i className="fas fa-user-tie" style={{ fontSize: "1.6rem", color: "#f67800" }}></i>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#1a1d21", fontSize: "1rem" }}>
                      {searchTerm ? "Aucun personnel trouvé" : "Aucun personnel enregistré"}
                    </p>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: ".88rem" }}>
                      {searchTerm
                        ? `Aucun résultat pour « ${searchTerm} »`
                        : "Cliquez sur « Nouveau Personnel » pour commencer"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPersonnel.map((person) => (
                <tr key={person._id}>
                  <td>
                    <span style={{ fontWeight: 600, color: "#1a1d21" }}>
                      {person.nom_prenom || "—"}
                    </span>
                  </td>
                  <td>{person.telephone || "—"}</td>
                  <td>{person.whatsapp || "—"}</td>
                  <td>{person.email || "—"}</td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280" }}>
                    {person.adresse || "—"}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="view-btn"
                      onClick={() => { setViewingPersonnel(person); setIsViewModalOpen(true); }}
                      title="Voir les détails"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {canManage && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => { setEditingPersonnel(person); setIsEditModalOpen(true); }}
                          title="Modifier"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePersonnel(person._id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ══ MODALS ══ */}
      {isAddModalOpen && (
        <PersonnelModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPersonnel}
          title="Nouveau Personnel"
        />
      )}
      {isEditModalOpen && editingPersonnel && (
        <PersonnelModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingPersonnel(null); }}
          onSubmit={handleEditPersonnel}
          personnel={editingPersonnel}
          title="Modifier le Personnel"
        />
      )}
      {isViewModalOpen && viewingPersonnel && (
        <PersonnelViewModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setViewingPersonnel(null); }}
          personnel={viewingPersonnel}
          title="Fiche Personnel"
        />
      )}
    </div>
  );
};

const PersonnelModal = ({ isOpen, onClose, onSubmit, personnel, title }) => {
  const [formData, setFormData] = useState({
    nom_prenom: "", Fonction: "", telephone: "",
    whatsapp: "", email: "", adresse: "", note_commentaire: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(personnel ? {
      nom_prenom: personnel.nom_prenom || "",
      Fonction: personnel.Fonction || "",
      telephone: personnel.telephone || "",
      whatsapp: personnel.whatsapp || "",
      email: personnel.email || "",
      adresse: personnel.adresse || "",
      note_commentaire: personnel.note_commentaire || "",
    } : {
      nom_prenom: "", Fonction: "", telephone: "",
      whatsapp: "", email: "", adresse: "", note_commentaire: "",
    });
    setErrors({});
  }, [personnel, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom_prenom.trim()) newErrors.nom_prenom = "Le nom et prénom sont requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format d'email invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      personnel ? await onSubmit(personnel._id, formData) : await onSubmit(formData);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content personnel-modal-enhanced">
        <div className="modal-header" style={{ background: "#f67800" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.15rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 9,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-user-plus" style={{ fontSize: "1rem", opacity: .85 }}></i>
            {title}
          </h2>
          <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", transition: "all .22s"
            }}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-grid" style={{ padding: "30px" }}>
          <div className="form-group full-width">
            <label>Nom &amp; Prénom <span className="required-star">*</span></label>
            <input type="text" name="nom_prenom" value={formData.nom_prenom}
              onChange={handleChange} className={errors.nom_prenom ? "error" : ""}
              placeholder="Nom complet de l'employé" />
            {errors.nom_prenom && <span className="error-message">{errors.nom_prenom}</span>}
          </div>

          <div className="form-group full-width">
            <label>Fonction</label>
            <input type="text" name="Fonction" value={formData.Fonction}
              onChange={handleChange} placeholder="Poste ou titre" />
          </div>

          <div className="form-group">
            <label>Téléphone <span className="required-star">*</span></label>
            <input type="tel" name="telephone" value={formData.telephone}
              onChange={handleChange} className={errors.telephone ? "error" : ""}
              placeholder="+222 XX XX XX XX" />
            {errors.telephone && <span className="error-message">{errors.telephone}</span>}
          </div>

          <div className="form-group">
            <label>WhatsApp</label>
            <input type="tel" name="whatsapp" value={formData.whatsapp}
              onChange={handleChange} placeholder="+222 XX XX XX XX" />
          </div>

          <div className="form-group full-width">
            <label>Email <span className="required-star">*</span></label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} className={errors.email ? "error" : ""}
              placeholder="email@entreprise.com" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group full-width">
            <label>Adresse</label>
            <textarea name="adresse" value={formData.adresse}
              onChange={handleChange} placeholder="Adresse complète" rows="2" />
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PersonnelViewModal = ({ isOpen, onClose, personnel, title }) => {
  if (!isOpen || !personnel) return null;
  const Field = ({ icon, label, value }) => (
    <div className="detail-group">
      <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <i className={`fas fa-${icon}`} style={{ color: "#f67800", fontSize: ".75rem" }}></i>
        {label}
      </label>
      <div className="detail-value">{value || "—"}</div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header" style={{ background: "#f67800" }}>
          <h2 style={{ margin: 0, color: "#ffffff", fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fas fa-id-card" style={{ fontSize: "1rem", opacity: .85 }}></i>
            {title}
          </h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.35)", color: "#ffffff", cursor: "pointer" }}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-form">
          <div className="view-details">
            <Field icon="user" label="Nom & Prénom" value={personnel.nom_prenom} />
            <Field icon="briefcase" label="Fonction" value={personnel.Fonction} />
            <div className="detail-row">
              <Field icon="phone" label="Téléphone" value={personnel.telephone} />
              <Field icon="comments" label="WhatsApp" value={personnel.whatsapp} />
            </div>
            <Field icon="envelope" label="Email" value={personnel.email} />
            <Field icon="map-marker-alt" label="Adresse" value={personnel.adresse} />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              <i className="fas fa-times" style={{ marginRight: 6 }}></i>Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelPage;
