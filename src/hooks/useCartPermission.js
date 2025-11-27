import { useState, useEffect } from "react";
import { checkCartViewPermission } from "../api";

/**
 * Hook personnalisé pour vérifier si l'utilisateur peut voir le menu panier
 * Utilise la nouvelle route /api/panier/can-view du backend
 * 
 * @returns {Object} Objet contenant :
 *   - canView: boolean - Si l'utilisateur peut voir le menu panier
 *   - hasCartView: boolean - Si l'utilisateur a la permission cart_view
 *   - hasCartViewAll: boolean - Si l'utilisateur a la permission cart_view_all
 *   - loading: boolean - Si la vérification est en cours
 *   - error: string|null - Message d'erreur éventuel
 */
export const useCartPermission = () => {
  const [canView, setCanView] = useState(false);
  const [hasCartView, setHasCartView] = useState(false);
  const [hasCartViewAll, setHasCartViewAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setCanView(false);
        setHasCartView(false);
        setHasCartViewAll(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await checkCartViewPermission(token);
        
        setCanView(result.can_view || false);
        setHasCartView(result.has_cart_view || false);
        setHasCartViewAll(result.has_cart_view_all || false);
      } catch (err) {
        console.error("Erreur lors de la vérification de la permission panier:", err);
        setError(err.message);
        setCanView(false);
        setHasCartView(false);
        setHasCartViewAll(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, []);

  return {
    canView,
    hasCartView,
    hasCartViewAll,
    loading,
    error,
  };
};

export default useCartPermission;


