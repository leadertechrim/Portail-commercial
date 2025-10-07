import React from "react";
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import "./Header.css";
import logo from "./logo.png";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/loginpage";
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
        <FaUserCircle className="iconP" title="Profil" />
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
