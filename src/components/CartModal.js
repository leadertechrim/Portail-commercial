import React from "react";
import {
  FaTimes,
  FaTrash,
  FaExternalLinkAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import "./CartModal.css";

const CartModal = ({ isOpen, onClose, cart, removeFromCart, clearCart }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>
            <i className="fas fa-shopping-basket"></i>
            Mon Panier ({cart.length})
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-basket empty-icon"></i>
              <p>Votre panier est vide</p>
              <span>Ajoutez des appels d'offres pour les suivre</span>
            </div>
          ) : (
            <>
              <div className="cart-actions">
                <button className="clear-btn" onClick={clearCart}>
                  <FaTrash /> Vider le panier
                </button>
              </div>

              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.nom_entite}</h4>
                      <p className="item-category">{item.categorie}</p>
                      <p className="item-date">
                        <FaCalendarAlt /> Ajouté le {formatDate(item.addedAt)}
                      </p>
                    </div>

                    <div className="item-actions">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="visit-btn"
                      >
                        <FaExternalLinkAlt /> Visiter
                      </a>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
