# ===========================================
# ROUTES BACKEND POUR LA GESTION DES RÔLES ET PERMISSIONS
# ===========================================

from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from datetime import datetime, timedelta

# Configuration
roles_bp = Blueprint('roles', __name__, url_prefix='/api')

# ===========================================
# MODÈLES DE DONNÉES (exemple avec SQLAlchemy)
# ===========================================

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# Table de liaison many-to-many entre rôles et permissions
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

# Table de liaison many-to-many entre utilisateurs et rôles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

class Role(Base):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    nom = Column(String(100), nullable=False, unique=True)
    description = Column(String(255))
    couleur = Column(String(7), default="#6c757d")  # Couleur hex
    ordre = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    users = relationship("User", secondary=user_roles, back_populates="roles")

class Permission(Base):
    __tablename__ = 'permissions'
    
    id = Column(Integer, primary_key=True)
    nom = Column(String(100), nullable=False, unique=True)  # ex: "edit_clients"
    description = Column(String(255))  # ex: "Modifier les clients"
    category = Column(String(50))  # ex: "Clients"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(120), nullable=False, unique=True)
    nom = Column(String(100))
    role = Column(String(50), default="user")  # Rôle principal
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    roles = relationship("Role", secondary=user_roles, back_populates="users")

# ===========================================
# DÉCORATEURS D'AUTHENTIFICATION
# ===========================================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
        
        try:
            # Enlever "Bearer " du token
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Décoder le token JWT
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token invalide'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user_id, *args, **kwargs):
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'message': 'Accès administrateur requis'}), 403
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

def permission_required(permission_name):
    def decorator(f):
        @wraps(f)
        def decorated(current_user_id, *args, **kwargs):
            user = User.query.get(current_user_id)
            if not user:
                return jsonify({'message': 'Utilisateur non trouvé'}), 404
            
            # Vérifier si l'utilisateur a la permission
            if not user_has_permission(user, permission_name):
                return jsonify({'message': f'Permission "{permission_name}" requise'}), 403
            
            return f(current_user_id, *args, **kwargs)
        
        return decorated
    return decorator

# ===========================================
# FONCTIONS UTILITAIRES
# ===========================================

def user_has_permission(user, permission_name):
    """
    Vérifie si un utilisateur a une permission spécifique
    """
    # Les admins ont toutes les permissions
    if user.role == 'admin':
        return True
    
    # Vérifier dans les rôles assignés
    for role in user.roles:
        for permission in role.permissions:
            if permission.nom == permission_name:
                return True
    
    return False

def get_user_permissions(user):
    """
    Récupère toutes les permissions d'un utilisateur
    """
    permissions = set()
    
    # Les admins ont toutes les permissions
    if user.role == 'admin':
        all_permissions = Permission.query.all()
        return [p.nom for p in all_permissions]
    
    # Récupérer les permissions des rôles assignés
    for role in user.roles:
        for permission in role.permissions:
            permissions.add(permission.nom)
    
    return list(permissions)

