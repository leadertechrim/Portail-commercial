import React, { useState, useEffect } from "react";
import {
  fetchPersonnel,
  rolesAPI,
  fetchUserById,
  fetchUserDecryptedPassword,
} from "../api";
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
        <div className="modal-header">
          <h2>
            {isViewMode
              ? "Détails de l'utilisateur"
              : user
              ? "Modifier l'utilisateur"
              : "Nouvel utilisateur"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form
          onSubmit={isViewMode ? (e) => e.preventDefault() : handleSubmit}
          className="user-form"
        >
          <div className="form-group">
            <label htmlFor="name">Nom et prénom *</label>
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
                // Utiliser le champ correct des personnels
                const displayName =
                  person.nom_prenom || `Personnel ${person._id}`;
                const valueName = person.nom_prenom;

                return (
                  <option key={person._id} value={valueName}>
                    {displayName}
                  </option>
                );
              })}
            </select>
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
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
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className={errors.telephone ? "error" : ""}
              placeholder="Téléphone (automatique)"
              readOnly={true}
            />
            {errors.telephone && (
              <span className="error-message">{errors.telephone}</span>
            )}
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
              <option value="Directeur Technique">Directeur Technique</option>
              <option value="Directeur Commercial">Directeur Commercial</option>
              <option value="Directeur Financier">Directeur Financier</option>
              <option value="Directeur RH">Directeur RH</option>
              <option value="Chef de Projet">Chef de Projet</option>
              <option value="Chef d'Équipe">Chef d'Équipe</option>
              <option value="Chef de Service">Chef de Service</option>
              <option value="Chef de Département">Chef de Département</option>
              <option value="Manager">Manager</option>
              <option value="Manager Commercial">Manager Commercial</option>
              <option value="Manager Technique">Manager Technique</option>
              <option value="Manager Projet">Manager Projet</option>
              <option value="Superviseur">Superviseur</option>
              <option value="Coordinateur">Coordinateur</option>
              <option value="Responsable">Responsable</option>
              <option value="Responsable Commercial">
                Responsable Commercial
              </option>
              <option value="Responsable Technique">
                Responsable Technique
              </option>
              <option value="Responsable Projet">Responsable Projet</option>
              <option value="Responsable Qualité">Responsable Qualité</option>
              <option value="Ingénieur">Ingénieur</option>
              <option value="Ingénieur Senior">Ingénieur Senior</option>
              <option value="Ingénieur Principal">Ingénieur Principal</option>
              <option value="Ingénieur Projet">Ingénieur Projet</option>
              <option value="Ingénieur Système">Ingénieur Système</option>
              <option value="Développeur">Développeur</option>
              <option value="Développeur Senior">Développeur Senior</option>
              <option value="Développeur Principal">
                Développeur Principal
              </option>
              <option value="Analyste">Analyste</option>
              <option value="Analyste Fonctionnel">Analyste Fonctionnel</option>
              <option value="Analyste Technique">Analyste Technique</option>
              <option value="Analyste Système">Analyste Système</option>
              <option value="Consultant">Consultant</option>
              <option value="Consultant Senior">Consultant Senior</option>
              <option value="Consultant Principal">Consultant Principal</option>
              <option value="Architecte">Architecte</option>
              <option value="Architecte Solution">Architecte Solution</option>
              <option value="Architecte Système">Architecte Système</option>
              <option value="Architecte Technique">Architecte Technique</option>
              <option value="Spécialiste">Spécialiste</option>
              <option value="Spécialiste Technique">
                Spécialiste Technique
              </option>
              <option value="Spécialiste Métier">Spécialiste Métier</option>
              <option value="Expert">Expert</option>
              <option value="Expert Technique">Expert Technique</option>
              <option value="Expert Métier">Expert Métier</option>
              <option value="Technicien">Technicien</option>
              <option value="Technicien Senior">Technicien Senior</option>
              <option value="Technicien Principal">Technicien Principal</option>
              <option value="Assistant">Assistant</option>
              <option value="Assistant Manager">Assistant Manager</option>
              <option value="Assistant Projet">Assistant Projet</option>
              <option value="Stagiaire">Stagiaire</option>
              <option value="Stagiaire Ingénieur">Stagiaire Ingénieur</option>
              <option value="Stagiaire Développeur">
                Stagiaire Développeur
              </option>
              <option value="Autre">Autre</option>
            </select>
            {errors.Fonction && (
              <span className="error-message">{errors.Fonction}</span>
            )}
          </div>

          {!isViewMode && (
            <div className="form-group">
              <label htmlFor="password">
                Mot de passe {!user && "*"}
                {user && (
                  <small style={{ color: "#666", fontWeight: "normal" }}>
                    {" "}
                    (laisser vide pour ne pas changer)
                  </small>
                )}
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder={
                    user ? "Nouveau mot de passe (optionnel)" : "Mot de passe"
                  }
                  readOnly={isViewMode}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={async () => {
                    if (user && !showPassword && !decryptedPassword) {
                      // Récupérer le mot de passe déchiffré
                      setLoadingPassword(true);
                      try {
                        const token = localStorage.getItem("token");
                        const result = await fetchUserDecryptedPassword(
                          user._id || user.id,
                          token
                        );
                        if (result.password) {
                          setDecryptedPassword(result.password);
                          setFormData((prev) => ({
                            ...prev,
                            password: result.password,
                          }));
                          setShowPassword(true);
                        } else {
                          // Ancien utilisateur sans password_encrypted
                          const genererPassword = window.confirm(
                            "⚠️ Ce mot de passe ne peut pas être affiché (ancien utilisateur).\n\n" +
                              "Voulez-vous générer un NOUVEAU mot de passe aléatoire ?\n\n" +
                              "Le nouveau mot de passe sera affiché et vous pourrez le copier."
                          );

                          if (genererPassword) {
                            // Générer un mot de passe aléatoire
                            const chars =
                              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                            let newPassword = "";
                            for (let i = 0; i < 12; i++) {
                              newPassword += chars.charAt(
                                Math.floor(Math.random() * chars.length)
                              );
                            }

                            setDecryptedPassword(newPassword);
                            setFormData((prev) => ({
                              ...prev,
                              password: newPassword,
                              confirmPassword: newPassword,
                            }));
                            setShowPassword(true);

                            alert(
                              "✅ Nouveau mot de passe généré : " +
                                newPassword +
                                "\n\n" +
                                "Copiez-le et sauvegardez le formulaire pour l'appliquer."
                            );
                          }
                        }
                      } catch (error) {
                        alert(
                          "❌ Erreur lors de la récupération du mot de passe"
                        );
                        console.error(error);
                      } finally {
                        setLoadingPassword(false);
                      }
                    } else if (user && showPassword && decryptedPassword) {
                      // Masquer le mot de passe
                      setFormData((prev) => ({
                        ...prev,
                        password: "",
                      }));
                      setShowPassword(false);
                    } else {
                      // Basculer normalement pour nouveau user
                      setShowPassword(!showPassword);
                    }
                  }}
                  title={showPassword ? "Masquer" : "Afficher le mot de passe"}
                  disabled={loadingPassword}
                >
                  {loadingPassword ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i
                      className={`fas ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
          )}

          {!isViewMode && formData.password && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmation mot de passe *
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                  placeholder="Confirmer le mot de passe"
                  readOnly={isViewMode}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Masquer" : "Afficher"}
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
              <small className="help-text">
                {user
                  ? "Confirmer le nouveau mot de passe (optionnel)"
                  : "Confirmer le mot de passe"}
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Rôle *</label>
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
            {errors.role && (
              <span className="error-message">{errors.role}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut *</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Non actif</option>
            </select>
            {errors.statut && (
              <span className="error-message">{errors.statut}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              {isViewMode ? "Fermer" : "Annuler"}
            </button>
            {!isViewMode && (
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {user ? "Modifier" : "Créer"}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
