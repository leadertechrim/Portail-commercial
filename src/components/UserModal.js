import React, { useState, useEffect } from "react";
import "./UserModal.css";

const UserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    telephone: "",
    statut: "actif",
    gerer: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "admin123",
        role: user.role || "user",
        telephone: user.telephone || "",
        statut: user.statut || "actif",
        gerer: user.gerer !== undefined ? user.gerer : true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        telephone: "",
        statut: "actif",
        gerer: true,
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

      if (!user && formData.password.trim()) {
        userData.password = formData.password;
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
          <h2>{user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
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
            />
            {errors.telephone && (
              <span className="error-message">{errors.telephone}</span>
            )}
            <small className="help-text">
              Format international (ex: +22241000000)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe {!user && "*"}</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={user ? undefined : handleChange}
                className={`${errors.password ? "error" : ""} ${
                  user ? "readonly" : ""
                }`}
                placeholder={user ? "Mot de passe fixe" : "Mot de passe"}
                readOnly={!!user}
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
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            {user && (
              <small className="help-text">
                Mot de passe fixe - non modifiable
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Rôle *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut *</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="gerer"
                checked={formData.gerer}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gerer: e.target.checked,
                  }))
                }
                className="checkbox-input"
              />
              <span className="checkbox-text">Peut gérer les utilisateurs</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