def init_default_permissions():
    """
    Initialise les permissions par défaut
    """
    default_permissions = [
        # Offres
        {"nom": "view_offers", "description": "Voir les offres", "category": "Offres"},
        
        # Devis
        {"nom": "create_quotes", "description": "Créer des devis", "category": "Devis"},
        {"nom": "view_quotes", "description": "Voir les devis", "category": "Devis"},
        {"nom": "edit_quotes", "description": "Modifier les devis", "category": "Devis"},
        {"nom": "delete_quotes", "description": "Supprimer les devis", "category": "Devis"},
        
        # Factures
        {"nom": "create_invoices", "description": "Créer des factures", "category": "Factures"},
        {"nom": "view_invoices", "description": "Voir les factures", "category": "Factures"},
        {"nom": "edit_invoices", "description": "Modifier les factures", "category": "Factures"},
        {"nom": "delete_invoices", "description": "Supprimer les factures", "category": "Factures"},
        
        # Clients
        {"nom": "view_clients", "description": "Voir les clients", "category": "Clients"},
        {"nom": "edit_clients", "description": "Modifier les clients", "category": "Clients"},
        {"nom": "delete_clients", "description": "Supprimer les clients", "category": "Clients"},
        
        # Personnel
        {"nom": "view_personnel", "description": "Voir le personnel", "category": "RH"},
        {"nom": "edit_personnel", "description": "Modifier le personnel", "category": "RH"},
        
        # Partenaires
        {"nom": "view_partners", "description": "Voir les partenaires", "category": "Partenaires"},
        {"nom": "edit_partners", "description": "Modifier les partenaires", "category": "Partenaires"},
        
        # Administration
        {"nom": "admin_settings", "description": "Paramètres administrateur", "category": "Administration"},
    ]
    
    for perm_data in default_permissions:
        existing = Permission.query.filter_by(nom=perm_data['nom']).first()
        if not existing:
            permission = Permission(**perm_data)
            db.session.add(permission)
    
    db.session.commit()

def init_default_roles():
    """
    Initialise les rôles par défaut
    """
    default_roles = [
        {
            "nom": "Commercial",
            "description": "Accès aux offres, devis et factures",
            "couleur": "#28a745",
            "ordre": 1,
            "permissions": ["view_offers", "create_quotes", "view_quotes", "create_invoices", "view_invoices", "view_clients"]
        },
        {
            "nom": "Visiteur",
            "description": "Accès en lecture seule aux offres",
            "couleur": "#17a2b8",
            "ordre": 2,
            "permissions": ["view_offers", "view_quotes"]
        },
        {
            "nom": "Directeur",
            "description": "Accès complet à toutes les fonctionnalités",
            "couleur": "#dc3545",
            "ordre": 3,
            "permissions": [
                "view_offers", "create_quotes", "view_quotes", "edit_quotes", "delete_quotes",
                "create_invoices", "view_invoices", "edit_invoices", "delete_invoices",
                "view_clients", "edit_clients", "delete_clients", "view_personnel",
                "edit_personnel", "view_partners", "edit_partners", "admin_settings"
            ]
        }
    ]
    
    for role_data in default_roles:
        existing = Role.query.filter_by(nom=role_data['nom']).first()
        if not existing:
            permissions = role_data.pop('permissions')
            role = Role(**role_data)
            
            # Assigner les permissions
            for perm_name in permissions:
                permission = Permission.query.filter_by(nom=perm_name).first()
                if permission:
                    role.permissions.append(permission)
            
            db.session.add(role)
    
    db.session.commit()

# ===========================================
# ROUTES POUR LES RÔLES
# ===========================================

@roles_bp.route('/roles', methods=['GET'])
@token_required
def get_roles(current_user_id):
    """
    Récupérer tous les rôles
    """
    try:
        roles = Role.query.order_by(Role.ordre).all()
        
        roles_data = []
        for role in roles:
            role_data = {
                '_id': role.id,
                'nom': role.nom,
                'description': role.description,
                'couleur': role.couleur,
                'ordre': role.ordre,
                'permissions': [p.nom for p in role.permissions],
                'created_at': role.created_at.isoformat() if role.created_at else None,
                'updated_at': role.updated_at.isoformat() if role.updated_at else None
            }
            roles_data.append(role_data)
        
        return jsonify(roles_data)
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération des rôles: {str(e)}'}), 500

@roles_bp.route('/roles/<int:role_id>', methods=['GET'])
@token_required
def get_role(current_user_id, role_id):
    """
    Récupérer un rôle par ID
    """
    try:
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'message': 'Rôle non trouvé'}), 404
        
        role_data = {
            '_id': role.id,
            'nom': role.nom,
            'description': role.description,
            'couleur': role.couleur,
            'ordre': role.ordre,
            'permissions': [p.nom for p in role.permissions],
            'created_at': role.created_at.isoformat() if role.created_at else None,
            'updated_at': role.updated_at.isoformat() if role.updated_at else None
        }
        
        return jsonify(role_data)
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération du rôle: {str(e)}'}), 500

