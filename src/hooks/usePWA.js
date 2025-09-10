import { useState, useEffect } from "react";

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter si l'app est installée
    const checkStandalone = () => {
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true
      );
    };

    // Gestion de l'événement d'installation
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Gestion de la connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Écouter les événements
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    checkStandalone();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Installation ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return {
    isInstallable,
    isOnline,
    isStandalone,
    installApp,
  };
};
