# 🚀 Guide de Déploiement - Portail des Appels d'Offres

## 📋 Prérequis

### Environnement de Développement

- Node.js 16+ et npm
- Python 3.8+ et pip
- MongoDB 4.4+

### Environnement de Production

- Serveur avec Node.js 16+
- Base de données MongoDB
- Reverse proxy (Nginx recommandé)
- Certificat SSL

## 🔧 Configuration

### 1. Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
# Configuration de l'API
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_ENVIRONMENT=production

# Configuration PWA
REACT_APP_PWA_ENABLED=true
REACT_APP_APP_NAME=Portail des Appels d'Offres
REACT_APP_APP_SHORT_NAME=APLOFR

# Configuration des fonctionnalités
REACT_APP_FEATURE_ANALYTICS=true
REACT_APP_FEATURE_OFFLINE_MODE=true
REACT_APP_FEATURE_NOTIFICATIONS=true

# Configuration des uploads
REACT_APP_FILESTACK_API_KEY=your_filestack_api_key_here
REACT_APP_MAX_FILE_SIZE=10485760

# Configuration de sécurité
REACT_APP_JWT_SECRET=your_jwt_secret_here
REACT_APP_SESSION_TIMEOUT=3600000

# Configuration de production
GENERATE_SOURCEMAP=false
REACT_APP_DEBUG=false
```

### 2. Configuration Backend

Assurez-vous que le backend Flask est configuré avec :

- CORS activé pour le domaine frontend
- JWT configuré avec la même clé secrète
- MongoDB connecté et accessible

## 🏗️ Build de Production

### Build Automatique

```bash
# Build optimisé pour la production
npm run build:prod

# Build pour le développement
npm run build:dev
```

### Build Manuel

```bash
# Installer les dépendances
npm ci

# Build de production
npm run build

# Optimiser le build
npm run clean:build
```

## 🌐 Déploiement

### Option 1: Serveur Web Statique

1. **Copier les fichiers build** :

```bash
# Copier le contenu du dossier build vers le serveur web
scp -r build/* user@server:/var/www/html/
```

2. **Configuration Nginx** :

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

    # Cache des assets statiques
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Option 2: Plateforme Cloud

#### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

#### Netlify

```bash
# Build
npm run build

# Déployer le dossier build
# via l'interface Netlify ou CLI
```

#### Heroku

```bash
# Ajouter le buildpack
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack

# Déployer
git push heroku main
```

### Option 3: Docker

1. **Dockerfile** :

```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Déployer** :

```bash
# Construire l'image
docker build -t aplofr-app .

# Lancer le conteneur
docker run -p 80:80 aplofr-app
```

## 🔍 Vérifications Post-Déploiement

### 1. Tests Fonctionnels

- [ ] Page de connexion accessible
- [ ] Authentification fonctionnelle
- [ ] Navigation entre les pages
- [ ] Fonctionnalités CRUD
- [ ] Upload de fichiers
- [ ] Mode PWA

### 2. Tests de Performance

- [ ] Temps de chargement < 3s
- [ ] Lighthouse score > 90
- [ ] Compression gzip active
- [ ] Cache headers configurés

### 3. Tests de Sécurité

- [ ] HTTPS activé
- [ ] Headers de sécurité configurés
- [ ] CORS correctement configuré
- [ ] Pas de données sensibles exposées

## 📊 Monitoring

### Analytics

```javascript
// Ajouter Google Analytics
gtag("config", "GA_MEASUREMENT_ID");
```

### Logs

```bash
# Surveiller les logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Performance

```bash
# Utiliser Lighthouse CLI
npm install -g lighthouse
lighthouse https://your-domain.com --output html
```

## 🔄 Mise à Jour

### Processus de Mise à Jour

1. **Backup** : Sauvegarder la version actuelle
2. **Build** : Construire la nouvelle version
3. **Test** : Tester en environnement de staging
4. **Déploiement** : Déployer la nouvelle version
5. **Vérification** : Vérifier le bon fonctionnement

### Script de Mise à Jour Automatisé

```bash
#!/bin/bash
# update.sh

echo "🔄 Mise à jour de l'application..."

# Backup
cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)

# Pull des changements
git pull origin main

# Build
npm run build:prod

# Déploiement
cp -r build/* /var/www/html/

# Redémarrage des services
systemctl reload nginx

echo "✅ Mise à jour terminée!"
```

## 🆘 Dépannage

### Problèmes Courants

1. **Erreur 404 sur les routes** :

   - Vérifier la configuration Nginx pour les SPA
   - S'assurer que `try_files` est configuré

2. **Problèmes CORS** :

   - Vérifier la configuration CORS du backend
   - S'assurer que l'URL de l'API est correcte

3. **Problèmes de cache** :

   - Vider le cache du navigateur
   - Vérifier les headers de cache

4. **Erreurs de build** :
   - Vérifier les variables d'environnement
   - S'assurer que toutes les dépendances sont installées

### Logs Utiles

```bash
# Logs de l'application
npm run analyze

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs système
journalctl -u nginx -f
```

## 📞 Support

Pour toute question ou problème :

- **Email** : support@leaderttech-solutions.com
- **Documentation** : [Lien vers la documentation]
- **Issues** : [Lien vers le repository GitHub]

---

**Développé par LEADERTECH-SOLUTIONS** 🚀
