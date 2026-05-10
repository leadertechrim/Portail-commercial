import React, { useState, useEffect } from "react";
import { fetchPersonnel, rolesAPI, fetchUserDecryptedPassword } from "../api";
import "./UserModal.css";

const UserModal = ({ user, onSave, onClose, isViewMode = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    Fonction: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    telephone: "",
    statut: "actif",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [personnel, setPersonnel] = useState([]);
  const [roles, setRoles] = useState([]);
  const [decryptedPassword, setDecryptedPassword] = useState(""); // Mot de passe déchiffré
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Mode édition : ne jamais afficher le mot de passe
        setFormData({
          name: user.name || "",
          Fonction: user.Fonction || "",
          email: user.email || "",
          password: "", // VIDE lors de l'édition (sécurité)
          confirmPassword: "",
          role: user.role || "user",
          telephone: user.telephone || "",
          statut: user.statut || "actif",
        });
      } else {
        // Mode création : tous les champs vides
        setFormData({
          name: "",
          Fonction: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
          telephone: "",
          statut: "actif",
        });
      }
    };

    loadUserData();
  }, [user]);

  // Charger les personnels et les rôles depuis le backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔧 Token présent:", token ? "Oui" : "Non");

        if (token) {
          // Charger les personnels
          console.log("📋 Chargement des personnels...");
          const personnelData = await fetchPersonnel(token);
          console.log("📋 Données personnels reçues:", personnelData);
          console.log("📋 Nombre de personnels:", personnelData?.length || 0);
          setPersonnel(personnelData);

          // Charger les rôles depuis le backend
          console.log("📋 Chargement des rôles depuis le backend...");
          const rolesResponse = await rolesAPI.getAll(token);
          console.log("📋 Réponse brute des rôles:", rolesResponse);

          const rolesData = rolesResponse?.data || rolesResponse || [];
          console.log("📋 Rôles extraits:", rolesData);
          console.log("📋 Nombre de rôles:", rolesData?.length || 0);

          if (rolesData.length === 0) {
            console.warn("⚠️ Aucun rôle reçu du backend !");
            alert(
              "⚠️ Aucun rôle trouvé dans le backend. Vérifiez la connexion."
            );
            return;
          }

          setRoles(rolesData);

          // Si c'est un nouvel utilisateur et qu'aucun rôle n'est sélectionné, utiliser le premier rôle disponible
          if (!user && rolesData.length > 0) {
            const defaultRole = rolesData[0].nom;
            setFormData((prev) => ({
              ...prev,
              role: defaultRole,
            }));
            console.log("🔧 Rôle par défaut défini:", defaultRole);
          }
        } else {
          console.error("❌ Aucun token trouvé dans localStorage");
          alert("❌ Session expirée. Veuillez vous reconnecter.");
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des données:", error);
        alert(`❌ Erreur de connexion au backend: ${error.message}`);
        // Ne pas utiliser de fallback - forcer l'utilisation du backend
        setRoles([]);
      }
    };
    loadData();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom et prénom sont requis";
    }

    if (!formData.Fonction.trim()) {
      newErrors.Fonction = "La fonction est requise";
    }

    if (!formData.role) {
      newErrors.role = "Le rôle est requis";
    }

    if (!formData.statut) {
      newErrors.statut = "Le statut est requis";
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation de la confirmation de mot de passe
    if (
      formData.password &&
      formData.password.trim() !== "" &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Pour un nouvel utilisateur, la confirmation est obligatoire
    if (!user && formData.password && !formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        Fonction: formData.Fonction.trim(),
        role: formData.role,
        telephone: formData.telephone.trim(),
        statut: formData.statut,
      };

      // Pour un nouvel utilisateur, le mot de passe est obligatoire
      // Pour la modification, le mot de passe est optionnel (seulement si non vide)
      if (!user) {
        userData.password = formData.password.trim();
      } else if (formData.password.trim() !== "") {
        // Si on modifie et qu'un mot de passe est saisi, on l'inclut
        userData.password = formData.password.trim();
      }
      // Sinon, on n'envoie pas le champ password = le backend ne modifiera pas le mot de passe

      await onSave(userData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si c'est le champ nom (sélection du personnel), récupérer automatiquement email et téléphone
    if (name === "name" && value) {
      const selectedPerson = personnel.find(
        (person) => person.nom_prenom === value
      );
      if (selectedPerson) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          email: selectedPerson.email || "",
          telephone: selectedPerson.telephone || "",
        }));
        console.log("👤 Personnel sélectionné:", selectedPerson);
        console.log("📧 Email automatique:", selectedPerson.email);
        console.log("📞 Téléphone automatique:", selectedPerson.telephone);
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header orange — titre BLANC GRAND */}
        <div className="modal-header" style={{ background: "#f67800", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 30px", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{
            margin: 0, color: "#ffffff",
            fontSize: "1.15rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 9,
            textShadow: "0 1px 3px rgba(0,0,0,.18)"
          }}>
            <i className={`fas ${user ? "fa-user-edit" : "fa-user-plus"}`} style={{ fontSize: "1rem", opacity: .85 }}></i>
            {isViewMode
              ? "Détails de l'utilisateur"
              : user
              ? "Modifier l'utilisateur"
              : "Nouvel utilisateur"}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "#ffffff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".9rem", transition: "all .22s", flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form
          onSubmit={isViewMode ? (e) => e.preventDefault() : handleSubmit}
          className="modal-form-grid"
          style={{ padding: "30px" }}
        >
          <div className="form-group full-width">
            <label htmlFor="name">Nom et prénom <span className="required-star">*</span></label>
            <select
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              disabled={isViewMode}
            >
              <option value="">Sélectionner un personnel</option>
              {personnel.map((person) => {
                const displayName = person.nom_prenom || `Personnel ${person._id}`;
                return (
                  <option key={person._id} value={person.nom_prenom}>
                    {displayName}
                  </option>
                );
              })}
            </select>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="email">Email <span className="required-star">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Email (automatique)"
              readOnly={true}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Téléphone (automatique)"
              readOnly={true}
            />
          </div>

          <div className="form-group">
            <label htmlFor="Fonction">Fonction</label>
            <select
              id="Fonction"
              name="Fonction"
              value={formData.Fonction}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <option value="">Sélectionner une fonction</option>
              <option value="Directeur">Directeur</option>
              <option value="Directeur Général">Directeur Général</option>
              <option value="Chef de Projet">Chef de Projet</option>
              <option value="Chef de Service">Chef de Service</option>
              <option value="Ingénieur">Ingénieur</option>
              <option value="Développeur">Développeur</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {!isViewMode && (
            <>
              <div className="form-group">
                <label htmlFor="password">
                  Mot de passe {!user && <span className="required-star">*</span>}
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    placeholder={user ? "Nouveau (optionnel)" : "Mot de passe"}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmation {formData.password && <span className="required-star">*</span>}</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "error" : ""}
                    placeholder="Confirmer"
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="role">Rôle <span className="required-star">*</span></label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isViewMode}
            >
              {roles.map((role) => (
                <option key={role._id || role.nom} value={role.nom}>
                  {role.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut <span className="required-star">*</span></label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          <div className="modal-actions" style={{ gridColumn: "span 2", marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <i className="fas fa-times"></i>
              {isViewMode ? "Fermer" : "Annuler"}
            </button>
            {!isViewMode && (
              <button 
                type="submit" 
                className="save-btn" 
                disabled={loading}
                style={{ 
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "#f67800", color: "white", border: "none",
                  padding: "0 26px", borderRadius: "8px", fontWeight: "600",
                  height: "38px", cursor: "pointer"
                }}
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                {user ? "Mettre à jour" : "Créer l'Utilisateur"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
