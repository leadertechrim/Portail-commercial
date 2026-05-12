import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "../api";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./PartnersPage.css";

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
const PartnersPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [viewingPartner, setViewingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const { hasPermission, loading: permissionsLoading } = usePermissionsImproved();
  
  // Permissions spécifiques
  const canView = hasPermission("partners_view");
  const canCreate = hasPermission("partners_create");
  const canManage = hasPermission("partners_manage");

  useEffect(() => {
    if (permissionsLoading) return;
    if (!canView) {
      navigate("/sources");
      return;
    }

    const loadPartners = async () => {
      try {
        setLoading(true);
        const data = await fetchPartners(token);
        setPartners(data);
      } catch (error) {
        console.error("Erreur lors du chargement des partenaires:", error);
        alert("Erreur lors du chargement des partenaires");
      } finally {
        setLoading(false);
      }
    };
    loadPartners();
  }, [token, canView, permissionsLoading, navigate]);

  const handleAddPartner = async (partnerData) => {
    try {
      const result = await createPartner(partnerData, token);
      if (result.message === "Partenaire créé avec succès") {
        setIsAddModalOpen(false);
        const data = await fetchPartners(token);
        setPartners(data);
        alert("Partenaire ajouté avec succès");
      } else {
        alert(result.message || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur lors de l'ajout du partenaire");
    }
  };

  const handleEditPartner = async (partnerId, partnerData) => {
    try {
      const result = await updatePartner(partnerId, partnerData, token);
      if (result.message === "Partenaire mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingPartner(null);
        const data = await fetchPartners(token);
        setPartners(data);
        alert("Partenaire modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch {
      alert("Erreur lors de la modification du partenaire");
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      try {
        const result = await deletePartner(partnerId, token);
        if (result.message === "Partenaire supprimé avec succès") {
          const data = await fetchPartners(token);
          setPartners(data);
          alert("Partenaire supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch {
        alert("Erreur lors de la suppression du partenaire");
      }
    }
  };

  const filteredPartners = partners.filter((partner) =>
    partner.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (permissionsLoading || loading) {
    return (
      <div className="partners-page">
        <div className="loading">
          <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 10, color: "#f67800" }}></i>
          Chargement des partenaires…
        </div>
      </div>
    );
  }

  return (
    <div className="partners-page">
      {/* ══ HEADER ══ */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ height: "36px", minWidth: "unset", padding: "0 14px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <i className="fas fa-handshake" style={{ color: "#f67800", fontSize: "1rem" }}></i>
            Partenaires
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Compteur */}
          <span style={{
            fontSize: ".75rem", fontWeight: 600,
            color: "#6b7280", background: "#f8f9fa",
            border: "1px solid #e2e8f0", borderRadius: 20,
            padding: "4px 12px"
          }}>
            {filteredPartners.length} partenaire{filteredPartners.length !== 1 ? "s" : ""}
          </span>

          {canCreate && (
            <button className="add-partner-btn" onClick={() => setIsAddModalOpen(true)} style={{ height: "36px", fontSize: "0.82rem" }}>
              <i className="fas fa-plus"></i>
              Nouveau Partenaire
            </button>
          )}
        </div>
      </div>

      {/* ══ RECHERCHE ══ */}
      <div className="partners-search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Rechercher un partenaire par nom ou email…"
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
      <div className="partners-table-container">
        <table className="partners-table">
          <thead style={{ background: "#f67800", color: "white" }}>
            <tr>
              <th style={{ color: "white" }}><i className="fas fa-building" style={{ marginRight: 6, opacity: .8 }}></i>Raison Sociale</th>
              <th style={{ color: "white" }}><i className="fas fa-user" style={{ marginRight: 6, opacity: .8 }}></i>Nom &amp; Prénom</th>
              <th style={{ color: "white" }}><i className="fas fa-phone" style={{ marginRight: 6, opacity: .8 }}></i>Téléphone</th>
              <th style={{ color: "white" }}><i className="fas fa-envelope" style={{ marginRight: 6, opacity: .8 }}></i>Email</th>
              <th style={{ color: "white" }}><i className="fab fa-whatsapp" style={{ marginRight: 6, opacity: .8 }}></i>WhatsApp</th>
              <th style={{ color: "white" }}><i className="fas fa-map-marker-alt" style={{ marginRight: 6, opacity: .8 }}></i>Adresse</th>
              <th style={{ textAlign: "right", paddingRight: 24, color: "white" }}>Gérer</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.length === 0 ? (
              <tr>
                <td colSpan={7}>
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
                      <i className="fas fa-handshake" style={{ fontSize: "1.6rem", color: "#f67800" }}></i>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#1a1d21", fontSize: "1rem" }}>
                      {searchTerm ? "Aucun partenaire trouvé" : "Aucun partenaire enregistré"}
                    </p>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: ".88rem" }}>
                      {searchTerm
                        ? `Aucun résultat pour « ${searchTerm} »`
                        : "Cliquez sur « Nouveau Partenaire » pour commencer"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPartners.map((partner) => (
                <tr key={partner._id} id={`item-${partner._id}`}>
                  <td>
                    <span style={{ fontWeight: 600, color: "#1a1d21" }}>
                      {partner.raison_sociale || "—"}
                    </span>
                  </td>
                  <td>{partner.nom_prenom || "—"}</td>
                  <td>
                    {partner.telephone
                      ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <i className="fas fa-phone" style={{ color: "#f67800", fontSize: ".75rem" }}></i>
                          {partner.telephone}
                        </span>
                      : "—"}
                  </td>
                  <td>
                    {partner.email
                      ? <a href={`mailto:${partner.email}`} style={{ color: "#f67800", textDecoration: "none", fontSize: ".88rem" }}>
                          {partner.email}
                        </a>
                      : "—"}
                  </td>
                  <td>{partner.whatsapp || "—"}</td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280" }}>
                    {partner.adresse || "—"}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="view-btn"
                      onClick={() => { setViewingPartner(partner); setIsViewModalOpen(true); }}
                      title="Voir les détails"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {canManage && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => { setEditingPartner(partner); setIsEditModalOpen(true); }}
                          title="Modifier"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePartner(partner._id)}
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
        <PartnerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPartner}
          title="Nouveau Partenaire"
        />
      )}
      {isEditModalOpen && editingPartner && (
        <PartnerModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingPartner(null); }}
          onSubmit={handleEditPartner}
          partner={editingPartner}
          title="Modifier le Partenaire"
        />
      )}
      {isViewModalOpen && viewingPartner && (
        <PartnerViewModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setViewingPartner(null); }}
          partner={viewingPartner}
          title="Fiche Partenaire"
        />
      )}
    </div>
  );
};

