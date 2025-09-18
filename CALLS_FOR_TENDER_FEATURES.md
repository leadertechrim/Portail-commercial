# 🎯 Fonctionnalités des Appels d'Offres

## 📋 Vue d'ensemble

Le système de gestion des appels d'offres permet aux utilisateurs et administrateurs d'ajouter, modifier et gérer des appels d'offres avec leurs détails complets.

## 🚀 Nouvelles Fonctionnalités

### 1. **Mon Panier dans le Sidebar**

- **Emplacement** : Sidebar gauche, toujours visible
- **Fonctionnalités** :
  - Affichage du nombre d'éléments dans le panier
  - Bouton "Vider" pour supprimer tous les éléments
  - Design moderne avec compteur coloré

### 2. **Ajout d'Appels d'Offres**

- **Accès** : Bouton "Ajouter Appel d'Offres" dans le sidebar
- **Disponible pour** : Tous les utilisateurs (admin et utilisateurs normaux)
- **Modal moderne** avec formulaire complet

### 3. **Formulaire d'Ajout d'Appels d'Offres**

#### **Champs Obligatoires** :

- **Titre** : Nom de l'appel d'offres
- **Source** : Origine de l'appel d'offres
- **Client** : Nom du client
- **État** : Statut de l'appel d'offres
- **Date limite** : Date d'échéance

#### **Champs Optionnels** :

- **Description** : Détails de l'appel d'offres
- **Pièces jointes** : Fichiers PDF, DOC, XLS, images

#### **États Disponibles** :

- Ouvert
- En cours
- Fermé
- Attribué
- Annulé

### 4. **Gestion des Pièces Jointes**

- **Types supportés** : PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
- **Upload multiple** : Possibilité d'ajouter plusieurs fichiers
- **Prévisualisation** : Liste des fichiers sélectionnés
- **Suppression** : Bouton pour retirer des fichiers avant envoi

## 🎨 Interface Utilisateur

### **Sidebar Amélioré**

```
┌─────────────────────────┐
│ 🏠 Accueil              │
│ 👥 Gestion Utilisateurs │ (Admin seulement)
├─────────────────────────┤
│ 🛒 Mon Panier (3)       │
│    [Vider]              │
├─────────────────────────┤
│ ➕ Ajouter Appel d'Offres │
└─────────────────────────┘
```

### **Modal d'Ajout**

- **Design moderne** : Gradient orange, bordures arrondies
- **Validation en temps réel** : Messages d'erreur instantanés
- **Responsive** : S'adapte aux mobiles et tablettes
- **Animations** : Transitions fluides et effets hover

## 🔧 API Backend

### **Endpoints Disponibles**

#### **GET /api/calls-for-tender**

- Récupère tous les appels d'offres de l'utilisateur
- Retourne la liste sans les pièces jointes (optimisation)

#### **POST /api/calls-for-tender**

- Crée un nouvel appel d'offres
- Accepte les données multipart/form-data
- Gère l'upload des pièces jointes

#### **PUT /api/calls-for-tender/:id**

- Modifie un appel d'offres existant
- Vérifie les permissions (créateur ou admin)
- Ajoute les nouvelles pièces jointes

#### **DELETE /api/calls-for-tender/:id**

- Supprime un appel d'offres
- Supprime automatiquement les fichiers joints
- Vérifie les permissions

#### **GET /api/calls-for-tender/:id/attachment/:filename**

- Télécharge une pièce jointe
- Vérifie les permissions d'accès

### **Sécurité**

- **Authentification JWT** : Tous les endpoints protégés
- **Autorisation** : Vérification des rôles et propriétaires
- **Validation** : Contrôle des champs obligatoires
- **Upload sécurisé** : Validation des types de fichiers

## 📱 Responsive Design

### **Desktop**

- Sidebar fixe de 280px
- Modal centrée avec largeur maximale
- Formulaire en colonnes multiples

### **Mobile**

- Sidebar masqué
- Modal en pleine largeur
- Formulaire en colonne unique
- Boutons tactiles optimisés

## 🗂️ Structure des Données

### **Appel d'Offres**

```json
{
  "_id": "ObjectId",
  "title": "Titre de l'appel d'offres",
  "source": "Source de l'appel",
  "client": "Nom du client",
  "state": "État actuel",
  "description": "Description détaillée",
  "deadline": "2024-12-31",
  "attachments": [
    {
      "filename": "document.pdf",
      "path": "/uploads/document.pdf",
      "size": 1024000
    }
  ],
  "createdBy": "ObjectId utilisateur",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🚀 Installation et Configuration

### **Frontend**

1. Les composants sont déjà intégrés dans le sidebar
2. Les styles CSS sont inclus
3. Les fonctions API sont disponibles

### **Backend**

1. Ajouter le code `backend_calls_for_tender.py` à votre serveur Flask
2. Créer la collection MongoDB `calls_for_tender`
3. Configurer le dossier d'upload des fichiers
4. Ajouter les imports nécessaires (os, secure_filename, send_file)

### **Configuration MongoDB**

```python
# Dans votre fichier principal Flask
calls_col = db.calls_for_tender

# Configuration du dossier d'upload
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
```

## 🎯 Avantages

1. **Accessibilité** : Interface toujours visible dans le sidebar
2. **Simplicité** : Formulaire intuitif et guidé
3. **Flexibilité** : Gestion des pièces jointes multiples
4. **Sécurité** : Contrôle des permissions et validation
5. **Responsive** : Fonctionne sur tous les appareils
6. **Performance** : Optimisation des requêtes et uploads

## 🔮 Prochaines Améliorations

- [ ] Liste des appels d'offres dans une page dédiée
- [ ] Filtres et recherche avancée
- [ ] Notifications de rappel
- [ ] Export des données
- [ ] Statistiques et rapports
- [ ] Workflow d'approbation



