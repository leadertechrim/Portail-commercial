import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SourcesPage from "./pages/SourcesPage";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import AIOffersPage from "./pages/AIOffersPage";
import ClientsPage from "./pages/ClientsPage";
import PartnersPage from "./pages/PartnersPage";
import PersonnelPage from "./pages/PersonnelPage";
import InstallPrompt from "./components/InstallPrompt";
import { usePWA } from "./hooks/usePWA";
import "./styles/Responsive.css";

export default function App() {
  const { isOnline } = usePWA();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        {!isOnline && (
          <div className="offline-banner">
            <p>
              Mode hors ligne - Certaines fonctionnalités peuvent être limitées
            </p>
          </div>
        )}

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/ai-offers" element={<AIOffersPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>

        <InstallPrompt />
      </div>
    </BrowserRouter>
  );
}
