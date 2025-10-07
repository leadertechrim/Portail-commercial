import React, { useState } from "react";
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
  const { hasPermission, loading: permissionsLoading } =
    usePermissionsImproved();

  const [expandedSections, setExpandedSections] = useState({
    gestionOffres: true,
    gestionClientele: false,
    gestionRH: false,
    liensUtiles: false,
    parametrage: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Menu avec permissions intégrées
  const menuConfig = [
    {
      id: "gestionOffres",
      label: "Gestion des offres",
      icon: <FaShoppingBag />,
      permission: "menu_view_sources", // Permission globale pour la section
      children: [
        {
          id: "sources",
          label: "Offres disponibles",
          icon: <FaBoxOpen />,
          permission: "menu_view_sources",
        },
        {
          id: "aiOffers",
          label: "Offres IA",
          icon: <FaRobot />,
          permission: "menu_view_sources", // Même permission que sources
        },
        {
          id: "cart",
          label: "Mon panier",
          icon: <FaShoppingCart />,
          permission: "menu_view_cart",
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
      ], // Au moins une de ces permissions
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
      permission: ["personnel_view", "partners_view"], // Fallback permissions
      children: [
        {
          id: "personnel",
          label: "Personnels",
          icon: <FaUserCog />,
          permission: "personnel_view",
        },
        {
          id: "partners",
          label: "Partenaires",
          icon: <FaHandshake />,
          permission: "partners_view",
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
          permission: "menu_view_links",
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
    if (permissionsLoading) return false; // Attendre le chargement des permissions
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
    if (permissionsLoading) return false;
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
  }, [permissionsLoading, hasPermission]);

  return (
    <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
      <div className="sidebar-content">
        <nav className="main-nav">
          {menuConfig.map((section) => {
            // Ne pas afficher la section si l'utilisateur n'a pas les permissions
            if (!shouldShowSection(section)) {
              return null;
            }

            return (
              <div key={section.id} className="menu-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-label">{section.label}</span>
                  <span className="section-toggle">
                    {expandedSections[section.id] ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </span>
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
