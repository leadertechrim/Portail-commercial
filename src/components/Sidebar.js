import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [buttonPosition, setButtonPosition] = useState(() => {
    const saved = localStorage.getItem("menuButtonPosition");
    return saved ? JSON.parse(saved) : { top: 25, left: 25 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Charger les états des sections depuis le localStorage ou utiliser les valeurs par défaut
  const [openSections, setOpenSections] = useState(() => {
    const savedSections = localStorage.getItem("sidebarOpenSections");
    if (savedSections) {
      return JSON.parse(savedSections);
    }
    return {
      "Gestion des offres": true, // Section par défaut ouverte
      "Gestion clientèle": true,
      "Gestion des ressources humaines": false,
      "Liens utiles": false,
      Paramétrage: false,
    };
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

  const menuSections = [
    {
      title: "Gestion des offres",
      items: [
        {
          id: "offres-disponibles",
          label: "Offres disponibles",
          icon: "fas fa-home",
          path: "/sources",
          description: "Page des sources d'appels d'offres",
        },
        {
          id: "offres-ia",
          label: "Offres IA",
          icon: "fas fa-robot",
          path: "/ai-offers",
          description: "Offres d'emploi avec intelligence artificielle",
        },
        {
          id: "mon-panier",
          label: "Mon panier",
          icon: "fas fa-shopping-basket",
          path: "/cart",
          description: "Gérer mes appels d'offres",
        },
      ],
    },
    {
      title: "Gestion clientèle",
      items: [
        {
          id: "clients",
          label: "Clients",
          icon: "fas fa-building",
          path: "/clients",
          description: "Gestion des clients",
          adminOnly: true,
        },
        {
          id: "devis",
          label: "Devis",
          icon: "fas fa-file-invoice",
          path: "/devis",
          description: "Gestion des devis",
        },
        {
          id: "factures",
          label: "Factures",
          icon: "fas fa-receipt",
          path: "/factures",
          description: "Gestion des factures",
        },
      ],
    },
    {
      title: "Gestion des ressources humaines",
      adminOnly: true,
      items: [
        {
          id: "personnels",
          label: "Personnels",
          icon: "fas fa-users",
          path: "/personnel",
          description: "Gestion du personnel",
          adminOnly: true,
        },
        {
          id: "partenaires",
          label: "Partenaires",
          icon: "fas fa-handshake",
          path: "/partners",
          description: "Gestion des partenaires",
          adminOnly: true,
        },
      ],
    },
    {
      title: "Liens utiles",
      adminOnly: true,
      items: [
        {
          id: "liens",
          label: "Liste des liens",
          icon: "fas fa-link",
          path: "/links",
          description: "Gestion des liens utiles par catégories",
          adminOnly: true,
        },
      ],
    },
    {
      title: "Paramétrage",
      adminOnly: true,
      items: [
        {
          id: "utilisateurs",
          label: "Utilisateurs",
          icon: "fas fa-users-cog",
          path: "/admin",
          description: "Gérer les comptes utilisateurs",
          adminOnly: true,
        },
        {
          id: "roles-permissions",
          label: "Rôles & permissions",
          icon: "fas fa-shield-alt",
          path: "/roles",
          description: "Gestion des rôles et permissions",
          adminOnly: true,
        },
        {
          id: "statut-offre",
          label: "Statut offre",
          icon: "fas fa-tags",
          path: "/offer-status",
          description: "Gestion des statuts d'offres (Nom & Couleur)",
          adminOnly: true,
        },
        {
          id: "etat-devis",
          label: "État devis",
          icon: "fas fa-clipboard-check",
          path: "/quote-status",
          description: "Gestion des états de devis (Nom & Couleur)",
          adminOnly: true,
        },
        {
          id: "etat-facture",
          label: "État facture",
          icon: "fas fa-file-invoice-dollar",
          path: "/invoice-status",
          description: "Gestion des états de facture (Nom & Couleur)",
          adminOnly: true,
        },
        {
          id: "categorie-offre",
          label: "Catégorie offre",
          icon: "fas fa-folder",
          path: "/offer-categories",
          description: "Gestion des catégories d'offres",
          adminOnly: true,
        },
        {
          id: "categorie-lien",
          label: "Catégorie lien",
          icon: "fas fa-folder-open",
          path: "/link-categories",
          description: "Gestion des catégories de liens",
          adminOnly: true,
        },
      ],
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Fermer le menu mobile après navigation
    setIsMobileMenuOpen(false);
  };

  const toggleSection = (sectionTitle) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [sectionTitle]: !prev[sectionTitle],
      };
      // Sauvegarder l'état dans le localStorage
      localStorage.setItem("sidebarOpenSections", JSON.stringify(newState));
      return newState;
    });
  };

  const toggleMobileMenu = () => {
    if (isMobile) {
      // Sur mobile : toggle normal
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      // Sur grands écrans : utiliser la prop isOpen
      // Le toggle sera géré par le composant parent (Layout)
      window.dispatchEvent(new CustomEvent("toggleSidebar"));
    }
  };

  // Fonctions de drag & drop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - buttonPosition.left,
      y: e.clientY - buttonPosition.top,
    });
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - buttonPosition.left,
      y: touch.clientY - buttonPosition.top,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newLeft = e.clientX - dragStart.x;
    const newTop = e.clientY - dragStart.y;

    // Limiter aux limites de l'écran
    const maxLeft = window.innerWidth - 50; // 50px = largeur du bouton
    const maxTop = window.innerHeight - 50; // 50px = hauteur du bouton

    const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const constrainedTop = Math.max(0, Math.min(newTop, maxTop));

    setButtonPosition({ left: constrainedLeft, top: constrainedTop });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newLeft = touch.clientX - dragStart.x;
    const newTop = touch.clientY - dragStart.y;

    // Limiter aux limites de l'écran
    const maxLeft = window.innerWidth - 50;
    const maxTop = window.innerHeight - 50;

    const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const constrainedTop = Math.max(0, Math.min(newTop, maxTop));

    setButtonPosition({ left: constrainedLeft, top: constrainedTop });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Sauvegarder la position
      localStorage.setItem(
        "menuButtonPosition",
        JSON.stringify(buttonPosition)
      );
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      // Sauvegarder la position
      localStorage.setItem(
        "menuButtonPosition",
        JSON.stringify(buttonPosition)
      );
    }
  };

  // Ajouter les event listeners pour le drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Bouton de menu mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        aria-label="Ouvrir/Fermer le menu (glisser pour déplacer)"
        style={{
          position: "fixed",
          top: `${buttonPosition.top}px`,
          left: `${buttonPosition.left}px`,
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: 1002,
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
      </button>

      <div
        className={`sidebar ${
          isMobile
            ? isMobileMenuOpen
              ? "mobile-open"
              : ""
            : isOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo512.png" alt="Logo" className="sidebar-logo-img" />
            <div className="sidebar-logo-text">
              <span className="sidebar-title">
                Plateforme de gestion commerciale
              </span>
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
          {menuSections.map((section, sectionIndex) => {
            // Filtrer les sections entières selon le rôle
            if (
              section.adminOnly &&
              role !== "admin" &&
              role !== "spectateur"
            ) {
              return null;
            }

            return (
              <div key={sectionIndex} className="sidebar-section">
                <button
                  className="sidebar-section-header"
                  onClick={() => toggleSection(section.title)}
                >
                  <h3 className="sidebar-section-title">{section.title}</h3>
                  <i
                    className={`fas fa-chevron-${
                      openSections[section.title] ? "up" : "down"
                    } sidebar-section-toggle`}
                  ></i>
                </button>
                {openSections[section.title] && (
                  <ul className="sidebar-menu">
                    {section.items.map((item) => {
                      if (
                        item.adminOnly &&
                        role !== "admin" &&
                        role !== "spectateur"
                      ) {
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
                            <span className="sidebar-menu-label">
                              {item.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
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