const PartnerModal = ({ isOpen, onClose, onSubmit, partner, title }) => {
  const [formData, setFormData] = useState({
    raison_sociale: "", nom_prenom: "", telephone: "",
    whatsapp: "", email: "", adresse: "", note_commentaire: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(partner ? {
      raison_sociale: partner.raison_sociale || "",
      nom_prenom: partner.nom_prenom || "",
      telephone: partner.telephone || "",
      whatsapp: partner.whatsapp || "",
      email: partner.email || "",
      adresse: partner.adresse || "",
      note_commentaire: partner.note_commentaire || "",
    } : {
      raison_sociale: "", nom_prenom: "", telephone: "",
      whatsapp: "", email: "", adresse: "", note_commentaire: "",
    });
    setErrors({});
  }, [partner, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.raison_sociale.trim()) newErrors.raison_sociale = "La raison sociale est requise";
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
      partner ? await onSubmit(partner._id, formData) : await onSubmit(formData);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content partner-modal-enhanced">
        <div className="modal-header" style={{ background: "#f67800", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 14px", minHeight: "80px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.25rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-handshake" style={{ fontSize: "1.1rem", opacity: .85 }}></i>
            {title}
          </h2>
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

        <form onSubmit={handleSubmit} className="modal-form-grid" style={{ padding: "30px" }}>
          <div className="form-group full-width">
            <label>Raison Sociale <span className="required-star">*</span></label>
            <input type="text" name="raison_sociale" value={formData.raison_sociale}
              onChange={handleChange} className={errors.raison_sociale ? "error" : ""}
              placeholder="Nom de l'entreprise partenaire" />
            {errors.raison_sociale && <span className="error-message">{errors.raison_sociale}</span>}
          </div>

          <div className="form-group full-width">
            <label>Nom &amp; Prénom du Contact <span className="required-star">*</span></label>
            <input type="text" name="nom_prenom" value={formData.nom_prenom}
              onChange={handleChange} className={errors.nom_prenom ? "error" : ""}
              placeholder="Nom complet du contact" />
            {errors.nom_prenom && <span className="error-message">{errors.nom_prenom}</span>}
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
              placeholder="contact@partenaire.com" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group full-width">
            <label>Adresse</label>
            <textarea name="adresse" value={formData.adresse}
              onChange={handleChange} placeholder="Adresse complète" rows="2" />
          </div>

          <div className="form-group full-width">
            <label>Description (Notes)</label>
            <textarea name="note_commentaire" value={formData.note_commentaire}
              onChange={handleChange} placeholder="Commentaires ou notes…" rows="2" />
          </div>

          <div className="modal-actions-enhanced full-width">
            <button type="button" onClick={onClose} className="cancel-btn">
              <i className="fas fa-times" style={{ marginRight: 6 }}></i>Annuler
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: 7 }}></i>Enregistrement…</>
                : <><i className="fas fa-check" style={{ marginRight: 7 }}></i>Enregistrer</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PartnerViewModal = ({ isOpen, onClose, partner, title }) => {
  if (!isOpen || !partner) return null;
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
        <div className="modal-header" style={{ background: "#f67800", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 14px", minHeight: "80px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.25rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-id-card" style={{ fontSize: "1.1rem", opacity: .85 }}></i>
            {title}
          </h2>
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
        <div className="modal-form">
          <div className="view-details">
            <Field icon="building" label="Raison Sociale" value={partner.raison_sociale} />
            <Field icon="user" label="Nom & Prénom" value={partner.nom_prenom} />
            <div className="detail-row">
              <Field icon="phone" label="Téléphone" value={partner.telephone} />
              <Field icon="comments" label="WhatsApp" value={partner.whatsapp} />
            </div>
            <Field icon="envelope" label="Email" value={partner.email} />
            <Field icon="map-marker-alt" label="Adresse" value={partner.adresse} />
            <Field icon="sticky-note" label="Note/Commentaire" value={partner.note_commentaire} />
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

export default PartnersPage;
