import React, { useState } from "react";
import { usePWA } from "../hooks/usePWA";
import { FaDownload, FaTimes } from "react-icons/fa";
import "./InstallPrompt.css";

const InstallPrompt = () => {
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-text">
          <h4>Installer APLOFR</h4>
          <p>
            Installez l'application pour un accès rapide et une meilleure
            expérience.
          </p>
        </div>
        <div className="install-prompt-actions">
          <button className="install-btn" onClick={installApp}>
            <FaDownload /> Installer
          </button>
          <button className="dismiss-btn" onClick={() => setIsDismissed(true)}>
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