@roles_bp.route('/roles', methods=['POST'])
@token_required
@permission_required('admin_settings')
def create_role(current_user_id):
    """
    Créer un nouveau rôle
    """
    try:
        data = request.get_json()
        
        # Validation des données
        if not data.get('nom'):
            return jsonify({'message': 'Le nom du rôle est requis'}), 400
        
        # Vérifier que le rôle n'existe pas déjà
        existing_role = Role.query.filter_by(nom=data['nom']).first()
        if existing_role:
            return jsonify({'message': 'Un rôle avec ce nom existe déjà'}), 400
        
        # Créer le rôle
        role = Role(
            nom=data['nom'],
            description=data.get('description', ''),
            couleur=data.get('couleur', '#6c757d'),
            ordre=data.get('ordre', 1)
        )
        
        # Assigner les permissions
        permissions = data.get('permissions', [])
        for perm_name in permissions:
            permission = Permission.query.filter_by(nom=perm_name).first()
            if permission:
                role.permissions.append(permission)
        
        db.session.add(role)
        db.session.commit()
        
        return jsonify({
            'message': 'Rôle créé avec succès',
            '_id': role.id,
            'nom': role.nom
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la création du rôle: {str(e)}'}), 500

@roles_bp.route('/roles/<int:role_id>', methods=['PUT'])
@token_required
@permission_required('admin_settings')
def update_role(current_user_id, role_id):
    """
    Modifier un rôle
    """
    try:
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'message': 'Rôle non trouvé'}), 404
        
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'nom' in data:
            # Vérifier que le nouveau nom n'existe pas déjà
            existing_role = Role.query.filter_by(nom=data['nom']).filter(Role.id != role_id).first()
            if existing_role:
                return jsonify({'message': 'Un rôle avec ce nom existe déjà'}), 400
            role.nom = data['nom']
        
        if 'description' in data:
            role.description = data['description']
        
        if 'couleur' in data:
            role.couleur = data['couleur']
        
        if 'ordre' in data:
            role.ordre = data['ordre']
        
        # Mettre à jour les permissions
        if 'permissions' in data:
            role.permissions.clear()  # Supprimer toutes les permissions actuelles
            permissions = data['permissions']
            for perm_name in permissions:
                permission = Permission.query.filter_by(nom=perm_name).first()
                if permission:
                    role.permissions.append(permission)
        
        role.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Rôle modifié avec succès',
            '_id': role.id
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la modification du rôle: {str(e)}'}), 500

