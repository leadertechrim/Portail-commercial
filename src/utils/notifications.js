/**
 * Système de notifications pour remplacer les alert()
 * Utilise un système simple de notifications toast
 */

let notificationContainer = null;
let notificationId = 0;

// Créer le conteneur de notifications s'il n'existe pas
const createNotificationContainer = () => {
  if (notificationContainer) return notificationContainer;

  const container = document.createElement('div');
  container.id = 'notification-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
  `;
  document.body.appendChild(container);
  notificationContainer = container;
  return container;
};

// Créer une notification
const createNotification = (message, type = 'info', duration = 5000) => {
  createNotificationContainer();
  
  const id = ++notificationId;
  const notification = document.createElement('div');
  notification.id = `notification-${id}`;
  
  const colors = {
    success: { bg: '#28a745', icon: '✓' },
    error: { bg: '#dc3545', icon: '✕' },
    warning: { bg: '#ffc107', icon: '⚠' },
    info: { bg: '#17a2b8', icon: 'ℹ' },
  };
  
  const color = colors[type] || colors.info;
  
  notification.style.cssText = `
    background: ${color.bg};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    line-height: 1.5;
  `;
  
  // Ajouter l'animation CSS si elle n'existe pas
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  notification.innerHTML = `
    <span style="font-size: 18px; font-weight: bold;">${color.icon}</span>
    <span style="flex: 1;">${message}</span>
    <button 
      onclick="this.parentElement.remove()" 
      style="
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      "
      onmouseover="this.style.background='rgba(255,255,255,0.2)'"
      onmouseout="this.style.background='transparent'"
    >×</button>
  `;
  
  notificationContainer.appendChild(notification);
  
  // Auto-suppression après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
  }
  
  return id;
};

// Fonctions d'export pour différents types de notifications
export const notify = {
  success: (message, duration = 5000) => createNotification(message, 'success', duration),
  error: (message, duration = 7000) => createNotification(message, 'error', duration),
  warning: (message, duration = 6000) => createNotification(message, 'warning', duration),
  info: (message, duration = 5000) => createNotification(message, 'info', duration),
  
  // Pour compatibilité avec alert()
  alert: (message, type = 'info') => {
    createNotification(message, type, 5000);
  },
  
  // Pour compatibilité avec confirm() - retourne une promesse
  confirm: (message) => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  },
};

export default notify;


