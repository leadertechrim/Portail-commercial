# APLOFR - Portail de Gestion Commerciale

Application React de gestion des appels d'offres, partenaires, clients, devis et factures.

## 📋 Table des matières

- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Scripts disponibles](#-scripts-disponibles)
- [Structure du projet](#-structure-du-projet)
- [Pages principales](#-pages-principales)
- [Fonctionnalités](#-fonctionnalités)
- [API Backend](#-api-backend)
- [Déploiement](#-déploiement)
- [Dépannage](#-dépannage)

---

## 🛠️ Stack Technique

### Frontend

- **React** `^18.2.0` - Framework JavaScript
- **React DOM** `^18.2.0` - Rendu React
- **React Router DOM** `^6.30.1` - Navigation
- **React Icons** `^5.5.0` - Bibliothèque d'icônes
- **React Scripts** `5.0.1` - Outils de build Create React App

### Upload & Fichiers

- **Filestack JS** `^3.42.0` - Upload de fichiers cloud

### Tests

- **@testing-library/react** `^16.3.0` - Tests React
- **@testing-library/jest-dom** `^6.8.0` - Matchers Jest pour DOM
- **@testing-library/user-event** `^13.5.0` - Simulation d'événements utilisateur
- **@testing-library/dom** `^10.4.1` - Utilitaires DOM

### Outils de développement

- **ESLint** `^8.57.1` - Linter JavaScript
- **ESLint Config React App** `^7.0.1` - Configuration ESLint pour React
- **TypeScript ESLint** `^8.44.1` - Support TypeScript pour ESLint
- **Autoprefixer** `^10.4.21` - Préfixes CSS automatiques
- **PostCSS** `^8.5.6` - Transformation CSS
- **Tailwind CSS** `^4.1.13` - Framework CSS utility-first

### Performance & PWA

- **Web Vitals** `^2.1.4` - Métriques de performance web
- **Service Worker** - Support PWA et mode hors ligne

### Backend (API)

- **Flask** - Framework Python (backend séparé)
- **MongoDB** - Base de données
- **JWT** - Authentification par tokens

---

## 📦 Prérequis

- **Node.js** 16+ et npm
- **Accès à l'API backend Flask** (URL configurée dans `.env`)
- **Navigateur moderne** (Chrome, Firefox, Safari, Edge - dernières versions)

---

## 🚀 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd aplofr

# Installer les dépendances
npm install
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# URL de l'API Backend (OBLIGATOIRE)
REACT_APP_API_URL=http://localhost:8000

# Pour la production
# REACT_APP_API_URL=https://applesoffres-production.up.railway.app

# Configuration PWA (optionnel)
REACT_APP_PWA_ENABLED=true
REACT_APP_APP_NAME=Portail de Gestion Commerciale
REACT_APP_APP_SHORT_NAME=APLOFR

# Configuration Filestack (optionnel)
REACT_APP_FILESTACK_API_KEY=your_filestack_api_key_here
```

### ⚠️ Important : Configuration de l'URL API

**Pour le développement local :**

- Si votre backend Flask écoute sur `0.0.0.0:8080`, utilisez `http://localhost:8080` dans `.env`
- Le frontend ne peut pas se connecter à `0.0.0.0` depuis le navigateur
- L'application corrige automatiquement `0.0.0.0` en `localhost` avec un avertissement

**Exemple :**

```env
# ❌ Ne fonctionne pas
REACT_APP_API_URL=http://0.0.0.0:8080

# ✅ Fonctionne
REACT_APP_API_URL=http://localhost:8080
```

---

## 🚀 Démarrage

### Mode développement

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `build/`

### Tests

```bash
npm test
```

---

## 📜 Scripts disponibles

| Commande              | Description                                |
| --------------------- | ------------------------------------------ |
| `npm start`           | Démarre le serveur de développement        |
| `npm run build`       | Build de production standard               |
| `npm run build:prod`  | Build optimisé pour production             |
| `npm run build:dev`   | Build pour développement                   |
| `npm test`            | Lance les tests                            |
| `npm run lint`        | Vérifie le code avec ESLint                |
| `npm run lint:fix`    | Corrige automatiquement les erreurs ESLint |
| `npm run clean`       | Nettoie tous les fichiers temporaires      |
| `npm run clean:build` | Nettoie le dossier build                   |
| `npm run analyze`     | Analyse la taille du bundle                |

---

## 📁 Structure du projet

```
aplofr/
├── public/                 # Fichiers statiques publics
│   ├── index.html         # Template HTML
│   ├── manifest.json      # Manifest PWA
│   └── logo*.png          # Logos
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Header.js      # En-tête avec menu
│   │   ├── SidebarDynamic.js  # Menu latéral
│   │   ├── Notification.js    # Système de notifications
│   │   └── ...
│   ├── pages/            # Pages de l'application
│   │   ├── SourcesPage.js
│   │   ├── ClientsPage.js
│   │   ├── CartPage.js
│   │   └── ...
│   ├── hooks/            # Hooks personnalisés
│   │   ├── useCart.js
│   │   ├── usePermissions.js
│   │   ├── useNotification.js
│   │   └── ...
│   ├── contexts/         # Contextes React
│   │   └── NotificationContext.js
│   ├── utils/            # Utilitaires
│   │   ├── logger.js         # Système de logging
│   │   ├── navigationUtils.js # Navigation
│   │   └── apiDiagnostics.js  # Diagnostic API
│   ├── styles/           # Styles CSS globaux
│   ├── constants/        # Constantes
│   │   └── permissions.js
│   ├── api.js            # Configuration et fonctions API
│   ├── App.js            # Composant principal
│   └── index.js          # Point d'entrée
├── scripts/              # Scripts de build et utilitaires
├── .env                  # Variables d'environnement (à créer)
├── package.json          # Dépendances et scripts
└── README.md             # Documentation
```

---

## 📄 Pages principales

| Route        | Page          | Description                           |
| ------------ | ------------- | ------------------------------------- |
| `/login`     | LoginPage     | Page de connexion                     |
| `/sources`   | SourcesPage   | Gestion des sources d'appels d'offres |
| `/cart`      | CartPage      | Panier d'achats                       |
| `/ai-offers` | AIOffersPage  | Offres générées par IA                |
| `/clients`   | ClientsPage   | Gestion des clients                   |
| `/partners`  | PartnersPage  | Gestion des partenaires               |
| `/personnel` | PersonnelPage | Gestion du personnel                  |
| `/devis`     | DevisPage     | Gestion des devis                     |
| `/factures`  | FacturesPage  | Gestion des factures                  |
| `/links`     | LinksPage     | Liens utiles                          |
| `/admin`     | AdminPage     | Administration des utilisateurs       |
| `/roles`     | RolesPage     | Gestion des rôles                     |
| `/settings`  | SettingsPage  | Paramètres                            |

---

## ✨ Fonctionnalités

### Gestion des offres

- **Sources** : CRUD complet pour les sources d'appels d'offres (Nationale/Internationale)
- **Validation** : Détection automatique des doublons (nom d'entité et URL)
- **Ordres** : Gestion automatique des ordres avec tri et décalage
- **Offres IA** : Gestion des offres générées par IA
- **Panier** : Panier d'achats avec gestion des permissions

### Gestion clientèle

- **Clients** : CRUD complet pour les clients
- **Partenaires** : Gestion des partenaires
- **Personnel** : Administration du personnel

### Gestion commerciale

- **Devis** : Création et suivi des devis avec états personnalisables
- **Factures** : Gestion des factures avec états personnalisables

### Paramétrage

- **Rôles** : Gestion des rôles et permissions
- **Statuts** : Configuration des statuts (offres, devis, factures)
- **Catégories** : Gestion des catégories d'offres et de liens
- **Administration** : Gestion des utilisateurs

### Autres fonctionnalités

- **Liens utiles** : Répertoire de liens organisés par catégories
- **PWA** : Application web progressive avec support hors ligne
- **Notifications** : Système de notifications toast moderne
- **Recherche** : Recherche globale dans l'application
- **Historique** : Suivi des sources récemment visitées
- **Upload** : Upload de fichiers via Filestack

---

## 🔐 Système de permissions

L'application utilise un système de permissions basé sur les rôles :

- **Sources** : `sources_view`, `sources_create`, `sources_edit`, `sources_delete`
- **Panier** : `cart_view`, `cart_view_all`, `cart_add`, `cart_remove`
- **Clients** : `clients_view`, `clients_create`, `clients_edit`, `clients_delete`
- **Devis** : `devis_view`, `devis_create`, `devis_edit`, `devis_delete`
- **Factures** : `factures_view`, `factures_create`, `factures_edit`, `factures_delete`
- **Administration** : `admin_view`, `users_manage`, `roles_manage`

Les permissions sont vérifiées automatiquement pour chaque action.

---

## 🌐 API Backend

L'application se connecte à une API Flask backend via `REACT_APP_API_URL`.

### Authentification

- **Méthode** : JWT (JSON Web Tokens)
- **Stockage** : Token stocké dans `localStorage`
- **Header** : `Authorization: Bearer <token>`
- **Expiration** : Gestion automatique de l'expiration

### Endpoints principaux

- `POST /login` - Connexion
- `GET /api/sources` - Liste des sources
- `POST /api/sources` - Créer une source
- `PUT /api/sources/:id` - Modifier une source
- `DELETE /api/sources/:id` - Supprimer une source
- `POST /api/sources/check-duplicate` - Vérifier les doublons
- `GET /api/panier/can-view` - Vérifier la permission panier
- `GET /api/clients` - Liste des clients
- `GET /api/devis` - Liste des devis
- `GET /api/factures` - Liste des factures
- `GET /api/roles` - Liste des rôles
- `GET /api/permissions` - Permissions disponibles

### Gestion des erreurs

L'application gère automatiquement :

- Erreurs réseau (connexion impossible)
- Erreurs d'authentification (401)
- Erreurs d'autorisation (403)
- Erreurs de validation (400, 409)
- Erreurs serveur (500)

---

## 🚀 Déploiement

### Option 1 : Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement :
   - `REACT_APP_API_URL` = URL de votre API backend
3. Build command : `npm run build`
4. Publish directory : `build`
5. Déployez

### Option 2 : Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement
3. Build command : `npm run build`
4. Publish directory : `build`
5. Déployez

### Option 3 : Serveur statique (Nginx)

```bash
# Build
npm run build

# Copier les fichiers
scp -r build/* user@server:/var/www/html/
```

Configuration Nginx recommandée :

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Gestion des routes SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### Option 4 : Docker

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 Dépannage

### Erreur "Failed to fetch"

**Causes possibles :**

1. L'URL de l'API est incorrecte dans `.env`
2. Le backend n'est pas démarré
3. Problème CORS
4. Problème de réseau/firewall

**Solutions :**

- Vérifier que `REACT_APP_API_URL` est correct dans `.env`
- Vérifier que le backend Flask est démarré
- Vérifier la configuration CORS du backend
- Redémarrer le serveur : `npm start`

### Erreur 401 (Non autorisé)

**Cause :** Token expiré ou invalide

**Solution :** Se déconnecter et se reconnecter

### Erreur 403 (Accès refusé)

**Cause :** Permissions insuffisantes

**Solution :** Vérifier les permissions dans l'administration

### Les modifications ne s'affichent pas

**Causes possibles :**

1. Cache du navigateur
2. Service Worker en cache

**Solutions :**

- Vider le cache du navigateur (Ctrl+Shift+Delete)
- Désactiver le cache dans les DevTools
- Réinstaller le Service Worker

### URL 0.0.0.0 ne fonctionne pas

**Explication :**

- `0.0.0.0` est utilisé côté serveur Flask pour écouter sur toutes les interfaces
- Le navigateur ne peut pas se connecter à `0.0.0.0`
- Utilisez `localhost` ou `127.0.0.1` dans `.env`

**Solution :**

```env
# ❌ Ne fonctionne pas
REACT_APP_API_URL=http://0.0.0.0:8080

# ✅ Fonctionne
REACT_APP_API_URL=http://localhost:8080
```

---

## 📝 Notes importantes

### Sécurité

- ⚠️ Les fichiers `.env` ne doivent **JAMAIS** être commités dans Git
- ✅ Vérifiez que `.gitignore` contient `.env*`
- ✅ Les tokens JWT sont stockés dans `localStorage`

### Performance

- Les logs de développement ne s'affichent pas en production
- Le build de production est optimisé et minifié
- Les assets statiques sont mis en cache
- Le Service Worker permet le mode hors ligne

### Compatibilité

- Navigateurs supportés : Chrome, Firefox, Safari, Edge (dernières versions)
- Responsive : Compatible mobile, tablette et desktop
- PWA : Installable sur mobile et desktop

---

## 📞 Support

Pour toute question ou problème :

- **Email** : support@leaderttech-solutions.com

---

## 📄 Licence

Ce projet est sous licence privée.

**Développé par LEADERTECH-SOLUTIONS** 🚀
