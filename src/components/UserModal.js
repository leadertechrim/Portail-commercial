import React, { useState, useEffect } from "react";
import "./UserModal.css";

const UserModal = ({ user, onSave, onClose, isViewMode = false }) => {
  const [formData, setFormData] = useState({
    name: "",
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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Password is now optional for edit, so clear it
        confirmPassword: "", // Clear confirmation password
        role: user.role || "user",
        telephone: user.telephone || "",
        statut: user.statut || "actif",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        telephone: "",
        statut: "actif",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (formData.telephone && !/^\+?[1-9]\d{1,14}$/.test(formData.telephone)) {
      newErrors.telephone = "Le numéro de téléphone n'est pas valide";
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation de la confirmation de mot de passe
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
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
        role: formData.role,
        telephone: formData.telephone.trim(),
        statut: formData.statut,
        gerer: formData.gerer,
      };

      // Pour un nouvel utilisateur, le mot de passe est obligatoire
      // Pour la modification, le mot de passe est optionnel
      if (!user) {
        userData.password = formData.password.trim();
      } else if (formData.password.trim()) {
        userData.password = formData.password.trim();
      }

      await onSave(userData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
            <label htmlFor="name">Nom *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Nom complet"
              readOnly={isViewMode}
            />
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
              placeholder="email@exemple.com"
              readOnly={isViewMode}
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
              placeholder="+22241000000"
              readOnly={isViewMode}
            />
            {errors.telephone && (
              <span className="error-message">{errors.telephone}</span>
            )}
            <small className="help-text">
              Format international (ex: +22241000000)
            </small>
          </div>

          {!isViewMode && (
          <div className="form-group">
            <label htmlFor="password">Mot de passe {!user && "*"}</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder="Mot de passe"
                  readOnly={isViewMode}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                ></i>
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            </div>
          )}

          {user && !isViewMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmation mot de passe</label>
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
                  title={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
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
                Confirmer le nouveau mot de passe (optionnel)
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
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
              <option value="spectateur">Spectateur</option>
            </select>
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
