import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClients, createClient, updateClient, deleteClient } from "../api";
import "./ClientsPage.css";

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isSpectator = role === "spectateur";

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await fetchClients(token);
        console.log("Données clients reçues:", data);
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
        // Recharger les données
        const data = await fetchClients(token);
        setClients(data);
        alert("Client ajouté avec succès");
      } else {
        alert(result.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      alert("Erreur lors de l'ajout du client");
    }
  };

  const handleEditClient = async (clientId, clientData) => {
    try {
      const result = await updateClient(clientId, clientData, token);
      if (result.message === "Client mis à jour avec succès") {
        setIsEditModalOpen(false);
        setEditingClient(null);
        // Recharger les données
        const data = await fetchClients(token);
        setClients(data);
        alert("Client modifié avec succès");
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      alert("Erreur lors de la modification du client");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        const result = await deleteClient(clientId, token);
        if (result.message === "Client supprimé avec succès") {
          // Recharger les données
          const data = await fetchClients(token);
          setClients(data);
          alert("Client supprimé avec succès");
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        alert("Erreur lors de la suppression du client");
      }
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="clients-page">
        <div className="loading">Chargement des clients...</div>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          {/* <h1>Gestion des Clients</h1> */}
        </div>
        {!isSpectator && (
          <button
            className="add-client-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fas fa-plus"></i>
            Ajouter un Client
          </button>
        )}
      </div>

      <div className="clients-search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="clients-table-container">
        <table className="clients-table">
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
            {filteredClients.map((client) => (
              <tr key={client._id}>
                <td>{client.raison_sociale || "-"}</td>
                <td>{client.nom_prenom || "-"}</td>
                <td>{client.telephone || "-"}</td>
                <td>{client.email || "-"}</td>
                <td>{client.whatsapp || "-"}</td>
                <td>{client.adresse || "-"}</td>
                <td className="actions-cell">
                  <button
                    className="view-btn"
                    onClick={() => {
                      setViewingClient(client);
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
                          setEditingClient(client);
                          setIsEditModalOpen(true);
                        }}
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClient(client._id)}
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
        <ClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddClient}
          title="Ajouter un Client"
        />
      )}

      {isEditModalOpen && editingClient && (
        <ClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingClient(null);
          }}
          onSubmit={handleEditClient}
          client={editingClient}
          title="Modifier le Client"
        />
      )}

      {isViewModalOpen && viewingClient && (
        <ClientViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingClient(null);
          }}
          client={viewingClient}
          title="Détails du Client"
        />
      )}
    </div>
  );
};

// Composant Modal pour ajouter/modifier un client
const ClientModal = ({ isOpen, onClose, onSubmit, client, title }) => {
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
    if (client) {
      setFormData({
        raison_sociale: client.raison_sociale || "",
        nom_prenom: client.nom_prenom || "",
        telephone: client.telephone || "",
        whatsapp: client.whatsapp || "",
        email: client.email || "",
        adresse: client.adresse || "",
        note_commentaire: client.note_commentaire || "",
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
  }, [client, isOpen]);

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
      if (client) {
        await onSubmit(client._id, formData);
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
              placeholder="Nom de l'entreprise"
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
              placeholder="Notes ou commentaires sur le client"
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

// Composant Modal pour voir les détails d'un client (lecture seule)
const ClientViewModal = ({ isOpen, onClose, client, title }) => {
  if (!isOpen || !client) return null;

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
              <div className="detail-value">{client.raison_sociale || "-"}</div>
            </div>

            <div className="detail-group">
              <label>Nom & Prénom</label>
              <div className="detail-value">{client.nom_prenom || "-"}</div>
            </div>

            <div className="detail-row">
              <div className="detail-group">
                <label>Téléphone</label>
                <div className="detail-value">{client.telephone || "-"}</div>
              </div>

              <div className="detail-group">
                <label>WhatsApp</label>
                <div className="detail-value">{client.whatsapp || "-"}</div>
              </div>
            </div>

            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value">{client.email || "-"}</div>
            </div>

            <div className="detail-group">
              <label>Adresse</label>
              <div className="detail-value">{client.adresse || "-"}</div>
            </div>

            <div className="detail-group">
              <label>Note/Commentaire</label>
              <div className="detail-value">
                {client.note_commentaire || "-"}
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

export default ClientsPage;
