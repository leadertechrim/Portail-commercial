# Guide de Déploiement

## ✅ Améliorations effectuées pour la production

### 1. Configuration de l'API
- ✅ URL de l'API configurée via variables d'environnement
- ✅ Support pour développement et production

### 2. Système de logging
- ✅ Création d'un système de logging conditionnel (`src/utils/logger.js`)
- ✅ Les logs ne s'affichent qu'en mode développement
- ✅ Les erreurs sont toujours loggées même en production

### 3. Système de notifications
- ✅ Remplacement des `alert()` par un système de notifications toast
- ✅ Notifications élégantes et non-bloquantes
- ✅ Support pour success, error, warning, info

### 4. Nettoyage du code
- ✅ Remplacement des `console.log` par le système de logging
- ✅ Remplacement des `alert()` par les notifications
- ✅ Code prêt pour la production

## 📋 Préparation au déploiement

### Variables d'environnement

Créez les fichiers suivants à la racine du projet :

#### `.env.development`
```
REACT_APP_API_URL=http://127.0.0.1:8000
```

#### `.env.production`
```
REACT_APP_API_URL=https://applesoffres-production.up.railway.app
```

### Build de production

```bash
# Installer les dépendances
npm install

# Build pour la production
npm run build

# Le dossier `build/` contient les fichiers optimisés
```

### Vérifications avant déploiement

- [ ] Vérifier que les variables d'environnement sont correctement configurées
- [ ] Tester le build : `npm run build`
- [ ] Vérifier que l'API backend est accessible depuis l'URL de production
- [ ] Tester toutes les fonctionnalités principales
- [ ] Vérifier les permissions utilisateur
- [ ] Tester sur différents navigateurs
- [ ] Vérifier la responsivité mobile

## 🚀 Déploiement

### Sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel :
   - `REACT_APP_API_URL` = `https://applesoffres-production.up.railway.app`
3. Déployez

### Sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify
3. Build command : `npm run build`
4. Publish directory : `build`
5. Déployez

### Sur Railway

1. Connectez votre repository GitHub à Railway
2. Configurez les variables d'environnement
3. Build command : `npm run build`
4. Start command : `npx serve -s build`
5. Déployez

## 📝 Notes importantes

- Les fichiers `.env` ne doivent **JAMAIS** être commités dans Git
- Assurez-vous que `.gitignore` contient `.env*`
- Les logs de développement ne s'afficheront pas en production
- Les notifications remplacent les alertes natives du navigateur

## 🔧 Utilisation des nouveaux utilitaires

### Logger
```javascript
import logger from '../utils/logger';

logger.log('Message de debug'); // Seulement en dev
logger.warn('Avertissement'); // Seulement en dev
logger.error('Erreur'); // Toujours loggé
```

### Notifications
```javascript
import notify from '../utils/notifications';

notify.success('Opération réussie');
notify.error('Une erreur est survenue');
notify.warning('Attention');
notify.info('Information');

// Pour les confirmations
const confirmed = await notify.confirm('Êtes-vous sûr ?');
```

## ✅ Checklist finale

- [x] URL de l'API configurée via variables d'environnement
- [x] Système de logging conditionnel créé
- [x] Système de notifications créé
- [x] QuoteStatusPage nettoyé
- [x] RolesPage nettoyé
- [x] AdminPage nettoyé
- [ ] Autres pages à nettoyer (optionnel)
- [ ] Tests finaux
- [ ] Déploiement

