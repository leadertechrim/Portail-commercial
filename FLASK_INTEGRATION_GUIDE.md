# 🔗 Guide d'Intégration Flask

## 📋 **Configuration**

### **Variables d'Environnement**

Créez un fichier `.env` dans le répertoire racine avec :

```bash
# Configuration des APIs Flask
REACT_APP_FLASK_API_URL=http://localhost:8000/api

# Configuration des APIs existantes (si nécessaire)
# REACT_APP_API_URL=http://127.0.0.1:8000
```

### **URLs par Défaut**

- **APIs Flask** : `http://localhost:8000/api`
- **APIs existantes** : `http://127.0.0.1:8000`

## 🔄 **APIs Intégrées**

### **Catégories de Liens**

- `linkCategoriesAPI.getAll()`
- `linkCategoriesAPI.create(data)`
- `linkCategoriesAPI.update(id, data)`
- `linkCategoriesAPI.delete(id)`

### **Catégories d'Offres**

- `offerCategoriesAPI.getAll()`
- `offerCategoriesAPI.create(data)`
- `offerCategoriesAPI.update(id, data)`
- `offerCategoriesAPI.delete(id)`

### **Liens Utiles**

- `linksAPI.getAll(categorie?)`
- `linksAPI.create(data)`
- `linksAPI.update(id, data)`
- `linksAPI.delete(id)`

### **Statuts de Devis**

- `quoteStatusesAPI.getAll()`
- `quoteStatusesAPI.create(data)`
- `quoteStatusesAPI.update(id, data)`
- `quoteStatusesAPI.delete(id)`

### **Statuts de Factures**

- `invoiceStatusesAPI.getAll()`
- `invoiceStatusesAPI.create(data)`
- `invoiceStatusesAPI.update(id, data)`
- `invoiceStatusesAPI.delete(id)`

### **Statuts d'Offres**

- `offerStatusesAPI.getAll()`
- `offerStatusesAPI.create(data)`
- `offerStatusesAPI.update(id, data)`
- `offerStatusesAPI.delete(id)`

## 🧪 **Test de Connexion**

```javascript
import { apiUtils } from "./api";

// Tester la connexion Flask
const testConnection = async () => {
  try {
    const result = await apiUtils.testFlaskConnection();
    console.log("✅ Connexion Flask OK:", result);
  } catch (error) {
    console.error("❌ Erreur connexion Flask:", error);
  }
};
```

## 📁 **Fichiers Modifiés**

### **Pages Mises à Jour :**

- ✅ `src/pages/LinkCategoriesPage.js`
- ✅ `src/pages/OfferCategoriesPage.js`
- ✅ `src/pages/LinksPage.js`

### **APIs Intégrées :**

- ✅ `src/api.js` (APIs Flask ajoutées)

### **Fichiers Supprimés :**

- ❌ `src/api-backend.js` (fusionné dans `api.js`)

## 🚀 **Démarrage**

### **1. Backend Flask**

```bash
cd backend
python run.py
```

### **2. Frontend React**

```bash
npm start
```

### **3. Test d'Intégration**

```bash
# Tester l'API Flask
curl http://localhost:8000/api/test

# Tester les catégories
curl http://localhost:8000/api/link-categories
```

## 🔧 **Dépannage**

### **Erreur de Connexion**

- Vérifiez que le backend Flask est démarré sur le port 8000
- Vérifiez la variable `REACT_APP_FLASK_API_URL` dans `.env`

### **Erreur CORS**

- Le backend Flask doit avoir CORS activé
- Vérifiez la configuration dans `backend/app.py`

### **Fallback LocalStorage**

- En cas d'erreur API, le frontend utilise les données locales
- Les données sont sauvegardées dans localStorage comme fallback

## 📊 **Avantages**

- ✅ **APIs unifiées** dans un seul fichier `api.js`
- ✅ **Configuration flexible** avec variables d'environnement
- ✅ **Fallback robuste** vers localStorage
- ✅ **Gestion d'erreurs** améliorée
- ✅ **Code maintenable** et organisé

**🎉 L'intégration Flask est maintenant complète !**
