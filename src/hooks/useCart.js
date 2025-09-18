
import { useState, useEffect } from "react";

export const useCart = () => {
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [cart, setCart] = useState([]);

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

  const addToCart = (callForTender) => {
    const cartItem = {
      id: Date.now() + Math.random(),
      ...callForTender,
      addedAt: new Date().toISOString(),
    };

    setCart((prev) => [...prev, cartItem]);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

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
