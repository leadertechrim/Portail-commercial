# Guide de Diagnostic "Failed to fetch" sur Vercel

## 🚨 Problème

L'application déployée sur Vercel affiche "Failed to fetch" lors des tentatives de connexion à l'API.

## 🔍 Diagnostic Étape par Étape

### **Étape 1 : Ouvrir la Console**

1. Ouvrez votre application déployée sur Vercel
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **"Console"**

### **Étape 2 : Exécuter le Script de Diagnostic**

1. Copiez le contenu du fichier `diagnostic-failed-fetch.js`
2. Collez-le dans la console et appuyez sur **Entrée**
3. Regardez les résultats des 4 tests

### **Étape 3 : Analyser les Résultats**

#### **Test 1 - URLs Configurées**

- ✅ **Normal** : Les URLs s'affichent correctement
- ❌ **Problème** : URLs incorrectes ou undefined

#### **Test 2 - Connectivité Backend**

- ✅ **Normal** : Status 200, données reçues
- ❌ **Problème CORS** : Erreur de réseau, CORS policy
- ❌ **Problème Réseau** : Timeout, DNS error

#### **Test 3 - Login Endpoint**

- ✅ **Normal** : Status 401/400 (utilisateur non trouvé)
- ❌ **Problème** : Erreur de réseau, CORS

#### **Test 4 - API avec Token**

- ✅ **Normal** : Status 200/401 selon le token
- ❌ **Problème** : Token invalide, CORS, réseau

## 🔧 Solutions selon le Diagnostic

### **Si Test 2 échoue (CORS)**

Le backend Railway n'autorise pas votre domaine Vercel.

**Solution :**

1. Contactez l'administrateur du backend Railway
2. Demandez d'ajouter votre domaine Vercel dans la configuration CORS
3. Exemple de domaine à ajouter : `https://your-app.vercel.app`

### **Si Test 2 réussit mais Test 3/4 échouent**

Problème spécifique aux endpoints avec données.

**Solutions :**

1. Vérifiez les headers CORS du backend
2. Vérifiez la configuration des méthodes HTTP autorisées
3. Vérifiez les headers `Content-Type` et `Authorization`

### **Si tous les tests échouent**

Problème de connectivité réseau.

**Solutions :**

1. Vérifiez que Railway est accessible depuis votre navigateur
2. Testez avec un autre navigateur
3. Vérifiez les paramètres de proxy/firewall

## 🧪 Tests Manuels Supplémentaires

### **Test Direct dans le Navigateur**

Ouvrez directement dans votre navigateur :

```
https://applesoffres-production.up.railway.app/api/test
```

**Résultat attendu :**

```json
{ "message": "Backend fonctionne correctement", "status": "API OK" }
```

### **Test avec curl (si disponible)**

```bash
curl -X GET https://applesoffres-production.up.railway.app/api/test
```

## 📋 Checklist de Vérification

- [ ] Backend Railway accessible directement
- [ ] URLs correctes dans la console
- [ ] Pas d'erreurs CORS dans la console
- [ ] Token valide (si applicable)
- [ ] Headers corrects dans les requêtes
- [ ] Pas de problèmes de réseau local

## 🆘 Support

Si le problème persiste après ces tests :

1. **Partagez les résultats** du script de diagnostic
2. **Vérifiez les logs Vercel** dans le dashboard
3. **Vérifiez les logs Railway** pour le backend
4. **Testez depuis un autre réseau** (mobile, autre WiFi)

## 🔄 Prochaines Étapes

Une fois le diagnostic terminé :

1. Identifiez la cause exacte du problème
2. Appliquez la solution appropriée
3. Testez à nouveau l'application
4. Confirmez que le problème est résolu

