import { useState, useCallback } from "react";

const useGlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setIsSearching(true);

    // Simuler une recherche (à remplacer par votre logique de recherche réelle)
    setTimeout(() => {
      // Ici vous pouvez implémenter votre logique de recherche
      // Par exemple, rechercher dans les sources, clients, etc.
      console.log("Recherche pour:", query);
      setSearchResults([]);
      setIsSearching(false);
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    handleSearch,
    clearSearch,
  };
};

export default useGlobalSearch;
