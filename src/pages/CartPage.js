import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  getCartStats,
} from "../api";
import AddCallForTenderModal from "../components/AddCallForTenderModal";
import EditCallForTenderModal from "../components/EditCallForTenderModal";
import Sidebar from "../components/Sidebar";
import "./CartPage.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartStats, setCartStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const loadCartItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [itemsData, statsData] = await Promise.all([
        fetchCartItems(token),
        getCartStats(token),
      ]);

      if (itemsData.message) {
        setError(itemsData.message);
        setCartItems([]);
      } else if (Array.isArray(itemsData)) {
        setCartItems(itemsData);
      } else {
        setError("Format de données inattendu");
        setCartItems([]);
      }

      if (statsData && !statsData.message) {
        setCartStats(statsData);
      } else {
        setCartStats(null);
      }
    } catch (error) {
      setError(`Erreur lors du chargement du panier: ${error.message}`);
      setCartItems([]);
      setCartStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadCartItems();
  }, [navigate, token, loadCartItems]);

  const handleCreateItem = async (itemData) => {
    try {
      const result = await addCartItem(itemData, token);
      if (result.message === "Élément ajouté au panier avec succès") {
        alert("Élément ajouté au panier avec succès !");
        setIsAddModalOpen(false);
        loadCartItems();
      } else {
        alert(result.message || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      alert(`Erreur lors de l'ajout au panier: ${error.message}`);
    }
  };

  const handleUpdateItem = async (itemId, itemData) => {
    try {
      const result = await updateCartItem(itemId, itemData, token);
      if (result.message === "Élément mis à jour avec succès") {
        alert("Élément modifié avec succès !");
        setIsEditModalOpen(false);
        setEditingItem(null);
        loadCartItems();
      } else {
        alert(result.message || "Erreur lors de la modification");
      }
    } catch (error) {
      alert(`Erreur lors de la modification: ${error.message}`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cet élément du panier ?"
      )
    ) {
      try {
        const result = await deleteCartItem(itemId, token);
        if (result.message === "Élément supprimé avec succès") {
          alert("Élément supprimé avec succès !");
          loadCartItems();
        } else {
          alert(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        alert(`Erreur lors de la suppression: ${error.message}`);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getStateColor = (state) => {
    const colors = {
      ouvert: "#28a745",
      en_cours: "#ffc107",
      ferme: "#6c757d",
      attribue: "#17a2b8",
      annule: "#dc3545",
      pending: "#ffc107",
      approved: "#28a745",
      rejected: "#dc3545",
      completed: "#17a2b8",
      cancelled: "#6c757d",
      non_prepare: "#dc3545",
      "Non prépaparé": "#dc3545",
      "non prépaparé": "#dc3545",
      en_preparation: "#ffc107",
      "En préparation": "#ffc107",
      "en préparation": "#ffc107",
      envoyee: "#28a745",
      envoyeé: "#17a2b8",
      envoyée: "#17a2b8",
      Envoyée: "#17a2b8",
      Envoyé: "#17a2b8",
    };
    return colors[state] || "#6c757d";
  };

  const getStateLabel = (state) => {
    const labels = {
      ouvert: "Ouvert",
      en_cours: "En cours",
      ferme: "Fermé",
      attribue: "Attribué",
      annule: "Annulé",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      completed: "Terminé",
      cancelled: "Annulé",
      non_prepare: "Non préparé",
      "Non prépaparé": "Non préparé",
      "non prépaparé": "Non préparé",
      en_preparation: "En préparation",
      "En préparation": "En préparation",
      "en préparation": "En préparation",
      envoyee: "Envoyée",
      envoyeé: "Envoyée",
      envoyée: "Envoyée",
      Envoyée: "Envoyée",
      Envoyé: "Envoyé",
    };
    return labels[state] || state;
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des appels d'offres...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Sidebar />

      <div className="cart-header">
        <div className="cart-header-left">
          <button className="back-btn" onClick={() => navigate("/sources")}>
            <i className="fas fa-arrow-left"></i>
            Retour
          </button>
          {/* <h1>Mon Panier - Appels d'Offres</h1> */}
        </div>
        <div className="cart-header-actions">
          <button
            className="add-offer-btn"
            onClick={() => setIsAddModalOpen(true)}
            title="Ajouter une nouvelle offre"
          >
            <i className="fas fa-plus"></i>
            Ajouter une offre
          </button>
        </div>
      </div>

      <div className="cart-content">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <div className="error-help">
              <small>
                <i className="fas fa-info-circle"></i>
                Si l'erreur persiste, l'application utilise les données des
                appels d'offres comme alternative.
              </small>
            </div>
          </div>
        )}

        {/* {cartStats && (
          <div className="cart-stats">
            <div className="stat-item">
              <span className="stat-label">Total éléments:</span>
              <span className="stat-value">{cartStats.total_items}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Non préparés:</span>
              <span className="stat-value">
                {cartStats.non_prepare_items || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">En préparation:</span>
              <span className="stat-value">
                {cartStats.en_preparation_items || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Envoyées:</span>
              <span className="stat-value">{cartStats.envoyee_items || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">En attente:</span>
              <span className="stat-value">{cartStats.pending_items || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Approuvés:</span>
              <span className="stat-value">
                {cartStats.approved_items || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Terminés:</span>
              <span className="stat-value">
                {cartStats.completed_items || 0}
              </span>
            </div>
            <div className="stat-item total-value">
              <span className="stat-label">Valeur totale:</span>
              <span className="stat-value">
                {cartStats.total_value?.toLocaleString()} MRU
              </span>
            </div>
          </div>
        )} */}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-basket"></i>
            <h3>Panier vide</h3>
            <p>Commencez par ajouter votre premier élément au panier</p>
            <button
              className="add-first-call-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fas fa-plus"></i>
              Ajouter le premier élément
            </button>
          </div>
        ) : (
          <div className="calls-table-container">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Source</th>
                  <th>Pièces jointes</th>
                  <th>Note/Commentaire</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Client</th>
                  <th>Date limite</th>
                  {/* <th>Quantité</th> */}
                  {/* <th>Créé le</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  console.log("Item complet:", item);
                  return (
                    <tr key={item._id}>
                      <td className="call-title">
                        <strong>{item.title}</strong>
                      </td>
                      <td>
                        <span className="type-badge">
                          {item.type || "appel_offre"}
                        </span>
                      </td>
                      <td className="description-cell">
                        {item.description || "-"}
                      </td>
                      <td className="source-cell">
                        {item.source ? (
                          <a
                            href={item.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-link"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            Voir source
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="attachments-cell">
                        {(() => {
                          const attachments =
                            item.pieces_jointes || item.attachments || [];
                          console.log(
                            "Pièces jointes pour l'item:",
                            item.title,
                            attachments
                          );
                          if (attachments && attachments.length > 0) {
                            return (
                              <div className="attachments-list">
                                {attachments.map((attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-link"
                                  >
                                    <i className="fas fa-paperclip"></i>
                                    Pièce {index + 1}
                                  </a>
                                ))}
                              </div>
                            );
                          }
                          return <span style={{ color: "#6c757d" }}>-</span>;
                        })()}
                      </td>
                      <td className="comment-cell">
                        {(() => {
                          const comment =
                            item.Commentaire ||
                            item.commentaire ||
                            item.note ||
                            item.comment ||
                            "";
                          if (comment && comment.trim() !== "") {
                            return (
                              <div className="comment-content">
                                <i
                                  className="fas fa-comment-alt"
                                  style={{
                                    marginRight: "5px",
                                    color: "#f67800",
                                  }}
                                ></i>
                                {comment}
                              </div>
                            );
                          }
                          return <span style={{ color: "#6c757d" }}>-</span>;
                        })()}
                      </td>
                      <td className="price-cell">
                        <span className="price-amount">
                          {item.price
                            ? `${item.price.toLocaleString()} MRU`
                            : "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStateColor(item.status),
                          }}
                        >
                          {getStateLabel(item.status)}
                        </span>
                      </td>
                      <td>{item.client || "-"}</td>
                      <td>{formatDate(item.deadline)}</td>
                      {/* <td className="quantity-cell">
                      <span className="quantity-badge">
                        {item.quantity || 1}
                      </span>
                    </td> */}
                      {/* <td className="date-cell">{formatDate(item.created_at)}</td> */}
                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditItem(item)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteItem(item._id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCallForTenderModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleCreateItem}
      />

      <EditCallForTenderModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        call={editingItem}
        onSave={handleUpdateItem}
      />
    </div>
  );
};

export default CartPage;
