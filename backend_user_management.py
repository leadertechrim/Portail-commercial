# Code à ajouter dans votre backend Flask existant

# Routes pour la gestion des utilisateurs (à ajouter après les routes existantes)

@app.route("/api/users", methods=["GET"])
def get_users():
    """Récupérer tous les utilisateurs (admin seulement)"""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"message": "Token manquant"}), 401
    
    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return jsonify({"message": "Token invalide"}), 401
    
    if decoded.get("role") != "admin":
        return jsonify({"message": "Accès refusé"}), 403
    
    try:
        users = list(users_col.find({}, {"password": 0}))  # Exclure les mots de passe
        for user in users:
            user["_id"] = str(user["_id"])
        return jsonify(users)
    except Exception as e:
        return jsonify({"message": "Erreur lors de la récupération des utilisateurs"}), 500

@app.route("/api/users", methods=["POST"])
def create_user():
    """Créer un nouvel utilisateur (admin seulement)"""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"message": "Token manquant"}), 401
    
    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return jsonify({"message": "Token invalide"}), 401
    
    if decoded.get("role") != "admin":
        return jsonify({"message": "Accès refusé"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Données manquantes"}), 400
    
    # Validation des champs requis
    required_fields = ["name", "email", "password", "role"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"Le champ {field} est requis"}), 400
    
    # Vérifier si l'email existe déjà
    if users_col.find_one({"email": data["email"]}):
        return jsonify({"message": "Un utilisateur avec cet email existe déjà"}), 400
    
    # Valider le rôle
    if data["role"] not in ["user", "admin"]:
        return jsonify({"message": "Rôle invalide"}), 400
    
    try:
        # Hasher le mot de passe
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        
        # Créer l'utilisateur
        user = {
            "name": data["name"],
            "email": data["email"],
            "password": hashed_password,
            "role": data["role"],
            "created_at": datetime.utcnow()
        }
        
        result = users_col.insert_one(user)
        user["_id"] = str(result.inserted_id)
        del user["password"]  # Ne pas retourner le mot de passe
        
        return jsonify({"message": "Utilisateur créé avec succès", "user": user}), 201
    except Exception as e:
        return jsonify({"message": "Erreur lors de la création de l'utilisateur"}), 500

@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    """Modifier un utilisateur (admin seulement)"""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"message": "Token manquant"}), 401
    
    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return jsonify({"message": "Token invalide"}), 401
    
    if decoded.get("role") != "admin":
        return jsonify({"message": "Accès refusé"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Données manquantes"}), 400
    
    try:
        # Vérifier si l'utilisateur existe
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "Utilisateur non trouvé"}), 404
        
        # Préparer les données de mise à jour
        update_data = {}
        
        if data.get("name"):
            update_data["name"] = data["name"]
        
        if data.get("email"):
            # Vérifier si l'email existe déjà pour un autre utilisateur
            existing_user = users_col.find_one({
                "email": data["email"],
                "_id": {"$ne": ObjectId(user_id)}
            })
            if existing_user:
                return jsonify({"message": "Un utilisateur avec cet email existe déjà"}), 400
            update_data["email"] = data["email"]
        
        if data.get("role"):
            if data["role"] not in ["user", "admin"]:
                return jsonify({"message": "Rôle invalide"}), 400
            update_data["role"] = data["role"]
        
        if data.get("password"):
            # Hasher le nouveau mot de passe
            update_data["password"] = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Mettre à jour l'utilisateur
        users_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        return jsonify({"message": "Utilisateur mis à jour avec succès"}), 200
    except Exception as e:
        return jsonify({"message": "Erreur lors de la mise à jour de l'utilisateur"}), 500

