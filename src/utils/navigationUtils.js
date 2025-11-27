/**
 * Utilitaires de navigation pour gérer la redirection après création
 */

/**
 * Scroll vers un élément dans la liste et le met en évidence
 * @param {string} elementId - L'ID de l'élément à mettre en évidence
 * @param {number} highlightDuration - Durée du highlight en ms (défaut: 3000)
 */
export const scrollToElement = (elementId, highlightDuration = 3000) => {
  // Attendre un peu pour que le DOM soit mis à jour
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      // Scroll vers l'élément
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Ajouter une classe de highlight
      element.classList.add("highlight-new-item");

      // Retirer le highlight après la durée spécifiée
      setTimeout(() => {
        element.classList.remove("highlight-new-item");
      }, highlightDuration);
    }
  }, 100);
};

/**
 * Scroll vers un élément dans un tableau et le met en évidence
 * @param {string} elementId - L'ID de l'élément
 * @param {string} tableSelector - Sélecteur CSS de la table (défaut: "table")
 * @param {number} highlightDuration - Durée du highlight en ms
 */
export const scrollToTableRow = (
  elementId,
  tableSelector = "table",
  highlightDuration = 3000
) => {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    const table = document.querySelector(tableSelector);

    if (element && table) {
      // Scroll vers la table d'abord
      table.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });

      // Puis scroll vers l'élément dans la table
      setTimeout(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Ajouter le highlight
        element.classList.add("highlight-new-item");

        // Retirer le highlight
        setTimeout(() => {
          element.classList.remove("highlight-new-item");
        }, highlightDuration);
      }, 300);
    }
  }, 100);
};

/**
 * Trouve un élément dans une liste filtrée et scroll vers lui
 * @param {Array} items - Liste des éléments
 * @param {string} itemId - ID de l'élément à trouver
 * @param {Function} getIdFunction - Fonction pour extraire l'ID d'un élément
 * @param {number} highlightDuration - Durée du highlight
 */
export const findAndScrollToItem = (
  items,
  itemId,
  getIdFunction = (item) => item._id || item.id,
  highlightDuration = 3000
) => {
  const item = items.find((i) => getIdFunction(i) === itemId);
  if (item) {
    const elementId = `item-${itemId}`;
    scrollToElement(elementId, highlightDuration);
  }
};

/**
 * Ouvre automatiquement un élément créé (pour les modals)
 * @param {Function} setViewingItem - Fonction pour définir l'élément à afficher
 * @param {Function} setIsViewModalOpen - Fonction pour ouvrir la modal
 * @param {Object} item - L'élément à afficher
 */
export const openCreatedItem = (setViewingItem, setIsViewModalOpen, item) => {
  if (item && setViewingItem && setIsViewModalOpen) {
    setViewingItem(item);
    setIsViewModalOpen(true);
  }
};

/**
 * Combine le scroll et l'ouverture d'un élément
 * @param {Object} options - Options de navigation
 * @param {string} options.itemId - ID de l'élément
 * @param {Array} options.items - Liste des éléments
 * @param {Function} options.setViewingItem - Fonction pour définir l'élément
 * @param {Function} options.setIsViewModalOpen - Fonction pour ouvrir la modal
 * @param {boolean} options.openModal - Si true, ouvre la modal
 * @param {boolean} options.scrollToItem - Si true, scroll vers l'élément
 */
export const navigateToCreatedItem = ({
  itemId,
  items = [],
  setViewingItem = null,
  setIsViewModalOpen = null,
  openModal = false,
  scrollToItem = true,
  highlightDuration = 3000,
}) => {
  if (scrollToItem && itemId) {
    // Essayer de trouver l'élément dans la liste
    if (items.length > 0) {
      findAndScrollToItem(items, itemId, null, highlightDuration);
    } else {
      // Sinon, essayer directement avec l'ID
      scrollToElement(`item-${itemId}`, highlightDuration);
    }
  }

  if (openModal && setViewingItem && setIsViewModalOpen) {
    const item = items.find((i) => (i._id || i.id) === itemId);
    if (item) {
      openCreatedItem(setViewingItem, setIsViewModalOpen, item);
    }
  }
};

const navigationUtils = {
  scrollToElement,
  scrollToTableRow,
  findAndScrollToItem,
  openCreatedItem,
  navigateToCreatedItem,
};

export default navigationUtils;


