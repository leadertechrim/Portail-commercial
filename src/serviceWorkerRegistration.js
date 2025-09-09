// frontend/src/serviceWorkerRegistration.js
// Simple service worker registration for offline + PWA install
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) =>
      registration.unregister()
    );
  }
}
