import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SourcesPage from "./pages/SourcesPage";
import AdminPage from "./pages/AdminPage";
import InstallPrompt from "./components/InstallPrompt";
import { usePWA } from "./hooks/usePWA";
import "./styles/Responsive.css";

export default function App() {
  const { isOnline } = usePWA();

  return (
    <BrowserRouter>
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
          <Route path="*" element={<LoginPage />} />
        </Routes>

        <InstallPrompt />
      </div>
    </BrowserRouter>
  );
}
