import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClients, createClient, updateClient, deleteClient } from "../api";
import PermissionGuard from "../components/PermissionGuard";
import { navigateToCreatedItem } from "../utils/navigationUtils";
import "./ClientsPage.css";
import "../styles/HighlightNewItem.css";

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingClient, setEditingClient]     = useState(null);
  const [viewingClient, setViewingClient]     = useState(null);
  const [searchTerm, setSearchTerm]           = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await fetchClients(token);
        setClients(data);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        alert("Erreur lors du chargement des clients");
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, [token]);

  const handleAddClient = async (clientData) => {
    try {
      const result = await createClient(clientData, token);
      if (result.message === "Client créé avec succès") {
        setIsAddModalOpen(false);
        const data = await fetchClients(token);
        setClients(data);
        alert("Client ajouté avec succès");
        const clientId = result.client?._id || result._id || result.id;
        if (clientId) {
          setTimeout(() => {
            navigateToCreatedItem({
              itemId: clientId,
              items: data,
              scrollToItem: true,
              highlightDuration: 3000,
            });
          }, 500);
        }
      } else {
        alert(result.message || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur lors de l'ajout du client");
    }
  };

  const handleEditClient = async (clientId, clientData) => {
    try {
      const result = await updateClient(clientId, clientData, token);
      if (result.message === "Client mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingClient(null);
        const data = await fetchClients(token);
        setClients(data);
        alert("Client modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch {
      alert("Erreur lors de la modification du client");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        const result = await deleteClient(clientId, token);
        if (result.message === "Client supprimé avec succès") {
          const data = await fetchClients(token);
          setClients(data);
          alert("Client supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch {
        alert("Erreur lors de la suppression du client");
      }
    }
  };

  const filteredClients = clients.filter((client) =>
    client.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="clients-page">
        <div className="loading">
          <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 10, color: "#f67800" }}></i>
          Chargement des clients…
        </div>
      </div>
    );
  }

  return (
    <div className="clients-page">

      {/* ══ HEADER ══ */}
      <div className="clients-header">
        <div className="header-left" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          <h1>
            <i className="fas fa-users" style={{ color: "#f67800", fontSize: "1.1rem" }}></i>
            Gestion des Clients
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
            {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
          </span>

          <PermissionGuard permission="clients_create" fallback={null}>
            <button className="add-client-btn" onClick={() => setIsAddModalOpen(true)}>
              <i className="fas fa-plus"></i>
              Nouveau Client
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* ══ RECHERCHE ══ */}
      <div className="clients-search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Rechercher par raison sociale, nom ou email…"
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
      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th><i className="fas fa-building" style={{ marginRight: 6, opacity: .6 }}></i>Raison Sociale</th>
              <th><i className="fas fa-user" style={{ marginRight: 6, opacity: .6 }}></i>Nom &amp; Prénom</th>
              <th><i className="fas fa-phone" style={{ marginRight: 6, opacity: .6 }}></i>Téléphone</th>
              <th><i className="fas fa-envelope" style={{ marginRight: 6, opacity: .6 }}></i>Email</th>
              <th><i className="fab fa-whatsapp" style={{ marginRight: 6, opacity: .6 }}></i>WhatsApp</th>
              <th><i className="fas fa-map-marker-alt" style={{ marginRight: 6, opacity: .6 }}></i>Adresse</th>
              <th style={{ textAlign: "right", paddingRight: 24 }}>Gérer</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
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
                      <i className="fas fa-users" style={{ fontSize: "1.6rem", color: "#f67800" }}></i>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#1a1d21", fontSize: "1rem" }}>
                      {searchTerm ? "Aucun client trouvé" : "Aucun client enregistré"}
                    </p>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: ".88rem" }}>
                      {searchTerm
                        ? `Aucun résultat pour « ${searchTerm} »`
                        : "Cliquez sur « Nouveau Client » pour commencer"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id} id={`item-${client._id}`}>
                  <td>
                    <span style={{ fontWeight: 600, color: "#1a1d21" }}>
                      {client.raison_sociale || "—"}
                    </span>
                  </td>
                  <td>{client.nom_prenom || "—"}</td>
                  <td>
                    {client.telephone
                      ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <i className="fas fa-phone" style={{ color: "#f67800", fontSize: ".75rem" }}></i>
                          {client.telephone}
                        </span>
                      : "—"}
                  </td>
                  <td>
                    {client.email
                      ? <a href={`mailto:${client.email}`} style={{ color: "#f67800", textDecoration: "none", fontSize: ".88rem" }}>
                          {client.email}
                        </a>
                      : "—"}
                  </td>
                  <td>{client.whatsapp || "—"}</td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280" }}>
                    {client.adresse || "—"}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="view-btn"
                      onClick={() => { setViewingClient(client); setIsViewModalOpen(true); }}
                      title="Voir les détails"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <PermissionGuard permission="clients_edit" fallback={null}>
                      <button
                        className="edit-btn"
                        onClick={() => { setEditingClient(client); setIsEditModalOpen(true); }}
                        title="Modifier"
                      >
                        <i className="fas fa-pen"></i>
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="clients_delete" fallback={null}>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClient(client._id)}
                        title="Supprimer"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </PermissionGuard>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ══ MODALS ══ */}
      {isAddModalOpen && (
        <ClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddClient}
          title="Nouveau Client"
        />
      )}
      {isEditModalOpen && editingClient && (
        <ClientModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingClient(null); }}
          onSubmit={handleEditClient}
          client={editingClient}
          title="Modifier le Client"
        />
      )}
      {isViewModalOpen && viewingClient && (
        <ClientViewModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setViewingClient(null); }}
          client={viewingClient}
          title="Fiche Client"
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   MODAL AJOUTER / MODIFIER
══════════════════════════════════════════ */
const ClientModal = ({ isOpen, onClose, onSubmit, client, title }) => {
  const [formData, setFormData] = useState({
    raison_sociale: "", nom_prenom: "", telephone: "",
    whatsapp: "", email: "", adresse: "", note_commentaire: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(client ? {
      raison_sociale:   client.raison_sociale   || "",
      nom_prenom:       client.nom_prenom        || "",
      telephone:        client.telephone         || "",
      whatsapp:         client.whatsapp          || "",
      email:            client.email             || "",
      adresse:          client.adresse           || "",
      note_commentaire: client.note_commentaire  || "",
    } : {
      raison_sociale: "", nom_prenom: "", telephone: "",
      whatsapp: "", email: "", adresse: "", note_commentaire: "",
    });
    setErrors({});
  }, [client, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.raison_sociale.trim()) newErrors.raison_sociale = "La raison sociale est requise";
    if (!formData.nom_prenom.trim())     newErrors.nom_prenom     = "Le nom et prénom sont requis";
    if (!formData.telephone.trim())      newErrors.telephone      = "Le téléphone est requis";
    if (!formData.email.trim())          newErrors.email          = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format d'email invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      client ? await onSubmit(client._id, formData) : await onSubmit(formData);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content client-modal-enhanced">

        {/* Header orange — titre BLANC GRAND */}
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
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", transition: "all .22s",
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="modal-form-grid">

          <div className="form-group full-width">
            <label>Raison Sociale <span className="required-star">*</span></label>
            <input type="text" name="raison_sociale" value={formData.raison_sociale}
              onChange={handleChange} className={errors.raison_sociale ? "error" : ""}
              placeholder="Nom de l'entreprise" />
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
              placeholder="contact@entreprise.com" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group full-width">
            <label>Adresse</label>
            <textarea name="adresse" value={formData.adresse}
              onChange={handleChange} placeholder="Adresse complète" rows="2" />
          </div>

          <div className="form-group full-width">
            <label>Notes &amp; Commentaires</label>
            <textarea name="note_commentaire" value={formData.note_commentaire}
              onChange={handleChange} placeholder="Informations complémentaires…" rows="2" />
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

/* ══════════════════════════════════════════
   MODAL VUE DÉTAILS (lecture seule)
══════════════════════════════════════════ */
const ClientViewModal = ({ isOpen, onClose, client, title }) => {
  if (!isOpen || !client) return null;

  const Field = ({ icon, label, value, isLink }) => (
    <div className="detail-group">
      <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon && <i className={`fas fa-${icon}`} style={{ color: "#f67800", fontSize: ".75rem" }}></i>}
        {label}
      </label>
      <div className="detail-value">
        {isLink && value
          ? <a href={`mailto:${value}`} style={{ color: "#f67800", textDecoration: "none" }}>{value}</a>
          : (value || "—")}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        {/* Header orange — titre BLANC GRAND */}
        <div className="modal-header" style={{ background: "#f67800" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.15rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 9,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className="fas fa-id-card" style={{ fontSize: "1rem", opacity: .85 }}></i>
            {title}
          </h2>
          <button
            onClick={onClose}
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

        <div className="modal-form">
          <div className="view-details">
            <Field icon="building"       label="Raison Sociale"       value={client.raison_sociale} />
            <Field icon="user"           label="Nom & Prénom"          value={client.nom_prenom} />
            <div className="detail-row">
              <Field icon="phone"        label="Téléphone"   value={client.telephone} />
              <Field icon="comments"     label="WhatsApp"    value={client.whatsapp} />
            </div>
            <Field icon="envelope"       label="Email"                value={client.email} isLink />
            <Field icon="map-marker-alt" label="Adresse"              value={client.adresse} />
            <Field icon="sticky-note"   label="Notes / Commentaires" value={client.note_commentaire} />
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

export default ClientsPage;
