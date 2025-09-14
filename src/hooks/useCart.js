// import { useState, useEffect } from "react";

// export const useCart = () => {
//   const [recentlyVisited, setRecentlyVisited] = useState([]);

//   // Charger l'historique depuis localStorage
//   useEffect(() => {
//     const savedHistory = localStorage.getItem("aplofr_recently_visited");
//     if (savedHistory) {
//       setRecentlyVisited(JSON.parse(savedHistory));
//     }
//   }, []);

//   // Sauvegarder dans localStorage
//   useEffect(() => {
//     localStorage.setItem(
//       "aplofr_recently_visited",
//       JSON.stringify(recentlyVisited)
//     );
//   }, [recentlyVisited]);

//   const addToRecentlyVisited = (source) => {
//     const visitedItem = {
//       ...source,
//       visitedAt: new Date().toISOString(),
//       visitCount: 1,
//     };

//     setRecentlyVisited((prev) => {
//       const existing = prev.find((item) => item._id === source._id);
//       if (existing) {
//         return prev
//           .map((item) =>
//             item._id === source._id
//               ? {
//                   ...item,
//                   visitedAt: new Date().toISOString(),
//                   visitCount: item.visitCount + 1,
//                 }
//               : item
//           )
//           .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt));
//       } else {
//         return [visitedItem, ...prev].slice(0, 10); // Garder seulement les 10 derniers
//       }
//     });
//   };

//   const clearHistory = () => {
//     setRecentlyVisited([]);
//   };

//   return {
//     recentlyVisited,
//     addToRecentlyVisited,
//     clearHistory,
//   };
// };

import { useState, useEffect } from "react";

export const useCart = () => {
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [cart, setCart] = useState([]); // Panier pour les appels d'offres individuels

  // Charger l'historique et le panier depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("aplofr_recently_visited");
    const savedCart = localStorage.getItem("aplofr_cart");

    if (savedHistory) {
      setRecentlyVisited(JSON.parse(savedHistory));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem(
      "aplofr_recently_visited",
      JSON.stringify(recentlyVisited)
    );
  }, [recentlyVisited]);

  useEffect(() => {
    localStorage.setItem("aplofr_cart", JSON.stringify(cart));
  }, [cart]);

  const addToRecentlyVisited = (source) => {
    const visitedItem = {
      ...source,
      visitedAt: new Date().toISOString(),
      visitCount: 1,
    };

    setRecentlyVisited((prev) => {
      const existing = prev.find((item) => item._id === source._id);
      if (existing) {
        return prev
          .map((item) =>
            item._id === source._id
              ? {
                  ...item,
                  visitedAt: new Date().toISOString(),
                  visitCount: item.visitCount + 1,
                }
              : item
          )
          .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt));
      } else {
        return [visitedItem, ...prev].slice(0, 10);
      }
    });
  };

  // Ajouter un appel d'offres au panier
  const addToCart = (callForTender) => {
    const cartItem = {
      id: Date.now() + Math.random(), // ID unique
      ...callForTender,
      addedAt: new Date().toISOString(),
    };

    setCart((prev) => [...prev, cartItem]);
  };

  // Supprimer un appel d'offres du panier
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
  };

  const clearHistory = () => {
    setRecentlyVisited([]);
  };

  return {
    recentlyVisited,
    cart,
    addToRecentlyVisited,
    addToCart,
    removeFromCart,
    clearCart,
    clearHistory,
  };
};
