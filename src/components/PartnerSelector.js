import React, { useState, useEffect } from "react";
import { fetchPartners } from "../api";
import "./PartnerSelector.css";

const PartnerSelector = ({ selectedPartners, onPartnersChange, error }) => {
  const [partners, setPartners] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger la liste des partenaires
  useEffect(() => {
    const loadPartners = async () => {
      const token = localStorage.getItem("token");
      console.log(
        "🔍 PartnerSelector - Chargement des partenaires, token:",
        token ? "Présent" : "Absent"
      );
      if (token) {
        try {
          const partnersData = await fetchPartners(token);
          console.log("🔍 PartnerSelector - Partenaires reçus:", partnersData);
          setPartners(partnersData);
        } catch (error) {
          console.error(
            "🔍 PartnerSelector - Erreur lors du chargement des partenaires:",
            error
          );
        }
      }
    };

    loadPartners();
  }, []);

  // Filtrer les partenaires selon le terme de recherche
  const filteredPartners = partners.filter((partner) => {
    const partnerName = partner.raison_sociale || "";
    return (
      partnerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedPartners.includes(partnerName)
    );
  });

  // Ajouter un partenaire
  const addPartner = (partnerName) => {
    if (!selectedPartners.includes(partnerName)) {
      onPartnersChange([...selectedPartners, partnerName]);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  // Supprimer un partenaire
  const removePartner = (partnerName) => {
    onPartnersChange(selectedPartners.filter((p) => p !== partnerName));
  };

  return (
    <div className="partner-selector">
      <label htmlFor="partner-search">Partenaire(s)</label>

      {/* Champ de recherche */}
      <div className="partner-search-container">
        <input
          type="text"
          id="partner-search"
          placeholder="Rechercher un partenaire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={error ? "error" : ""}
        />

        {/* Liste déroulante des partenaires */}
        {isOpen && (
          <div className="partner-dropdown">
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="partner-option"
                  onClick={() => addPartner(partner.raison_sociale)}
                >
                  {partner.raison_sociale}
                </div>
              ))
            ) : (
              <div className="partner-option no-results">
                {searchTerm
                  ? "Aucun partenaire trouvé"
                  : partners.length === 0
                  ? "Aucun partenaire disponible"
                  : "Tous les partenaires sont déjà sélectionnés"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags des partenaires sélectionnés */}
      {selectedPartners.length > 0 && (
        <div className="selected-partners">
          {selectedPartners.map((partnerName, index) => (
            <div key={index} className="partner-tag">
              <span className="partner-name">{partnerName}</span>
              <button
                type="button"
                className="remove-partner"
                onClick={() => removePartner(partnerName)}
                title="Supprimer ce partenaire"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default PartnerSelector;