@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Supprimer un utilisateur (admin seulement)"""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"message": "Token manquant"}), 401
    
    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return jsonify({"message": "Token invalide"}), 401
    
    if decoded.get("role") != "admin":
        return jsonify({"message": "Accès refusé"}), 403
    
    try:
        # Vérifier si l'utilisateur existe
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "Utilisateur non trouvé"}), 404
        
        # Empêcher l'auto-suppression
        if str(user["_id"]) == decoded.get("user_id"):
            return jsonify({"message": "Vous ne pouvez pas supprimer votre propre compte"}), 400
        
        # Supprimer l'utilisateur
        users_col.delete_one({"_id": ObjectId(user_id)})
        
        return jsonify({"message": "Utilisateur supprimé avec succès"}), 200
    except Exception as e:
        return jsonify({"message": "Erreur lors de la suppression de l'utilisateur"}), 500

@app.route("/api/users/<user_id>/change-password", methods=["POST"])
def change_user_password(user_id):
    """Changer le mot de passe d'un utilisateur (admin seulement)"""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"message": "Token manquant"}), 401
    
    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return jsonify({"message": "Token invalide"}), 401
    
    if decoded.get("role") != "admin":
        return jsonify({"message": "Accès refusé"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Données manquantes"}), 400
    
    # Validation des champs requis
    if not data.get("currentPassword"):
        return jsonify({"message": "Le mot de passe actuel est requis"}), 400
    
    if not data.get("newPassword"):
        return jsonify({"message": "Le nouveau mot de passe est requis"}), 400
    
    if len(data["newPassword"]) < 6:
        return jsonify({"message": "Le nouveau mot de passe doit contenir au moins 6 caractères"}), 400
    
    try:
        # Récupérer l'utilisateur
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "Utilisateur non trouvé"}), 404
        
        # Vérifier le mot de passe actuel
        if not bcrypt.check_password_hash(user["password"], data["currentPassword"]):
            return jsonify({"message": "Mot de passe actuel incorrect"}), 400
        
        # Hasher le nouveau mot de passe
        new_hashed_password = bcrypt.generate_password_hash(data["newPassword"]).decode("utf-8")
        
        # Mettre à jour le mot de passe
        users_col.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "password": new_hashed_password,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({"message": "Mot de passe changé avec succès"}), 200
    except Exception as e:
        return jsonify({"message": "Erreur lors du changement de mot de passe"}), 500

# Route pour qu'un admin puisse changer son propre mot de passe
@app.route("/api/admin/change-password", methods=["POST"])
def admin_change_own_password():
    """Changer son propre mot de passe (admin seulement)"""
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"message": "Token manquant"}), 401
    
    try:
        token = auth.split(" ")[1]
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except:
        return jsonify({"message": "Token invalide"}), 401
    
    if decoded.get("role") != "admin":
        return jsonify({"message": "Accès refusé"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Données manquantes"}), 400
    
    # Validation des champs requis
    if not data.get("currentPassword"):
        return jsonify({"message": "Le mot de passe actuel est requis"}), 400
    
    if not data.get("newPassword"):
        return jsonify({"message": "Le nouveau mot de passe est requis"}), 400
    
    if len(data["newPassword"]) < 6:
        return jsonify({"message": "Le nouveau mot de passe doit contenir au moins 6 caractères"}), 400
    
    try:
        # Récupérer l'utilisateur admin
        user = users_col.find_one({"_id": ObjectId(decoded.get("user_id"))})
        if not user:
            return jsonify({"message": "Utilisateur non trouvé"}), 404
        
        # Vérifier le mot de passe actuel
        if not bcrypt.check_password_hash(user["password"], data["currentPassword"]):
            return jsonify({"message": "Mot de passe actuel incorrect"}), 400
        
        # Hasher le nouveau mot de passe
        new_hashed_password = bcrypt.generate_password_hash(data["newPassword"]).decode("utf-8")
        
        # Mettre à jour le mot de passe
        users_col.update_one(
            {"_id": ObjectId(decoded.get("user_id"))},
            {
                "$set": {
                    "password": new_hashed_password,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({"message": "Mot de passe changé avec succès"}), 200
    except Exception as e:
        return jsonify({"message": "Erreur lors du changement de mot de passe"}), 500

