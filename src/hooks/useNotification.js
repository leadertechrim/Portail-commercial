import { useState, useCallback } from "react";

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    setNotifications((prev) => [...prev, notification]);

    // Retourner l'ID pour permettre la fermeture manuelle si nécessaire
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration) => showNotification(message, "success", duration),
    [showNotification]
  );

  const showError = useCallback(
    (message, duration) => showNotification(message, "error", duration),
    [showNotification]
  );

  const showWarning = useCallback(
    (message, duration) => showNotification(message, "warning", duration),
    [showNotification]
  );

  const showInfo = useCallback(
    (message, duration) => showNotification(message, "info", duration),
    [showNotification]
  );

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };
};


