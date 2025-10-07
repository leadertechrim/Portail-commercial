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
} from "react-icons/fa";
import { usePermissionsImproved } from "../hooks/usePermissionsImproved";
import {
  PERMISSIONS_MENU,
  PERMISSIONS_SOURCES,
  PERMISSIONS_CLIENTS,
  PERMISSIONS_DEVIS,
  PERMISSIONS_FACTURES,
  PERMISSIONS_CART,
  PERMISSIONS_LINKS,
  PERMISSIONS_ADMIN,
  PERMISSIONS_PARAMETRAGE,
} from "../constants/permissions";
import "./Sidebar.css";

const Sidebar = ({ isOpen, setSelectedMenu, selectedMenu }) => {
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

  const menuStructure = [
    {
      id: "gestionOffres",
      label: "Gestion des offres",
      icon: <FaShoppingBag />,
      children: [
        {
          id: "sources",
          label: "Offres disponibles",
          icon: <FaShoppingCart />,
        },
        { id: "aiOffers", label: "Offres IA", icon: <FaRobot /> },
        { id: "cart", label: "Mon panier", icon: <FaShoppingCart /> },
      ],
    },
    {
      id: "gestionClientele",
      label: "Gestion clientèle",
      icon: <FaUsers />,
      children: [
        { id: "clients", label: "Clients", icon: <FaUsers /> },
        { id: "devis", label: "Devis", icon: <FaFileInvoiceDollar /> },
        { id: "factures", label: "Factures", icon: <FaReceipt /> },
      ],
    },
    {
      id: "gestionRH",
      label: "Gestion des ressources humaines",
      icon: <FaUserTie />,
      children: [
        { id: "personnel", label: "Personnels", icon: <FaUserTie /> },
        { id: "partners", label: "Partenaires", icon: <FaHandshake /> },
      ],
    },
    {
      id: "liensUtiles",
      label: "Liens utiles",
      icon: <FaLink />,
      children: [{ id: "links", label: "Liste des liens", icon: <FaLink /> }],
    },
    {
      id: "parametrage",
      label: "Paramétrage",
      icon: <FaCog />,
      children: [
        { id: "admin", label: "Utilisateurs", icon: <FaUsers /> },
        { id: "roles", label: "Rôles & permissions", icon: <FaCog /> },
        { id: "offerStatus", label: "Statut offre", icon: <FaCog /> },
        { id: "quoteStatus", label: "État devis", icon: <FaCog /> },
        { id: "invoiceStatus", label: "État facture", icon: <FaCog /> },
        { id: "offerCategories", label: "Catégorie offre", icon: <FaCog /> },
        { id: "linkCategories", label: "Catégorie lien", icon: <FaCog /> },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav">
        {menuStructure.map((section) => (
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
                {section.children.map((item) => (
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
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
