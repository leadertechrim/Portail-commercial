# 🚀 Configuration Backend Flask pour APLOFR

## 📋 **Vue d'Ensemble**

Ce backend Flask remplace le stockage localStorage par une base de données MongoDB avec des APIs REST complètes.

### **APIs Créées :**

- **Catégories de Liens** : `/api/link-categories`
- **Catégories d'Offres** : `/api/offer-categories`
- **Liens Utiles** : `/api/links`
- **Statuts de Devis** : `/api/quote-statuses`
- **Statuts de Factures** : `/api/invoice-statuses`
- **Statuts d'Offres** : `/api/offer-statuses`

## 🛠️ **Installation**

### **1. Prérequis**

```bash
# Python 3.8+ et MongoDB installés
python --version
mongod --version
```

### **2. Installation des Dépendances**

```bash
cd backend
pip install -r requirements.txt
```

### **3. Configuration MongoDB**

```bash
# Démarrer MongoDB
mongod

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **4. Variables d'Environnement**

```bash
# Créer .env dans backend/
cp env_example.txt .env

# Éditer .env avec vos paramètres
MONGODB_URI=mongodb://localhost:27017/aplofr
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
```

### **5. Migration des Données**

```bash
# Insérer les données d'exemple
python scripts/migrate_data.py
```

### **6. Démarrage du Serveur**

```bash
# Mode développement
python run.py

# Ou directement
python app.py
```

## 📊 **Collections MongoDB**

### **1. link_categories**

```python
{
    "_id": ObjectId,
    "nom": str,              # "Moteurs de recherche"
    "description": str,       # "Sites de recherche et navigation"
    "couleur": str,          # "#007bff"
    "ordre": int,            # 1
    "createdAt": datetime,
    "updatedAt": datetime
}
```

### **2. offer_categories**

```python
{
    "_id": ObjectId,
    "nom": str,              # "Informatique"
    "description": str,      # "Offres liées à l'informatique"
    "couleur": str,          # "#007bff"
    "ordre": int,            # 1
    "createdAt": datetime,
    "updatedAt": datetime
}
```

### **3. links**

```python
{
    "_id": ObjectId,
    "nom": str,              # "Google"
    "url": str,              # "https://www.google.com"
    "categorie": str,        # "Moteurs de recherche"
    "description": str,      # "Moteur de recherche principal"
    "ordre": int,            # 1
    "createdAt": datetime,
    "updatedAt": datetime
}
```

### **4. quote_statuses**

```python
{
    "_id": ObjectId,
    "nom": str,              # "Validé"
    "couleur": str,          # "#28a745"
    "description": str,      # "Devis validé par le client"
    "ordre": int,            # 1
    "createdAt": datetime,
    "updatedAt": datetime
}
```

### **5. invoice_statuses**

```python
{
    "_id": ObjectId,
    "nom": str,              # "A envoyer au client"
    "couleur": str,          # "#ffc107"
    "description": str,      # "Facture prête à être envoyée"
    "ordre": int,            # 1
    "createdAt": datetime,
    "updatedAt": datetime
}
```

### **6. offer_statuses**

```python
{
    "_id": ObjectId,
    "nom": str,              # "Non préparée"
    "couleur": str,          # "#dc3545"
    "description": str,      # "Offre non préparée"
    "ordre": int,            # 1
    "createdAt": datetime,
    "updatedAt": datetime
}
```

## 🔌 **Endpoints API**

### **Catégories de Liens**

```bash
GET    /api/link-categories          # Récupérer toutes les catégories
GET    /api/link-categories/:id      # Récupérer une catégorie
POST   /api/link-categories          # Créer une catégorie
PUT    /api/link-categories/:id      # Modifier une catégorie
DELETE /api/link-categories/:id      # Supprimer une catégorie
```

### **Catégories d'Offres**

```bash
GET    /api/offer-categories         # Récupérer toutes les catégories
GET    /api/offer-categories/:id     # Récupérer une catégorie
POST   /api/offer-categories         # Créer une catégorie
PUT    /api/offer-categories/:id     # Modifier une catégorie
DELETE /api/offer-categories/:id     # Supprimer une catégorie
```

### **Liens Utiles**

```bash
GET    /api/links                    # Récupérer tous les liens
GET    /api/links?categorie=...      # Filtrer par catégorie
GET    /api/links/:id                # Récupérer un lien
POST   /api/links                    # Créer un lien
PUT    /api/links/:id                # Modifier un lien
DELETE /api/links/:id                # Supprimer un lien
```

### **Statuts de Devis**

```bash
GET    /api/quote-statuses           # Récupérer tous les statuts
GET    /api/quote-statuses/:id       # Récupérer un statut
POST   /api/quote-statuses           # Créer un statut
PUT    /api/quote-statuses/:id       # Modifier un statut
DELETE /api/quote-statuses/:id       # Supprimer un statut
```

### **Statuts de Factures**

```bash
GET    /api/invoice-statuses         # Récupérer tous les statuts
GET    /api/invoice-statuses/:id     # Récupérer un statut
POST   /api/invoice-statuses         # Créer un statut
PUT    /api/invoice-statuses/:id     # Modifier un statut
DELETE /api/invoice-statuses/:id     # Supprimer un statut
```

### **Statuts d'Offres**

```bash
GET    /api/offer-statuses           # Récupérer tous les statuts
GET    /api/offer-statuses/:id      # Récupérer un statut
POST   /api/offer-statuses           # Créer un statut
PUT    /api/offer-statuses/:id      # Modifier un statut
DELETE /api/offer-statuses/:id      # Supprimer un statut
```

## 📝 **Exemples d'Utilisation**

### **Créer une Catégorie de Lien**

```bash
curl -X POST http://localhost:5000/api/link-categories \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Formation",
    "description": "Liens vers des plateformes de formation",
    "couleur": "#6f42c1",
    "ordre": 5
  }'
