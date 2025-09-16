# Gestion des Utilisateurs - Administrateur

## 🎯 Fonctionnalités Ajoutées

### ✅ Page d'Administration (`/admin`)

- **Accès restreint** : Seuls les utilisateurs avec le rôle "admin" peuvent y accéder
- **Interface moderne** : Design cohérent avec le reste de l'application
- **Tableau des utilisateurs** : Affichage de tous les utilisateurs avec leurs informations

### ✅ Gestion Complète des Utilisateurs

1. **Création d'utilisateurs** : Ajouter de nouveaux utilisateurs avec nom, email, mot de passe et rôle
2. **Modification d'utilisateurs** : Modifier les informations d'un utilisateur existant
3. **Suppression d'utilisateurs** : Supprimer un utilisateur (avec protection contre l'auto-suppression)
4. **Changement de mot de passe** : Permettre à l'admin de changer le mot de passe de n'importe quel utilisateur

### ✅ Sécurité

- **Authentification JWT** : Toutes les opérations nécessitent un token valide
- **Autorisation admin** : Seuls les administrateurs peuvent gérer les utilisateurs
- **Validation des données** : Validation côté client et serveur
- **Protection des mots de passe** : Hachage avec bcrypt

## 🚀 Installation et Configuration

### 1. Backend (Flask)

Ajoutez le code du fichier `backend_user_management.py` à votre application Flask existante.

**Routes ajoutées :**

- `GET /api/users` - Récupérer tous les utilisateurs
- `POST /api/users` - Créer un nouvel utilisateur
- `PUT /api/users/<user_id>` - Modifier un utilisateur
- `DELETE /api/users/<user_id>` - Supprimer un utilisateur
- `POST /api/users/<user_id>/change-password` - Changer le mot de passe d'un utilisateur
- `POST /api/admin/change-password` - Changer son propre mot de passe (admin)

### 2. Frontend (React)

Tous les fichiers ont été créés et configurés :

- `src/pages/AdminPage.js` - Page principale d'administration
- `src/components/UserModal.js` - Modal de création/modification d'utilisateur
- `src/components/PasswordModal.js` - Modal de changement de mot de passe
- `src/pages/AdminPage.css` - Styles de la page admin
- `src/components/UserModal.css` - Styles des modales
- `src/components/PasswordModal.css` - Styles de la modal de mot de passe
- `src/api.js` - Fonctions API mises à jour
- `src/App.js` - Route `/admin` ajoutée

## 📋 Utilisation

### Accès à l'Administration

1. Connectez-vous avec un compte administrateur
2. Cliquez sur le bouton "Administration" dans l'interface (visible uniquement pour les admins)
3. Vous serez redirigé vers `/admin`

### Créer un Utilisateur

1. Cliquez sur "Nouvel Utilisateur"
2. Remplissez le formulaire :
   - **Nom** : Nom complet de l'utilisateur
   - **Email** : Adresse email unique
   - **Mot de passe** : Mot de passe sécurisé (min. 6 caractères)
   - **Rôle** : "Utilisateur" ou "Administrateur"
3. Cliquez sur "Créer"

### Modifier un Utilisateur

1. Cliquez sur l'icône "Modifier" (crayon) dans la ligne de l'utilisateur
2. Modifiez les informations souhaitées
3. Laissez le champ mot de passe vide pour ne pas le changer
4. Cliquez sur "Modifier"

### Changer un Mot de Passe

1. Cliquez sur l'icône "Clé" dans la ligne de l'utilisateur
2. Saisissez le mot de passe actuel
3. Saisissez le nouveau mot de passe (min. 6 caractères)
4. Confirmez le nouveau mot de passe
5. Cliquez sur "Changer le mot de passe"

### Supprimer un Utilisateur

1. Cliquez sur l'icône "Supprimer" (poubelle) dans la ligne de l'utilisateur
2. Confirmez la suppression dans la boîte de dialogue
3. L'utilisateur sera supprimé définitivement

## 🔒 Sécurité et Bonnes Pratiques

### Rôles et Permissions

- **Utilisateur** : Accès standard à l'application
- **Administrateur** : Accès complet + gestion des utilisateurs

### Protection des Données

- Les mots de passe sont hachés avec bcrypt
- Les tokens JWT expirent après 6 heures
- Validation des données côté client et serveur
- Protection contre l'auto-suppression

### Validation

- **Email** : Format valide et unicité
- **Mot de passe** : Minimum 6 caractères
- **Nom** : Obligatoire
- **Rôle** : "user" ou "admin" uniquement

## 🎨 Interface Utilisateur

### Design Responsive

- **Desktop** : Tableau complet avec toutes les actions
- **Mobile** : Interface adaptée avec boutons empilés
- **Couleurs** : Cohérentes avec le thème de l'application

### Expérience Utilisateur

- **Modales** : Interface intuitive pour les formulaires
- **Feedback** : Messages d'erreur et de succès clairs
- **Chargement** : Indicateurs de progression
- **Navigation** : Bouton retour vers la page principale

## 🛠️ Développement

### Structure des Fichiers

```
src/
├── pages/
│   ├── AdminPage.js
│   └── AdminPage.css
├── components/
│   ├── UserModal.js
│   ├── UserModal.css
│   ├── PasswordModal.js
│   └── PasswordModal.css
├── api.js (mis à jour)
└── App.js (mis à jour)
```

### API Endpoints

Tous les endpoints nécessitent un token JWT valide avec le rôle "admin" :

- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur
- `POST /api/users/:id/change-password` - Changer le mot de passe

## ✅ Fonctionnalités Complètes

- ✅ Interface d'administration moderne
- ✅ CRUD complet des utilisateurs
- ✅ Gestion des rôles (user/admin)
- ✅ Changement de mots de passe
- ✅ Validation des données
- ✅ Sécurité JWT + bcrypt
- ✅ Design responsive
- ✅ Messages d'erreur/succès
- ✅ Protection contre l'auto-suppression
- ✅ Interface intuitive et accessible

Votre système de gestion des utilisateurs est maintenant prêt à être utilisé ! 🎉
