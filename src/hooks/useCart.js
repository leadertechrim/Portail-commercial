import { useState, useEffect } from "react";

export const useCart = () => {
  const [recentlyVisited, setRecentlyVisited] = useState([]);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("aplofr_recently_visited");
    if (savedHistory) {
      setRecentlyVisited(JSON.parse(savedHistory));
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem(
      "aplofr_recently_visited",
      JSON.stringify(recentlyVisited)
    );
  }, [recentlyVisited]);

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
        return [visitedItem, ...prev].slice(0, 10); // Garder seulement les 10 derniers
      }
    });
  };

  const clearHistory = () => {
    setRecentlyVisited([]);
  };

  return {
    recentlyVisited,
    addToRecentlyVisited,
    clearHistory,
  };
};
