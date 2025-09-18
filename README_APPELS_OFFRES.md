# 🛒 Système de Gestion des Appels d'Offres

## 📋 Vue d'ensemble

Ce système permet de gérer les appels d'offres avec les fonctionnalités suivantes :

- ✅ Création d'appels d'offres
- ✅ Modification et suppression
- ✅ Upload de fichiers joints
- ✅ Gestion des statuts
- ✅ Interface utilisateur moderne

## 🚀 Installation et Configuration

### 1. Backend (Flask + MongoDB)

#### Ajouter les routes dans votre backend principal :

```python
# Dans votre fichier app.py ou main.py
from backend_calls_for_tender import *

# Ajouter la collection MongoDB
calls_col = db["calls_for_tender"]
```

#### Créer le dossier uploads :

```bash
mkdir uploads
```

### 2. Frontend (React)

Le frontend est déjà configuré avec :

- ✅ Page "Mon Panier" (`/cart`)
- ✅ Modals de création/édition
- ✅ Gestion des fichiers
- ✅ Interface responsive

## 📁 Structure des Fichiers

```
backend_calls_for_tender.py    # Routes backend
INTEGRATION_BACKEND.md         # Instructions d'intégration
test_calls_api.py             # Script de test
README_APPELS_OFFRES.md       # Ce fichier
```

## 🔧 Configuration de l'API

### URL de l'API

Dans `src/api.js`, configurez l'URL de votre backend :

```javascript
// Pour développement local
const API_BASE_URL = "http://127.0.0.1:8000";

// Pour production (Railway)
const API_BASE_URL = "https://applesoffres-production.up.railway.app";
```

## 📊 Structure de la Base de Données

### Collection `calls_for_tender`

```json
{
  "_id": "ObjectId",
  "title": "Titre de l'appel d'offres",
  "source": "Source de l'appel",
  "client": "Nom du client",
  "state": "open|in-progress|closed|awarded|cancelled",
  "description": "Description détaillée",
  "deadline": "2024-12-31T00:00:00Z",
  "attachments": [
    {
      "filename": "document.pdf",
      "filepath": "uploads/document.pdf",
      "uploaded_at": "2024-01-01T00:00:00Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "createdBy": "user_id",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🛠️ Routes API Disponibles

| Méthode  | Route                                              | Description                        |
| -------- | -------------------------------------------------- | ---------------------------------- |
| `GET`    | `/api/calls-for-tender`                            | Récupérer tous les appels d'offres |
| `POST`   | `/api/calls-for-tender`                            | Créer un nouvel appel d'offres     |
| `PUT`    | `/api/calls-for-tender/<id>`                       | Modifier un appel d'offres         |
| `DELETE` | `/api/calls-for-tender/<id>`                       | Supprimer un appel d'offres        |
| `GET`    | `/api/calls-for-tender/<id>/attachment/<filename>` | Télécharger une pièce jointe       |
| `GET`    | `/api/calls-for-tender/stats`                      | Obtenir les statistiques           |

## 🔐 Permissions

- **Tous les utilisateurs** : Peuvent voir et créer des appels d'offres
- **Créateur ou Admin** : Peuvent modifier/supprimer leurs propres appels d'offres
- **Admin uniquement** : Peuvent modifier/supprimer tous les appels d'offres

## 🧪 Tests

### Tester l'API avec le script Python :

```bash
python test_calls_api.py
```

### Tester manuellement avec curl :

```bash
# Récupérer les appels d'offres
curl -X GET http://localhost:8000/api/calls-for-tender \
  -H "Authorization: Bearer YOUR_TOKEN"

# Créer un appel d'offres
curl -X POST http://localhost:8000/api/calls-for-tender \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Appel" \
  -F "source=Test Source" \
  -F "client=Test Client" \
  -F "state=open" \
  -F "deadline=2024-12-31"
```

## 🎨 Interface Utilisateur

### Page "Mon Panier" (`/cart`)

- 📋 Liste des appels d'offres
- ➕ Bouton "Ajouter Appel d'Offres"
- ✏️ Actions d'édition/suppression
- 📎 Gestion des pièces jointes

### Modal de Création/Édition

- 📝 Formulaire complet
- 📎 Upload de fichiers
- 🎯 Validation des données
- 🎨 Interface moderne

## 🔧 Dépannage

### Erreur CORS

```python
# Dans votre backend
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000"])
```

### Erreur 401 (Unauthorized)

- Vérifiez que le token JWT est valide
- Vérifiez le header `Authorization: Bearer <token>`

### Erreur 500 (Server Error)

- Vérifiez que la collection `calls_for_tender` existe
- Vérifiez que le dossier `uploads/` existe et est accessible

### Fichiers non uploadés

- Vérifiez les permissions du dossier `uploads/`
- Vérifiez que le type de fichier est autorisé

## 📱 Utilisation

1. **Accéder au panier** : Cliquez sur "Mon Panier" dans la sidebar
2. **Ajouter un appel** : Cliquez sur "Ajouter Appel d'Offres"
3. **Remplir le formulaire** : Titre, source, client, statut, description, échéance
4. **Ajouter des fichiers** : Glissez-déposez ou sélectionnez des fichiers
5. **Sauvegarder** : Cliquez sur "Ajouter"

## 🎯 Fonctionnalités Avancées

- 📊 **Statistiques** : Vue d'ensemble des appels d'offres
- 🔍 **Recherche** : Filtrage par statut, client, etc.
- 📎 **Gestion des fichiers** : Upload, téléchargement, suppression
- 👥 **Permissions** : Gestion des accès par rôle
- 📱 **Responsive** : Interface adaptée mobile/desktop

## 🚀 Prochaines Étapes

1. Intégrer les routes dans votre backend principal
2. Tester avec le script de test
3. Vérifier l'interface utilisateur
4. Configurer les permissions selon vos besoins
5. Déployer en production

---

**Note** : Assurez-vous que votre backend MongoDB est accessible et que les collections sont correctement configurées avant de tester l'interface.



