import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import "./Header.css";
import logo from "./logo.png";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [userInfo, setUserInfo] = useState({ nom: "", prenom: "", role: "" });
  const profileRef = useRef(null);

  // Charger les informations utilisateur
  useEffect(() => {
    const nomComplet = localStorage.getItem("userName") || "Utilisateur";
    const fonction = localStorage.getItem("userFonction") || "";
    const roleRaw =
      localStorage.getItem("userRole") ||
      localStorage.getItem("role") ||
      "user";

    // Séparer nom et prénom (si le nom contient un espace)
    const parts = nomComplet.trim().split(" ");
    const prenom = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
    const nom = parts.length > 1 ? parts[parts.length - 1] : nomComplet;

    // Priorité : Fonction > Mapping rôle > Par défaut
    let role = fonction;

    if (!role || role === "") {
      // Mapper les rôles vers des fonctions lisibles
      const roleMapping = {
        admin: "Administrateur",
        Admin: "Administrateur",
        SupAdmin: "Super Administrateur",
        supadmin: "Super Administrateur",
        directeur: "Directeur",
        Directeur: "Directeur",
        commercial: "Commercial",
        Commercial: "Commercial",
        comptable: "Comptable",
        Comptable: "Comptable",
        spectateur: "Spectateur",
        Spectateur: "Spectateur",
        user: "Utilisateur",
        User: "Utilisateur",
      };
      role = roleMapping[roleRaw] || roleRaw || "Utilisateur";
    }

    console.log("👤 Infos profil:", { nom, prenom, fonction, roleRaw, role });
    setUserInfo({ nom, prenom, role });
  }, []);

  // Fermer le profil si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
    };

    if (showProfileCard) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileCard]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPrenom");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userFonction");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/loginpage";
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  return (
    <header className="app-header">
      <div className="logo-section">
        <img src={logo} alt="Logo IT Predict" className="logo" />
        <button
          className="menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className="header-icons">
        <div className="profile-container" ref={profileRef}>
          <FaUserCircle
            className="iconP"
            title="Profil"
            onClick={toggleProfileCard}
          />

          {showProfileCard && (
            <div className="profile-card">
              <div className="profile-card-header">
                <FaUserCircle className="profile-avatar" />
              </div>
              <div className="profile-card-body">
                <h4 className="profile-name">
                  {userInfo.prenom
                    ? `${userInfo.prenom} ${userInfo.nom}`
                    : userInfo.nom}
                </h4>
                <p className="profile-role">{userInfo.role || "Utilisateur"}</p>
              </div>
            </div>
          )}
        </div>

        <FaSignOutAlt
          className="iconD"
          title="Déconnexion"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
};

export default Header;