```

### **Récupérer Tous les Liens**

```bash
curl http://localhost:5000/api/links
```

### **Créer un Statut de Devis**

```bash
curl -X POST http://localhost:5000/api/quote-statuses \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "En négociation",
    "couleur": "#17a2b8",
    "description": "Devis en cours de négociation",
    "ordre": 5
  }'
```

## 🔄 **Migration Frontend**

### **1. Remplacer localStorage par API**

```javascript
// Avant (localStorage)
const categories = JSON.parse(localStorage.getItem("linkCategories"));

// Après (API)
import { linkCategoriesAPI } from "./api-backend";
const categories = await linkCategoriesAPI.getAll();
```

### **2. Mise à Jour des Composants**

```javascript
// Exemple pour LinkCategoriesPage
const loadCategories = useCallback(async () => {
  try {
    const categories = await linkCategoriesAPI.getAll();
    setCategories(categories);
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
  }
}, []);
```

### **3. Gestion des Erreurs**

```javascript
const handleCreateCategory = async (categoryData) => {
  try {
    const newCategory = await linkCategoriesAPI.create(categoryData);
    setCategories([...categories, newCategory]);
    alert("Catégorie créée avec succès");
  } catch (error) {
    alert(`Erreur: ${error.message}`);
  }
};
```

## 🚀 **Déploiement**

### **1. Variables d'Environnement Production**

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/aplofr
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_PORT=5000
```

### **2. Build Frontend**

```bash
cd ../
npm run build
```

### **3. Démarrage Production**

```bash
cd backend
python app.py
```

## 🧪 **Tests**

### **Test de Connexion**

```bash
curl http://localhost:5000/api/test
```

### **Test des Données**

```bash
# Vérifier les catégories de liens
curl http://localhost:5000/api/link-categories

# Vérifier les liens
curl http://localhost:5000/api/links

# Vérifier les statuts de devis
curl http://localhost:5000/api/quote-statuses
```

## 📊 **Avantages du Backend Flask**

### **Persistance :**

- ✅ **Données partagées** entre tous les utilisateurs
- ✅ **Sauvegarde automatique** dans MongoDB
- ✅ **Historique** avec timestamps
- ✅ **Sécurité** avec validation des données

### **Performance :**

- ✅ **APIs optimisées** avec validation
- ✅ **Gestion d'erreurs** centralisée
- ✅ **Logs** pour le debugging
- ✅ **Scalabilité** avec MongoDB

### **Maintenance :**

- ✅ **Code organisé** avec routes séparées
- ✅ **Documentation** complète
- ✅ **Exemples** de données inclus
- ✅ **Scripts** de migration

## 🐍 **Structure du Projet**

```
backend/
├── app.py                    # Application Flask principale
├── run.py                    # Script de démarrage
├── requirements.txt          # Dépendances Python
├── env_example.txt           # Exemple de configuration
├── data/
│   └── mongodb_examples.py   # Données d'exemple
├── scripts/
│   └── migrate_data.py       # Script de migration
└── FLASK_BACKEND_SETUP.md    # Documentation
```

## 🔧 **Commandes Utiles**

```bash
# Installer les dépendances
pip install -r requirements.txt

# Migrer les données
python scripts/migrate_data.py

# Démarrer le serveur
python run.py

# Tester l'API
curl http://localhost:5000/api/test
```

**🎉 Le backend Flask est maintenant prêt pour remplacer localStorage !**

