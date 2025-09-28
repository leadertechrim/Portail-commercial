# 🚀 Guide de Déploiement

## 📋 Configuration des URLs API

### **Variables d'Environnement**

Pour configurer les URLs API selon l'environnement, utilisez les variables d'environnement suivantes :

#### **Production (Défaut)**

```bash
# Pas de variables d'environnement nécessaires
# L'application utilise automatiquement :
# - API_BASE_URL: https://applesoffres-production.up.railway.app
# - FLASK_API_BASE_URL: https://applesoffres-production.up.railway.app/api
```

#### **Développement Local**

```bash
# Créez un fichier .env.local dans le dossier src/
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_FLASK_API_URL=http://localhost:8000/api
```

### **Configuration dans api.js**

```javascript
// URL de base pour toutes les APIs (configuration dynamique)
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://applesoffres-production.up.railway.app";

// URL de base pour les APIs Flask (configuration dynamique)
const FLASK_API_BASE_URL =
  process.env.REACT_APP_FLASK_API_URL ||
  "https://applesoffres-production.up.railway.app/api";
```

## 🔧 Résolution des Problèmes

### **Problème : "Votre panier est vide" après déploiement**

#### **Causes Possibles :**

1. **URLs API incorrectes** ✅ **Résolu**

   - Les URLs de debug utilisaient encore l'URL locale
   - Maintenant toutes les URLs utilisent la configuration dynamique

2. **Backend non accessible**

   - Vérifiez que le backend est démarré sur Railway
   - Utilisez les boutons de debug pour tester la connectivité

3. **Problème d'authentification**
   - Vérifiez que le token est présent
   - Testez la connexion avec les boutons de debug

#### **Solutions :**

1. **Test de Connectivité**

   ```
   Cliquez sur "🔍 Test Backend" pour vérifier l'accessibilité
   ```

2. **Test de l'API**

   ```
   Cliquez sur "🧪 Tester l'API" pour voir les données reçues
   ```

3. **Vérification des Logs**
   ```
   Ouvrez la console (F12) pour voir les logs détaillés
   ```

## 📱 Déploiement

### **Railway (Recommandé)**

1. **Configuration automatique**

   - Les URLs sont pré-configurées pour Railway
   - Pas de variables d'environnement nécessaires

2. **Variables d'environnement optionnelles**
   ```bash
   REACT_APP_API_URL=https://votre-backend.railway.app
   REACT_APP_FLASK_API_URL=https://votre-backend.railway.app/api
   ```

### **Autres Plateformes**

1. **Netlify**

   ```bash
   REACT_APP_API_URL=https://votre-backend.com
   REACT_APP_FLASK_API_URL=https://votre-backend.com/api
   ```

2. **Vercel**
   ```bash
   REACT_APP_API_URL=https://votre-backend.com
   REACT_APP_FLASK_API_URL=https://votre-backend.com/api
   ```

## 🧪 Tests de Debug

### **Boutons de Debug Disponibles**

1. **🔍 Test Backend** - Vérifie la connectivité
2. **🧪 Tester l'API** - Teste l'API des offres
3. **📝 Créer Test** - Crée une offre de test
4. **🔍 Test Filtrage** - Teste le localStorage
5. **🧪 Créer Tests Alertes** - Teste les alertes
6. **🧪 Test Demain (J-1)** - Teste une alerte demain

### **Logs de Debug**

Tous les tests affichent des logs détaillés dans la console :

- ✅ Succès avec données
- ❌ Erreurs avec détails
- 🔑 État du token d'authentification
- 🌐 URLs utilisées

## 🎯 Vérifications Post-Déploiement

1. **✅ Backend accessible** - Test Backend retourne OK
2. **✅ API fonctionnelle** - Tester l'API retourne des données
3. **✅ Authentification** - Token présent et valide
4. **✅ Données chargées** - Les offres s'affichent correctement

## 🔄 Rollback en Cas de Problème

Si vous devez revenir au développement local :

1. **Modifiez api.js**

   ```javascript
   const API_BASE_URL = "http://127.0.0.1:8000";
   const FLASK_API_BASE_URL = "http://localhost:8000/api";
   ```

2. **Redéployez**
   ```bash
   npm run build
   # Déployez la nouvelle version
   ```

---

**🎉 Votre application est maintenant configurée pour fonctionner en production et en développement !**
