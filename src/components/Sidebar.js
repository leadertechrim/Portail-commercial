import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [buttonPosition] = useState({
    top: "15px",
    left: "auto",
    right: "15px",
    bottom: "auto",
  });

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      id: "home",
      // label: "Accueil",
      label: "Offres",
      icon: "fas fa-home",
      path: "/sources",
      description: "Page des sources d'appels d'offres",
    },
    {
      id: "ai-offers",
      label: "Offres AI",
      icon: "fas fa-robot",
      path: "/ai-offers",
      description: "Offres d'emploi avec intelligence artificielle",
    },
    {
      id: "cart",
      label: "Mon Panier",
      icon: "fas fa-shopping-basket",
      path: "/cart",
      description: "Gérer mes appels d'offres",
    },
    {
      id: "clients",
      label: "Clients",
      icon: "fas fa-building",
      path: "/clients",
      description: "Gestion des clients",
      adminOnly: true,
    },
    {
      id: "partners",
      label: "Partenaires",
      icon: "fas fa-handshake",
      path: "/partners",
      description: "Gestion des partenaires",
      adminOnly: true,
    },
    {
      id: "personnel",
      label: "Personnels",
      icon: "fas fa-users",
      path: "/personnel",
      description: "Gestion du personnel",
      adminOnly: true,
    },
    {
      id: "users",
      label: "Gestion des utilisateurs",
      icon: "fas fa-users-cog",
      path: "/admin",
      description: "Gérer les comptes utilisateurs",
      adminOnly: true,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Fermer le menu mobile après navigation
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Bouton de menu mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Ouvrir/Fermer le menu"
        style={isMobile ? buttonPosition : {}}
      >
        <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
      </button>

      <div className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo512.png" alt="Logo" className="sidebar-logo-img" />
            <div className="sidebar-logo-text">
              <span className="sidebar-title">Portail des appels d'offres</span>
              <span className="sidebar-subtitle">LEADERTECH-SOLUTIONS</span>
            </div>
          </div>
          {/* Bouton de fermeture mobile - positionné en bas */}
          {isMobileMenuOpen && isMobile && (
            <button
              className="mobile-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              if (item.adminOnly && role !== "admin" && role !== "spectateur") {
                return null;
              }

              return (
                <li key={item.id} className="sidebar-menu-item">
                  <button
                    className={`sidebar-menu-btn ${
                      isActive(item.path) ? "active" : ""
                    }`}
                    onClick={() => handleNavigation(item.path)}
                    title={item.description}
                  >
                    <i className={item.icon}></i>
                    <span className="sidebar-menu-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Section Mon Panier */}
        {/* <div className="sidebar-cart-section">
        <button
          className="sidebar-cart-header"
          onClick={() => navigate("/cart")}
          title="Voir mon panier"
        >
          <i className="fas fa-shopping-basket"></i>
          <span>Mon Panier</span>
          <span className="cart-count">({cart.length})</span>
        </button>
        {cart.length > 0 && (
          <div className="sidebar-cart-actions">
            <button
              className="sidebar-cart-clear"
              onClick={clearCart}
              title="Vider le panier"
            >
              <i className="fas fa-trash"></i>
              Vider
            </button>
          </div>
        )}
      </div> */}

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <i className="fas fa-user-circle"></i>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">
                {localStorage.getItem("name") || "Utilisateur"}
              </span>
              <span className="sidebar-user-role">
                {role === "admin"
                  ? "Administrateur"
                  : role === "spectateur"
                  ? "Spectateur"
                  : "Utilisateur"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
