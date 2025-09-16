import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const menuItems = [
    {
      id: "home",
      label: "Accueil",
      icon: "fas fa-home",
      path: "/sources",
      description: "Page des sources d'appels d'offres",
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
    onClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo512.png" alt="Logo" className="sidebar-logo-img" />
            <div className="sidebar-logo-text">
              <span className="sidebar-title">Portail des appels d'offres</span>
              <span className="sidebar-subtitle">LEADERTECH-SOLUTIONS</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              // Masquer les éléments admin si l'utilisateur n'est pas admin
              if (item.adminOnly && role !== "admin") {
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

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <i className="fas fa-user-circle"></i>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">
                {localStorage.getItem("name") || "Utilisateur"}
              </span>
              <span className="sidebar-user-role">
                {role === "admin" ? "Administrateur" : "Utilisateur"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

