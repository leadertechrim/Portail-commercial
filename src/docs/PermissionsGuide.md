# Guide du Système de Permissions Dynamique

## 🎯 Vue d'ensemble

Ce système permet une gestion dynamique des rôles et permissions, similaire aux autres fonctionnalités de l'application (clients, devis, factures, etc.).

## 🔧 Fonctionnalités

### ✅ **Ce qui est maintenant possible :**

1. **Gestion dynamique des rôles** via API
2. **Vérification granulaire des permissions**
3. **Composants de garde pour l'interface**
4. **Fallback vers les permissions par défaut**
5. **Hooks pour la gestion des permissions**

## 📋 Permissions disponibles

### **Offres**

- `view_offers` - Voir les offres

### **Devis**

- `create_quotes` - Créer des devis
- `view_quotes` - Voir les devis
- `edit_quotes` - Modifier les devis
- `delete_quotes` - Supprimer les devis

### **Factures**

- `create_invoices` - Créer des factures
- `view_invoices` - Voir les factures
- `edit_invoices` - Modifier les factures
- `delete_invoices` - Supprimer les factures

### **Clients**

- `view_clients` - Voir les clients
- `edit_clients` - Modifier les clients
- `delete_clients` - Supprimer les clients

### **Personnel**

- `view_personnel` - Voir le personnel
- `edit_personnel` - Modifier le personnel

### **Partenaires**

- `view_partners` - Voir les partenaires
- `edit_partners` - Modifier les partenaires

### **Administration**

- `admin_settings` - Paramètres administrateur

## 🚀 Utilisation

### 1. **Hook usePermissions**

```javascript
import { usePermissions } from "../hooks/usePermissions";

const MyComponent = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    isAdmin,
  } = usePermissions();

  // Vérifier une permission
  if (hasPermission("edit_clients")) {
    // Afficher le bouton d'édition
  }

  // Vérifier plusieurs permissions (au moins une)
  if (hasAnyPermission(["edit_clients", "delete_clients"])) {
    // Afficher les actions
  }

  // Vérifier une action sur un module
  if (canPerformAction("clients", "edit")) {
    // L'utilisateur peut modifier les clients
  }
};
```

### 2. **Composant PermissionGuard**

```javascript
import PermissionGuard from '../components/PermissionGuard';

// Permission unique
<PermissionGuard permission="edit_clients">
  <button>Modifier</button>
</PermissionGuard>

// Plusieurs permissions
<PermissionGuard
  permissions={['edit_clients', 'delete_clients']}
  mode="any"
>
  <div>Actions disponibles</div>
</PermissionGuard>

// Avec fallback
<PermissionGuard
  permission="admin_settings"
  fallback={<div>Accès refusé</div>}
>
  <AdminPanel />
</PermissionGuard>
```

### 3. **Composant ModulePermissionGuard**

```javascript
import { ModulePermissionGuard } from "../components/PermissionGuard";

<ModulePermissionGuard module="clients" action="edit">
  <EditClientButton />
</ModulePermissionGuard>;
```

### 4. **Composant RoleGuard**

```javascript
import { RoleGuard } from '../components/PermissionGuard';

<RoleGuard role="admin">
  <AdminContent />
</RoleGuard>

<RoleGuard roles={['admin', 'commercial']}>
  <BusinessContent />
</RoleGuard>
```

## 🔄 API Backend

### **Endpoints disponibles :**

```javascript
// Rôles
GET    /api/roles                    // Récupérer tous les rôles
GET    /api/roles/:id               // Récupérer un rôle
POST   /api/roles                   // Créer un rôle
PUT    /api/roles/:id               // Modifier un rôle
DELETE /api/roles/:id               // Supprimer un rôle

// Permissions
GET    /api/permissions             // Permissions disponibles
GET    /api/user/permissions        // Permissions de l'utilisateur actuel
GET    /api/users/:id/permissions   // Permissions d'un utilisateur

// Assignation
POST   /api/users/:id/assign-role   // Assigner un rôle à un utilisateur
```

## 🛡️ Sécurité

### **Fallback sécurisé :**

- Si l'API n'est pas disponible, le système utilise les permissions par défaut
- Les administrateurs ont toujours accès complet
- Les spectateurs ont un accès limité par défaut

### **Permissions par rôle :**

```javascript
// Admin : Toutes les permissions
// Commercial : view_offers, create_quotes, view_quotes, create_invoices, view_invoices, view_clients
// Visiteur : view_offers, view_quotes
// Spectateur : view_offers
```

## 📝 Migration depuis l'ancien système

### **Avant :**

```javascript
{
  role === "admin" && <AdminButton />;
}
{
  !isSpectator && <ActionButton />;
}
```

### **Après :**

```javascript
<PermissionGuard permission="admin_settings">
  <AdminButton />
</PermissionGuard>

<PermissionGuard permission="edit_clients">
  <ActionButton />
</PermissionGuard>
```

## 🎨 Avantages

1. **Flexibilité** : Permissions configurables dynamiquement
2. **Granularité** : Contrôle précis des actions
3. **Maintenabilité** : Code plus propre et réutilisable
4. **Évolutivité** : Facile d'ajouter de nouvelles permissions
5. **Sécurité** : Vérifications côté client et serveur
6. **UX** : Interface adaptée aux permissions de l'utilisateur

## 🔮 Extensions futures

- Interface d'administration des permissions
- Audit des actions utilisateur
- Permissions temporaires
- Permissions par projet/entité
- Notifications de changement de permissions




