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
import DevisPage from "./pages/DevisPage";
import FacturesPage from "./pages/FacturesPage";
import LinksPage from "./pages/LinksPage";
import RolesPage from "./pages/RolesPage";
import OfferStatusPage from "./pages/OfferStatusPage";
import QuoteStatusPage from "./pages/QuoteStatusPage";
import InvoiceStatusPage from "./pages/InvoiceStatusPage";
import OfferCategoriesPage from "./pages/OfferCategoriesPage";
import LinkCategoriesPage from "./pages/LinkCategoriesPage";
import SettingsPage from "./pages/SettingsPage";
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
          <Route path="/devis" element={<DevisPage />} />
          <Route path="/factures" element={<FacturesPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/offer-status" element={<OfferStatusPage />} />
          <Route path="/quote-status" element={<QuoteStatusPage />} />
          <Route path="/invoice-status" element={<InvoiceStatusPage />} />
          <Route path="/offer-categories" element={<OfferCategoriesPage />} />
          <Route path="/link-categories" element={<LinkCategoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>

        <InstallPrompt />
      </div>
    </BrowserRouter>
  );
}
