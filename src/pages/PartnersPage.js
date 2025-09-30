import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "../api";
import Layout from "../components/Layout";
import "./PartnersPage.css";

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
  const role = localStorage.getItem("role");
  const isSpectator = role === "spectateur";

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const data = await fetchPartners(token);
        console.log("Données partenaires reçues:", data);
        setPartners(data);
      } catch (error) {
        console.error("Erreur lors du chargement des partenaires:", error);
        alert("Erreur lors du chargement des partenaires");
      } finally {
        setLoading(false);
      }
    };

    loadPartners();
  }, [token]);

  const handleAddPartner = async (partnerData) => {
    try {
      const result = await createPartner(partnerData, token);
      if (result.message === "Partenaire créé avec succès") {
        setIsAddModalOpen(false);
        // Recharger les données
        const data = await fetchPartners(token);
        setPartners(data);
        alert("Partenaire ajouté avec succès");
      } else {
        alert(result.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      alert("Erreur lors de l'ajout du partenaire");
    }
  };

  const handleEditPartner = async (partnerId, partnerData) => {
    try {
      const result = await updatePartner(partnerId, partnerData, token);
      if (result.message === "Partenaire mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingPartner(null);
        // Recharger les données
        const data = await fetchPartners(token);
        setPartners(data);
        alert("Partenaire modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      alert("Erreur lors de la modification du partenaire");
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      try {
        const result = await deletePartner(partnerId, token);
        if (result.message === "Partenaire supprimé avec succès") {
          // Recharger les données
          const data = await fetchPartners(token);
          setPartners(data);
          alert("Partenaire supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        alert("Erreur lors de la suppression du partenaire");
      }
    }
  };

  const filteredPartners = partners.filter(
    (partner) =>
      partner.raison_sociale
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      partner.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="partners-page">
          <div className="loading">Chargement des partenaires...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="partners-page">
        <div className="partners-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
              Retour
            </button>
            {/* <h1>Gestion des Partenaires</h1> */}
          </div>
          {!isSpectator && (
            <button
              className="add-partner-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fas fa-plus"></i>
              Ajouter un Partenaire
            </button>
          )}
        </div>

        <div className="partners-search">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="partners-table-container">
          <table className="partners-table">
            <thead>
              <tr>
                <th>Raison Sociale</th>
                <th>Nom & Prénom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Adresse</th>
                <th>Gérer</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner._id}>
                  <td>{partner.raison_sociale || "-"}</td>
                  <td>{partner.nom_prenom || "-"}</td>
                  <td>{partner.telephone || "-"}</td>
                  <td>{partner.email || "-"}</td>
                  <td>{partner.whatsapp || "-"}</td>
                  <td>{partner.adresse || "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="view-btn"
                      onClick={() => {
                        setViewingPartner(partner);
                        setIsViewModalOpen(true);
                      }}
                      title="Voir les détails"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {!isSpectator && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingPartner(partner);
                            setIsEditModalOpen(true);
                          }}
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePartner(partner._id)}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAddModalOpen && (
          <PartnerModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddPartner}
            title="Ajouter un Partenaire"
          />
        )}

        {isEditModalOpen && editingPartner && (
          <PartnerModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingPartner(null);
            }}
            onSubmit={handleEditPartner}
            partner={editingPartner}
            title="Modifier le Partenaire"
          />
        )}

        {isViewModalOpen && viewingPartner && (
          <PartnerViewModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewingPartner(null);
            }}
            partner={viewingPartner}
            title="Détails du Partenaire"
          />
        )}
      </div>
    </Layout>
  );
};

// Composant Modal pour ajouter/modifier un partenaire
const PartnerModal = ({ isOpen, onClose, onSubmit, partner, title }) => {
  const [formData, setFormData] = useState({
    raison_sociale: "",
    nom_prenom: "",
    telephone: "",
    whatsapp: "",
    email: "",
    adresse: "",
    note_commentaire: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData({
        raison_sociale: partner.raison_sociale || "",
        nom_prenom: partner.nom_prenom || "",
        telephone: partner.telephone || "",
        whatsapp: partner.whatsapp || "",
        email: partner.email || "",
        adresse: partner.adresse || "",
        note_commentaire: partner.note_commentaire || "",
      });
    } else {
      setFormData({
        raison_sociale: "",
        nom_prenom: "",
        telephone: "",
        whatsapp: "",
        email: "",
        adresse: "",
        note_commentaire: "",
      });
    }
    setErrors({});
  }, [partner, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.raison_sociale.trim()) {
      newErrors.raison_sociale = "La raison sociale est requise";
    }

    if (!formData.nom_prenom.trim()) {
      newErrors.nom_prenom = "Le nom et prénom sont requis";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
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
      if (partner) {
        await onSubmit(partner._id, formData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="raison_sociale">Raison Sociale *</label>
            <input
              type="text"
              id="raison_sociale"
              name="raison_sociale"
              value={formData.raison_sociale}
              onChange={handleChange}
              className={errors.raison_sociale ? "error" : ""}
              placeholder="Nom de l'entreprise partenaire"
            />
            {errors.raison_sociale && (
              <span className="error-message">{errors.raison_sociale}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nom_prenom">Nom & Prénom *</label>
            <input
              type="text"
              id="nom_prenom"
              name="nom_prenom"
              value={formData.nom_prenom}
              onChange={handleChange}
              className={errors.nom_prenom ? "error" : ""}
              placeholder="Nom et prénom du contact"
            />
            {errors.nom_prenom && (
              <span className="error-message">{errors.nom_prenom}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telephone">Téléphone *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={errors.telephone ? "error" : ""}
                placeholder="Numéro de téléphone"
              />
              {errors.telephone && (
                <span className="error-message">{errors.telephone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="Numéro WhatsApp"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Adresse email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="adresse">Adresse</label>
            <textarea
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Adresse complète"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note_commentaire">Note/Commentaire</label>
            <textarea
              id="note_commentaire"
              name="note_commentaire"
              value={formData.note_commentaire}
              onChange={handleChange}
              placeholder="Notes ou commentaires sur le partenaire"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant Modal pour voir les détails d'un partenaire (lecture seule)
const PartnerViewModal = ({ isOpen, onClose, partner, title }) => {
  if (!isOpen || !partner) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-form">
          <div className="view-details">
            <div className="detail-group">
              <label>Raison Sociale</label>
              <div className="detail-value">
                {partner.raison_sociale || "-"}
              </div>
            </div>

            <div className="detail-group">
              <label>Nom & Prénom</label>
              <div className="detail-value">{partner.nom_prenom || "-"}</div>
            </div>

            <div className="detail-row">
              <div className="detail-group">
                <label>Téléphone</label>
                <div className="detail-value">{partner.telephone || "-"}</div>
              </div>

              <div className="detail-group">
                <label>WhatsApp</label>
                <div className="detail-value">{partner.whatsapp || "-"}</div>
              </div>
            </div>

            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value">{partner.email || "-"}</div>
            </div>

            <div className="detail-group">
              <label>Adresse</label>
              <div className="detail-value">{partner.adresse || "-"}</div>
            </div>

            <div className="detail-group">
              <label>Note/Commentaire</label>
              <div className="detail-value">
                {partner.note_commentaire || "-"}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
