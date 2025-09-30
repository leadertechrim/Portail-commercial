import React, { createContext, useContext, useState, useEffect } from "react";
import useGlobalSearch from "../hooks/useGlobalSearch";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

// Créer un contexte pour la recherche globale
const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

const Layout = ({ children, showSidebar = true }) => {
  const searchHook = useGlobalSearch();

  // États pour le sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initialiser l'état en fonction de la taille d'écran
    return window.innerWidth > 768; // Ouvert sur desktop, fermé sur mobile
  });

  // Détecter la taille de l'écran
  useEffect(() => {
    const handleToggleSidebarEvent = () => {
      setIsSidebarOpen((prev) => !prev);
    };

    window.addEventListener("toggleSidebar", handleToggleSidebarEvent);
    return () => {
      window.removeEventListener("toggleSidebar", handleToggleSidebarEvent);
    };
  }, []);

  // Fonctions pour le sidebar
  const handleToggleSidebar = () => {
    console.log("handleToggleSidebar called! Current state:", isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
    console.log("New state will be:", !isSidebarOpen);
  };

  return (
    <SearchContext.Provider value={searchHook}>
      <div className="layout">
        {/* Sidebar */}
        {showSidebar && <Sidebar isOpen={isSidebarOpen} />}

        {/* Contenu principal */}
        <main
          className={`main-content ${
            isSidebarOpen ? "" : "expanded"
          } page-content`}
        >
          {children}
        </main>
      </div>
    </SearchContext.Provider>
  );
};

export default Layout;
