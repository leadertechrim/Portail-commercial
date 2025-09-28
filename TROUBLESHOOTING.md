# 🔧 Guide de Dépannage - Erreur "Failed to fetch"

## ❌ Problème

```
Erreur lors de la création du devis: Failed to fetch
Erreur lors de la création de la facture: Failed to fetch
```

## 🔍 Diagnostic

### 1. Vérifiez que le backend est démarré

```bash
# Dans le terminal de votre backend Python
python app.py
# ou
python main.py
# ou
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Vous devriez voir quelque chose comme :

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
INFO:     Started server process
```

### 2. Testez l'URL du backend

Ouvrez votre navigateur et allez à :

```
http://127.0.0.1:8000
```

Vous devriez voir une réponse du serveur.

### 3. Testez l'endpoint des devis

```
http://127.0.0.1:8000/api/devis
```

## 🛠️ Solutions

### Solution 1 : Vérifier le port

Si votre backend utilise un autre port (par exemple 5000), modifiez dans `src/api.js` :

```javascript
const API_BASE_URL = "http://127.0.0.1:5000"; // Changez le port
```

### Solution 2 : Vérifier l'adresse IP

Si vous utilisez une autre adresse :

```javascript
const API_BASE_URL = "http://localhost:8000";
// ou
const API_BASE_URL = "http://0.0.0.0:8000";
```

### Solution 3 : Vérifier CORS

Dans votre backend Python, assurez-vous que CORS est configuré :

```python
from flask_cors import CORS
# ou pour FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Solution 4 : Vérifier les routes

Assurez-vous que vos routes backend existent :

- `GET /api/devis`
- `POST /api/devis`
- `GET /api/factures`
- `POST /api/factures`

### Solution 5 : Vérifier l'authentification

Assurez-vous que votre token est valide et que l'authentification fonctionne.

## 🔍 Test dans le Frontend

1. **Connectez-vous en tant qu'admin**
2. **Allez dans la page Devis**
3. **Utilisez le bouton "🔍 Tester la Connexion Backend"**
4. **Vérifiez les logs dans la console du navigateur (F12)**

## 📋 Checklist

- [ ] Backend démarré et accessible sur http://127.0.0.1:8000
- [ ] CORS configuré correctement
- [ ] Routes API existantes
- [ ] Token d'authentification valide
- [ ] Pas de firewall bloquant le port 8000
- [ ] URL correcte dans le frontend

## 🚨 Erreurs courantes

### "Connection refused"

- Le backend n'est pas démarré
- Mauvais port ou adresse IP

### "CORS error"

- CORS mal configuré dans le backend
- Origine non autorisée

### "404 Not Found"

- Route API inexistante
- Mauvaise URL

### "401 Unauthorized"

- Token invalide ou expiré
- Problème d'authentification

