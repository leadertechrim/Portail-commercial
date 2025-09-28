import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} from "../api";
import "./PersonnelPage.css";

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
  const role = localStorage.getItem("role");
  const isSpectator = role === "spectateur";

  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        setLoading(true);
        const data = await fetchPersonnel(token);
        console.log("Données personnel reçues:", data);
        setPersonnel(data);
      } catch (error) {
        console.error("Erreur lors du chargement du personnel:", error);
        alert("Erreur lors du chargement du personnel");
      } finally {
        setLoading(false);
      }
    };

    loadPersonnel();
  }, [token]);

  const handleAddPersonnel = async (personnelData) => {
    try {
      const result = await createPersonnel(personnelData, token);
      if (result.message === "Personnel créé avec succès") {
        setIsAddModalOpen(false);
        // Recharger les données
        const data = await fetchPersonnel(token);
        setPersonnel(data);
        alert("Personnel ajouté avec succès");
      } else {
        alert(result.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      alert("Erreur lors de l'ajout du personnel");
    }
  };

  const handleEditPersonnel = async (personnelId, personnelData) => {
    try {
      const result = await updatePersonnel(personnelId, personnelData, token);
      if (result.message === "Personnel mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingPersonnel(null);
        // Recharger les données
        const data = await fetchPersonnel(token);
        setPersonnel(data);
        alert("Personnel modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      alert("Erreur lors de la modification du personnel");
    }
  };

  const handleDeletePersonnel = async (personnelId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce personnel ?")) {
      try {
        const result = await deletePersonnel(personnelId, token);
        if (result.message === "Personnel supprimé avec succès") {
          // Recharger les données
          const data = await fetchPersonnel(token);
          setPersonnel(data);
          alert("Personnel supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
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

  if (loading) {
    return (
      <div className="personnel-page">
        <div className="loading">Chargement du personnel...</div>
      </div>
    );
  }

  return (
    <div className="personnel-page">
      <div className="personnel-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          {/* <h1>Gestion du Personnel</h1> */}
        </div>
        {!isSpectator && (
          <button
            className="add-personnel-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fas fa-plus"></i>
            Ajouter un Personnel
          </button>
        )}
      </div>

      <div className="personnel-search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Rechercher un personnel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="personnel-table-container">
        <table className="personnel-table">
          <thead>
            <tr>
              <th>Nom & Prénom</th>
              <th>Téléphone</th>
              <th>WhatsApp</th>
              <th>Email</th>
              <th>Adresse</th>
              <th>Gérer</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonnel.map((person) => (
              <tr key={person._id}>
                <td>{person.nom_prenom || "-"}</td>
                <td>{person.telephone || "-"}</td>
                <td>{person.whatsapp || "-"}</td>
                <td>{person.email || "-"}</td>
                <td>{person.adresse || "-"}</td>
                <td className="actions-cell">
                  <button
                    className="view-btn"
                    onClick={() => {
                      setViewingPersonnel(person);
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
                          setEditingPersonnel(person);
                          setIsEditModalOpen(true);
                        }}
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePersonnel(person._id)}
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
        <PersonnelModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPersonnel}
          title="Ajouter un Personnel"
        />
      )}

      {isEditModalOpen && editingPersonnel && (
        <PersonnelModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPersonnel(null);
          }}
          onSubmit={handleEditPersonnel}
          personnel={editingPersonnel}
          title="Modifier le Personnel"
        />
      )}

      {isViewModalOpen && viewingPersonnel && (
        <PersonnelViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingPersonnel(null);
          }}
          personnel={viewingPersonnel}
          title="Détails du Personnel"
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/modifier un personnel
const PersonnelModal = ({ isOpen, onClose, onSubmit, personnel, title }) => {
  const [formData, setFormData] = useState({
    nom_prenom: "",
    Fonction: "",
    telephone: "",
    whatsapp: "",
    email: "",
    adresse: "",
    note_commentaire: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personnel) {
      setFormData({
        nom_prenom: personnel.nom_prenom || "",
        Fonction: personnel.Fonction || "",
        telephone: personnel.telephone || "",
        whatsapp: personnel.whatsapp || "",
        email: personnel.email || "",
        adresse: personnel.adresse || "",
        note_commentaire: personnel.note_commentaire || "",
      });
    } else {
      setFormData({
        nom_prenom: "",
        Fonction: "",
        telephone: "",
        whatsapp: "",
        email: "",
        adresse: "",
        note_commentaire: "",
      });
    }
    setErrors({});
  }, [personnel, isOpen]);

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
      if (personnel) {
        await onSubmit(personnel._id, formData);
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
            <label htmlFor="nom_prenom">Nom & Prénom *</label>
            <input
              type="text"
              id="nom_prenom"
              name="nom_prenom"
              value={formData.nom_prenom}
              onChange={handleChange}
              className={errors.nom_prenom ? "error" : ""}
              placeholder="Nom et prénom du personnel"
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

          {/* <div className="form-group">
            <label htmlFor="note_commentaire">Note/Commentaire</label>
            <textarea
              id="note_commentaire"
              name="note_commentaire"
              value={formData.note_commentaire}
              onChange={handleChange}
              placeholder="Notes ou commentaires sur le personnel"
              rows="3"
            />
          </div> */}

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

// Composant Modal pour voir les détails d'un personnel (lecture seule)
const PersonnelViewModal = ({ isOpen, onClose, personnel, title }) => {
  if (!isOpen || !personnel) return null;

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
              <label>Nom & Prénom</label>
              <div className="detail-value">{personnel.nom_prenom || "-"}</div>
            </div>

            <div className="detail-row">
              <div className="detail-group">
                <label>Téléphone</label>
                <div className="detail-value">{personnel.telephone || "-"}</div>
              </div>

              <div className="detail-group">
                <label>WhatsApp</label>
                <div className="detail-value">{personnel.whatsapp || "-"}</div>
              </div>
            </div>

            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value">{personnel.email || "-"}</div>
            </div>

            <div className="detail-group">
              <label>Adresse</label>
              <div className="detail-value">{personnel.adresse || "-"}</div>
            </div>

            {/* <div className="detail-group">
              <label>Note/Commentaire</label>
              <div className="detail-value">
                {personnel.note_commentaire || "-"}
              </div>
            </div> */}
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

export default PersonnelPage;
