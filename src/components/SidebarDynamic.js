import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaRobot,
  FaShoppingBag,
  FaUsers,
  FaFileInvoiceDollar,
  FaReceipt,
  FaUserTie,
  FaHandshake,
  FaLink,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaBoxOpen,
  FaUserCog,
  FaFileAlt,
  FaClipboardList,
  FaTags,
  FaFolderOpen,
  FaUserShield,
} from "react-icons/fa";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import "./Sidebar.css";

const SidebarDynamic = ({ isOpen, setSelectedMenu, selectedMenu }) => {
  const {
    hasPermission,
    loading: permissionsLoading,
    permissions,
  } = usePermissionsImproved();

  // Si on a des permissions en cache, afficher le menu même si loading est true
  const hasCachedPermissions = permissions && permissions.length > 0;
  const shouldWaitForPermissions = permissionsLoading && !hasCachedPermissions;

  // Charger l'état des sections depuis localStorage ou utiliser les valeurs par défaut
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem("sidebarExpandedSections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Erreur lors du chargement de l'état du sidebar:", e);
      }
    }
    // Valeurs par défaut : toutes fermées
    return {
      gestionOffres: false,
      gestionClientele: false,
      gestionRH: false,
      liensUtiles: false,
      parametrage: false,
    };
  });

  // Sauvegarder l'état dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(
      "sidebarExpandedSections",
      JSON.stringify(expandedSections)
    );
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      };
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem("sidebarExpandedSections", JSON.stringify(newState));
      return newState;
    });
  };

  // Menu avec permissions intégrées
  const menuConfig = [
    {
      id: "gestionOffres",
      label: "Gestion des offres",
      icon: <FaShoppingBag />,
      permission: ["menu_view_sources", "menu_view_offres_ia"], // Section visible si l'une des permissions est accordée
      children: [
        {
          id: "sources",
          label: "Offres disponibles",
          icon: <FaBoxOpen />,
          permission: "menu_view_sources",
        },
        // {
        //   id: "aiOffers",
        //   label: "Offres IA (ancienne)",
        //   icon: <FaRobot />,
        //   permission: "menu_view_sources",
        // },
        {
          id: "offresIA",
          label: "Offres IA",
          icon: <FaRobot />,
          permission: "menu_view_offres_ia",
        },
        {
          id: "cart",
          label: "Mon panier",
          icon: <FaShoppingCart />,
          permission: "cart_view", // Permission cart_view seule suffit maintenant
        },
      ],
    },
    {
      id: "gestionClientele",
      label: "Gestion clientèle",
      icon: <FaUsers />,
      permission: [
        "menu_view_clients",
        "menu_view_devis",
        "menu_view_factures",
      ],
      children: [
        {
          id: "clients",
          label: "Clients",
          icon: <FaUsers />,
          permission: "menu_view_clients",
        },
        {
          id: "devis",
          label: "Devis",
          icon: <FaFileInvoiceDollar />,
          permission: "menu_view_devis",
        },
        {
          id: "factures",
          label: "Factures",
          icon: <FaReceipt />,
          permission: "menu_view_factures",
        },
      ],
    },
    {
      id: "gestionRH",
      label: "Gestion des ressources humaines",
      icon: <FaUserTie />,
      permission: ["menu_view_personnel", "menu_view_partenaires"], // Permissions menu correctes
      children: [
        {
          id: "personnel",
          label: "Personnels",
          icon: <FaUserCog />,
          permission: "menu_view_personnel",
        },
        {
          id: "partners",
          label: "Partenaires",
          icon: <FaHandshake />,
          permission: "menu_view_partenaires",
        },
      ],
    },
    {
      id: "liensUtiles",
      label: "Liens utiles",
      icon: <FaLink />,
      permission: "menu_view_links",
      children: [
        {
          id: "links",
          label: "Liste des liens",
          icon: <FaLink />,
          permission: "links_view",
        },
      ],
    },
    {
      id: "parametrage",
      label: "Paramétrage",
      icon: <FaCog />,
      permission: "menu_view_admin",
      children: [
        {
          id: "admin",
          label: "Utilisateurs",
          icon: <FaUserShield />,
          permission: "users_manage",
        },
        {
          id: "roles",
          label: "Rôles & permissions",
          icon: <FaUserCog />,
          permission: "roles_manage",
        },
        {
          id: "offerStatus",
          label: "Statut offre",
          icon: <FaFileAlt />,
          permission: "admin_settings",
        },
        {
          id: "quoteStatus",
          label: "État devis",
          icon: <FaClipboardList />,
          permission: "admin_settings",
        },
        {
          id: "invoiceStatus",
          label: "État facture",
          icon: <FaReceipt />,
          permission: "admin_settings",
        },
        {
          id: "offerCategories",
          label: "Catégorie offre",
          icon: <FaTags />,
          permission: "admin_settings",
        },
        {
          id: "linkCategories",
          label: "Catégorie lien",
          icon: <FaFolderOpen />,
          permission: "admin_settings",
        },
      ],
    },
  ];

  // Fonction pour vérifier si une section doit être affichée
  const shouldShowSection = (section) => {
    // Si on attend les permissions et qu'on n'a pas de cache, ne rien afficher
    if (shouldWaitForPermissions) return false;
    if (!section.permission) return true; // Si pas de permission définie, afficher

    // Si c'est un tableau, vérifier qu'au moins une permission est accordée
    if (Array.isArray(section.permission)) {
      return section.permission.some((permission) => hasPermission(permission));
    }

    // Sinon, vérifier la permission unique
    return hasPermission(section.permission);
  };

  // Fonction pour vérifier si un élément de menu doit être affiché
  const shouldShowMenuItem = (item) => {
    // Si on attend les permissions et qu'on n'a pas de cache, ne rien afficher
    if (shouldWaitForPermissions) return false;
    if (!item.permission) return true;
    return hasPermission(item.permission);
  };

  // Debug permissions (en développement)
  React.useEffect(() => {
    if (!permissionsLoading) {
      console.log("🔐 SidebarDynamic - Permissions chargées:");
      console.log("🗂️ Menu visibility check:");

      // Test simple pour voir si les permissions fonctionnent
      console.log("Test permission admin:", hasPermission("admin_settings"));
      console.log(
        "Test permission sources:",
        hasPermission("menu_view_sources")
      );

      menuConfig.forEach((section) => {
        const visible = shouldShowSection(section);
        console.log(`  ${section.label}: ${visible ? "Visible" : "Masqué"}`);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading, hasPermission]);

  return (
    <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
      <div className="sidebar-content">
        <nav className="main-nav">
          {shouldWaitForPermissions
            ? null
            : menuConfig.map((section) => {
                // Ne pas afficher la section si l'utilisateur n'a pas les permissions
                if (!shouldShowSection(section)) {
                  return null;
                }

                return (
                  <div key={section.id} className="menu-section">
                    <div
                      className={`section-header ${selectedMenu === section.id ? "active" : ""}`}
                      onClick={() => {
                        if (section.children && section.children.length > 0) {
                          toggleSection(section.id);
                        } else {
                          setSelectedMenu(section.id);
                        }
                      }}
                    >
                      <span className="section-icon">{section.icon}</span>
                      <span className="section-label">{section.label}</span>
                      {section.children && section.children.length > 0 && (
                        <span className="section-toggle">
                          {expandedSections[section.id] ? (
                            <FaChevronDown />
                          ) : (
                            <FaChevronRight />
                          )}
                        </span>
                      )}
                    </div>
                    {expandedSections[section.id] && (
                      <ul className="section-items">
                        {section.children.map((item) => {
                          // Ne pas afficher l'élément s'il n'a pas les permissions
                          if (!shouldShowMenuItem(item)) {
                            return null;
                          }

                          return (
                            <li
                              key={item.id}
                              className={`menu-item ${
                                selectedMenu === item.id ? "active" : ""
                              }`}
                              onClick={() => setSelectedMenu(item.id)}
                            >
                              <span className="item-icon">{item.icon}</span>
                              <span className="item-label">{item.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
        </nav>
      </div>
    </aside>
  );
};

export default SidebarDynamic;