@roles_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@token_required
@permission_required('admin_settings')
def delete_role(current_user_id, role_id):
    """
    Supprimer un rôle
    """
    try:
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'message': 'Rôle non trouvé'}), 404
        
        # Vérifier si des utilisateurs utilisent ce rôle
        users_with_role = User.query.join(user_roles).filter(user_roles.c.role_id == role_id).count()
        if users_with_role > 0:
            return jsonify({'message': f'Impossible de supprimer ce rôle car {users_with_role} utilisateur(s) l\'utilisent'}), 400
        
        db.session.delete(role)
        db.session.commit()
        
        return jsonify({'message': 'Rôle supprimé avec succès'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la suppression du rôle: {str(e)}'}), 500

# ===========================================
# ROUTES POUR LES PERMISSIONS
# ===========================================

@roles_bp.route('/permissions', methods=['GET'])
@token_required
def get_permissions(current_user_id):
    """
    Récupérer toutes les permissions disponibles
    """
    try:
        permissions = Permission.query.order_by(Permission.category, Permission.nom).all()
        
        permissions_data = []
        for permission in permissions:
            permission_data = {
                'id': permission.nom,
                'name': permission.description,
                'category': permission.category
            }
            permissions_data.append(permission_data)
        
        return jsonify(permissions_data)
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération des permissions: {str(e)}'}), 500

@roles_bp.route('/user/permissions', methods=['GET'])
@token_required
def get_current_user_permissions(current_user_id):
    """
    Récupérer les permissions de l'utilisateur actuel
    """
    try:
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Utilisateur non trouvé'}), 404
        
        permissions = get_user_permissions(user)
        return jsonify(permissions)
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération des permissions: {str(e)}'}), 500

@roles_bp.route('/users/<int:user_id>/permissions', methods=['GET'])
@token_required
@permission_required('admin_settings')
def get_user_permissions_by_id(current_user_id, user_id):
    """
    Récupérer les permissions d'un utilisateur spécifique
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Utilisateur non trouvé'}), 404
        
        permissions = get_user_permissions(user)
        return jsonify(permissions)
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération des permissions: {str(e)}'}), 500

# ===========================================
# ROUTES POUR L'ASSIGNATION DE RÔLES
# ===========================================

@roles_bp.route('/users/<int:user_id>/assign-role', methods=['POST'])
@token_required
@permission_required('admin_settings')
def assign_role_to_user(current_user_id, user_id):
    """
    Assigner un rôle à un utilisateur
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Utilisateur non trouvé'}), 404
        
        data = request.get_json()
        role_id = data.get('roleId')
        
        if not role_id:
            return jsonify({'message': 'ID du rôle requis'}), 400
        
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'message': 'Rôle non trouvé'}), 404
        
        # Supprimer tous les rôles actuels de l'utilisateur
        user.roles.clear()
        
        # Assigner le nouveau rôle
        user.roles.append(role)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Rôle "{role.nom}" assigné à l\'utilisateur avec succès'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de l\'assignation du rôle: {str(e)}'}), 500

# ===========================================
# ROUTE D'INITIALISATION
# ===========================================

@roles_bp.route('/roles/init', methods=['POST'])
def init_roles_and_permissions():
    """
    Initialiser les rôles et permissions par défaut
    """
    try:
        init_default_permissions()
        init_default_roles()
        
        return jsonify({
            'message': 'Rôles et permissions initialisés avec succès'
        })
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors de l\'initialisation: {str(e)}'}), 500

# ===========================================
# ROUTE DE TEST
# ===========================================

@roles_bp.route('/test-permission/<permission_name>', methods=['GET'])
@token_required
def test_permission(current_user_id, permission_name):
    """
    Tester si l'utilisateur actuel a une permission spécifique
    """
    try:
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Utilisateur non trouvé'}), 404
        
        has_permission = user_has_permission(user, permission_name)
        
        return jsonify({
            'user_id': user_id,
            'permission': permission_name,
            'has_permission': has_permission,
            'user_role': user.role,
            'assigned_roles': [role.nom for role in user.roles]
        })
    
    except Exception as e:
        return jsonify({'message': f'Erreur lors du test de permission: {str(e)}'}), 500

# ===========================================
# INSCRIPTION DU BLUEPRINT
# ===========================================

def register_routes(app, database):
    """
    Enregistrer les routes dans l'application Flask
    """
    global db
    db = database
    
    app.register_blueprint(roles_bp)
    
    # Initialiser les données par défaut au démarrage
    with app.app_context():
        try:
            init_default_permissions()
            init_default_roles()
            print("✅ Rôles et permissions initialisés")
        except Exception as e:
            print(f"⚠️ Erreur lors de l'initialisation: {e}")

# ===========================================
# EXEMPLE D'UTILISATION DANS L'APP PRINCIPALE
# ===========================================

"""
# Dans votre fichier app.py principal :

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from routes_roles_permissions import register_routes

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///roles_permissions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Enregistrer les routes
register_routes(app, db)

if __name__ == '__main__':
    app.run(debug=True)
"""




