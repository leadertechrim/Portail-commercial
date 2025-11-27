import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/SidebarDynamic";
import LoginPage from "./pages/LoginPage";

// Gestion des offres
import SourcesPage from "./pages/SourcesPage";
import AIOffersPage from "./pages/AIOffersPage";
import CartPage from "./pages/CartPage";
import OffresIAPage from "./pages/OffresIAPage";

// Gestion clientèle
import ClientsPage from "./pages/ClientsPage";
import DevisPage from "./pages/DevisPage";
import FacturesPage from "./pages/FacturesPage";

// Gestion RH
import PersonnelPage from "./pages/PersonnelPage";
import PartnersPage from "./pages/PartnersPage";

// Liens utiles
import LinksPage from "./pages/LinksPage";

// Paramétrage
import AdminPage from "./pages/AdminPage";
import RolesPage from "./pages/RolesPage";
import OfferStatusPage from "./pages/OfferStatusPage";
import QuoteStatusPage from "./pages/QuoteStatusPage";
import InvoiceStatusPage from "./pages/InvoiceStatusPage";
import OfferCategoriesPage from "./pages/OfferCategoriesPage";
import LinkCategoriesPage from "./pages/LinkCategoriesPage";

import { NotificationProvider, useNotificationContext } from "./contexts/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import "./App.css";
import "./styles/UnifiedButtons.css";
import "./styles/HighlightNewItem.css";

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("sources");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const { notifications, removeNotification } = useNotificationContext();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Vérifier l'authentification au démarrage et lors des changements
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    // Vérifier immédiatement
    checkAuth();

    // Écouter les changements de storage (pour la synchronisation entre onglets)
    window.addEventListener("storage", checkAuth);

    // Vérifier périodiquement (pour détecter les changements dans le même onglet)
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const MainLayout = () => (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar
        isOpen={isSidebarOpen}
        setSelectedMenu={setSelectedMenu}
        selectedMenu={selectedMenu}
      />
      <main className={`content ${isSidebarOpen ? "shifted" : ""}`}>
        {/* Gestion des offres */}
        {selectedMenu === "sources" && <SourcesPage />}
        {selectedMenu === "aiOffers" && <AIOffersPage />}
        {selectedMenu === "offresIA" && <OffresIAPage />}
        {selectedMenu === "cart" && <CartPage />}

        {/* Gestion clientèle */}
        {selectedMenu === "clients" && <ClientsPage />}
        {selectedMenu === "devis" && <DevisPage />}
        {selectedMenu === "factures" && <FacturesPage />}

        {/* Gestion RH */}
        {selectedMenu === "personnel" && <PersonnelPage />}
        {selectedMenu === "partners" && <PartnersPage />}

        {/* Liens utiles */}
        {selectedMenu === "links" && <LinksPage />}

        {/* Paramétrage */}
        {selectedMenu === "admin" && <AdminPage />}
        {selectedMenu === "roles" && <RolesPage />}
        {selectedMenu === "offerStatus" && <OfferStatusPage />}
        {selectedMenu === "quoteStatus" && <QuoteStatusPage />}
        {selectedMenu === "invoiceStatus" && <InvoiceStatusPage />}
        {selectedMenu === "offerCategories" && <OfferCategoriesPage />}
        {selectedMenu === "linkCategories" && <LinkCategoriesPage />}
      </main>
    </div>
  );

  return (
    <Router>
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
