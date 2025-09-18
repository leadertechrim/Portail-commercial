# Intégration des Routes Appels d'Offres dans le Backend

## 📋 Instructions d'Intégration

### 1. Ajouter la Collection MongoDB

Dans votre fichier backend principal (probablement `app.py` ou `main.py`), ajoutez la collection pour les appels d'offres :

```python
# Ajouter après les autres collections
calls_col = db["calls_for_tender"]
```

### 2. Importer les Routes

Ajoutez cette ligne dans votre fichier backend principal :

```python
# Importer les routes des appels d'offres
from backend_calls_for_tender import *
```

### 3. Configuration CORS

Assurez-vous que votre backend a la configuration CORS correcte :

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://your-frontend-domain.com"])
```

### 4. Structure de la Collection MongoDB

La collection `calls_for_tender` aura cette structure :

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

### 5. Routes Disponibles

- `GET /api/calls-for-tender` - Récupérer tous les appels d'offres
- `POST /api/calls-for-tender` - Créer un nouvel appel d'offres
- `PUT /api/calls-for-tender/<id>` - Modifier un appel d'offres
- `DELETE /api/calls-for-tender/<id>` - Supprimer un appel d'offres
- `GET /api/calls-for-tender/<id>/attachment/<filename>` - Télécharger une pièce jointe
- `GET /api/calls-for-tender/stats` - Obtenir les statistiques

### 6. Permissions

- **Tous les utilisateurs** : Peuvent voir et créer des appels d'offres
- **Créateur ou Admin** : Peuvent modifier/supprimer leurs propres appels d'offres
- **Admin uniquement** : Peuvent modifier/supprimer tous les appels d'offres

### 7. Gestion des Fichiers

- Les fichiers sont stockés dans le dossier `uploads/`
- Types de fichiers autorisés : PDF, images, documents Office
- Noms de fichiers sécurisés avec `secure_filename()`

### 8. Test des Routes

Pour tester si les routes fonctionnent :

```bash
# Test de récupération (avec un token valide)
curl -X GET http://localhost:8000/api/calls-for-tender \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test de création
curl -X POST http://localhost:8000/api/calls-for-tender \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Appel" \
  -F "source=Test Source" \
  -F "client=Test Client" \
  -F "state=open" \
  -F "deadline=2024-12-31"
```

## 🔧 Dépannage

### Erreur CORS

- Vérifiez que `CORS` est configuré avec les bonnes origines
- Ajoutez `http://localhost:3000` dans les origines autorisées

### Erreur 401 (Unauthorized)

- Vérifiez que le token JWT est valide
- Vérifiez que le token est envoyé dans le header `Authorization: Bearer <token>`

### Erreur 500 (Server Error)

- Vérifiez que la collection `calls_for_tender` existe dans MongoDB
- Vérifiez que le dossier `uploads/` existe et est accessible en écriture

### Fichiers non uploadés

- Vérifiez que le dossier `uploads/` existe
- Vérifiez les permissions d'écriture
- Vérifiez que le type de fichier est autorisé



