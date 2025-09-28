from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration MongoDB
app.config["MONGO_URI"] = os.getenv("MONGODB_URI", "mongodb://localhost:27017/aplofr")
mongo = PyMongo(app)

# ===== ROUTES POUR LES CATÉGORIES DE LIENS =====

@app.route('/api/link-categories', methods=['GET'])
def get_link_categories():
    """Récupérer toutes les catégories de liens"""
    try:
        categories = list(mongo.db.link_categories.find().sort("ordre", 1))
        # Convertir ObjectId en string pour JSON
        for category in categories:
            category['_id'] = str(category['_id'])
        return jsonify(categories)
    except Exception as e:
        print(f"Erreur lors de la récupération des catégories de liens: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/link-categories/<category_id>', methods=['GET'])
def get_link_category(category_id):
    """Récupérer une catégorie de lien par ID"""
    try:
        category = mongo.db.link_categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            return jsonify({"message": "Catégorie non trouvée"}), 404
        category['_id'] = str(category['_id'])
        return jsonify(category)
    except Exception as e:
        print(f"Erreur lors de la récupération de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/link-categories', methods=['POST'])
def create_link_category():
    """Créer une nouvelle catégorie de lien"""
    try:
        data = request.get_json()
        nom = data.get('nom')
        couleur = data.get('couleur')
        
        # Validation
        if not nom or not couleur:
            return jsonify({"message": "Nom et couleur sont requis"}), 400
        
        # Vérifier si la catégorie existe déjà
        existing = mongo.db.link_categories.find_one({"nom": nom})
        if existing:
            return jsonify({"message": "Cette catégorie existe déjà"}), 400
        
        # Calculer l'ordre
        count = mongo.db.link_categories.count_documents({})
        
        category_data = {
            "nom": nom,
            "description": data.get('description', ''),
            "couleur": couleur,
            "ordre": data.get('ordre', count + 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = mongo.db.link_categories.insert_one(category_data)
        category_data['_id'] = str(result.inserted_id)
        return jsonify(category_data), 201
        
    except Exception as e:
        print(f"Erreur lors de la création de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/link-categories/<category_id>', methods=['PUT'])
def update_link_category(category_id):
    """Modifier une catégorie de lien"""
    try:
        data = request.get_json()
        
        # Vérifier si la catégorie existe
        category = mongo.db.link_categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            return jsonify({"message": "Catégorie non trouvée"}), 404
        
        # Vérifier si le nouveau nom existe déjà (si différent)
        nom = data.get('nom')
        if nom and nom != category['nom']:
            existing = mongo.db.link_categories.find_one({"nom": nom})
            if existing:
                return jsonify({"message": "Cette catégorie existe déjà"}), 400
        
        # Mettre à jour
        update_data = {
            "nom": data.get('nom', category['nom']),
            "description": data.get('description', category['description']),
            "couleur": data.get('couleur', category['couleur']),
            "ordre": data.get('ordre', category['ordre']),
            "updatedAt": datetime.utcnow()
        }
        
        mongo.db.link_categories.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_data}
        )
        
        # Récupérer la catégorie mise à jour
        updated_category = mongo.db.link_categories.find_one({"_id": ObjectId(category_id)})
        updated_category['_id'] = str(updated_category['_id'])
        return jsonify(updated_category)
        
    except Exception as e:
        print(f"Erreur lors de la modification de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/link-categories/<category_id>', methods=['DELETE'])
def delete_link_category(category_id):
    """Supprimer une catégorie de lien"""
    try:
        category = mongo.db.link_categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            return jsonify({"message": "Catégorie non trouvée"}), 404
        
        mongo.db.link_categories.delete_one({"_id": ObjectId(category_id)})
        return jsonify({"message": "Catégorie supprimée avec succès"})
        
    except Exception as e:
        print(f"Erreur lors de la suppression de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

# ===== ROUTES POUR LES CATÉGORIES D'OFFRES =====

@app.route('/api/offer-categories', methods=['GET'])
def get_offer_categories():
    """Récupérer toutes les catégories d'offres"""
    try:
        categories = list(mongo.db.offer_categories.find().sort("ordre", 1))
        for category in categories:
            category['_id'] = str(category['_id'])
        return jsonify(categories)
    except Exception as e:
        print(f"Erreur lors de la récupération des catégories d'offres: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-categories/<category_id>', methods=['GET'])
def get_offer_category(category_id):
    """Récupérer une catégorie d'offre par ID"""
    try:
        category = mongo.db.offer_categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            return jsonify({"message": "Catégorie non trouvée"}), 404
        category['_id'] = str(category['_id'])
        return jsonify(category)
    except Exception as e:
        print(f"Erreur lors de la récupération de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-categories', methods=['POST'])
def create_offer_category():
    """Créer une nouvelle catégorie d'offre"""
    try:
        data = request.get_json()
        nom = data.get('nom')
        couleur = data.get('couleur')
        
        if not nom or not couleur:
            return jsonify({"message": "Nom et couleur sont requis"}), 400
        
        existing = mongo.db.offer_categories.find_one({"nom": nom})
        if existing:
            return jsonify({"message": "Cette catégorie existe déjà"}), 400
        
        count = mongo.db.offer_categories.count_documents({})
        
        category_data = {
            "nom": nom,
            "description": data.get('description', ''),
            "couleur": couleur,
            "ordre": data.get('ordre', count + 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = mongo.db.offer_categories.insert_one(category_data)
        category_data['_id'] = str(result.inserted_id)
        return jsonify(category_data), 201
        
    except Exception as e:
        print(f"Erreur lors de la création de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-categories/<category_id>', methods=['PUT'])
def update_offer_category(category_id):
    """Modifier une catégorie d'offre"""
    try:
        data = request.get_json()
        
        category = mongo.db.offer_categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            return jsonify({"message": "Catégorie non trouvée"}), 404
        
        nom = data.get('nom')
        if nom and nom != category['nom']:
            existing = mongo.db.offer_categories.find_one({"nom": nom})
            if existing:
                return jsonify({"message": "Cette catégorie existe déjà"}), 400
        
        update_data = {
            "nom": data.get('nom', category['nom']),
            "description": data.get('description', category['description']),
            "couleur": data.get('couleur', category['couleur']),
            "ordre": data.get('ordre', category['ordre']),
            "updatedAt": datetime.utcnow()
        }
        
        mongo.db.offer_categories.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_data}
        )
        
        updated_category = mongo.db.offer_categories.find_one({"_id": ObjectId(category_id)})
        updated_category['_id'] = str(updated_category['_id'])
        return jsonify(updated_category)
        
    except Exception as e:
        print(f"Erreur lors de la modification de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-categories/<category_id>', methods=['DELETE'])
def delete_offer_category(category_id):
    """Supprimer une catégorie d'offre"""
    try:
        category = mongo.db.offer_categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            return jsonify({"message": "Catégorie non trouvée"}), 404
        
        mongo.db.offer_categories.delete_one({"_id": ObjectId(category_id)})
        return jsonify({"message": "Catégorie supprimée avec succès"})
        
    except Exception as e:
        print(f"Erreur lors de la suppression de la catégorie: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

# ===== ROUTES POUR LES LIENS UTILES =====

@app.route('/api/links', methods=['GET'])
def get_links():
    """Récupérer tous les liens"""
    try:
        categorie = request.args.get('categorie')
        query = {}
        if categorie:
            query['categorie'] = categorie
        
        links = list(mongo.db.links.find(query).sort("ordre", 1))
        for link in links:
            link['_id'] = str(link['_id'])
        return jsonify(links)
    except Exception as e:
        print(f"Erreur lors de la récupération des liens: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/links/<link_id>', methods=['GET'])
def get_link(link_id):
    """Récupérer un lien par ID"""
    try:
        link = mongo.db.links.find_one({"_id": ObjectId(link_id)})
        if not link:
            return jsonify({"message": "Lien non trouvé"}), 404
        link['_id'] = str(link['_id'])
        return jsonify(link)
    except Exception as e:
        print(f"Erreur lors de la récupération du lien: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/links', methods=['POST'])
def create_link():
    """Créer un nouveau lien"""
    try:
        data = request.get_json()
        nom = data.get('nom')
        url = data.get('url')
        categorie = data.get('categorie')
        
        if not nom or not url or not categorie:
            return jsonify({"message": "Nom, URL et catégorie sont requis"}), 400
        
        # Validation URL
        try:
            from urllib.parse import urlparse
            urlparse(url)
        except:
            return jsonify({"message": "URL invalide"}), 400
        
        # Vérifier si le lien existe déjà
        existing = mongo.db.links.find_one({"url": url})
        if existing:
            return jsonify({"message": "Ce lien existe déjà"}), 400
        
        count = mongo.db.links.count_documents({})
        
        link_data = {
            "nom": nom,
            "url": url,
            "categorie": categorie,
            "description": data.get('description', ''),
            "ordre": data.get('ordre', count + 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = mongo.db.links.insert_one(link_data)
        link_data['_id'] = str(result.inserted_id)
        return jsonify(link_data), 201
        
    except Exception as e:
        print(f"Erreur lors de la création du lien: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/links/<link_id>', methods=['PUT'])
def update_link(link_id):
    """Modifier un lien"""
    try:
        data = request.get_json()
        
        link = mongo.db.links.find_one({"_id": ObjectId(link_id)})
        if not link:
            return jsonify({"message": "Lien non trouvé"}), 404
        
        # Validation URL si fournie
        url = data.get('url')
        if url:
            try:
                from urllib.parse import urlparse
                urlparse(url)
            except:
                return jsonify({"message": "URL invalide"}), 400
            
            if url != link['url']:
                existing = mongo.db.links.find_one({"url": url})
                if existing:
                    return jsonify({"message": "Ce lien existe déjà"}), 400
        
        update_data = {
            "nom": data.get('nom', link['nom']),
            "url": data.get('url', link['url']),
            "categorie": data.get('categorie', link['categorie']),
            "description": data.get('description', link['description']),
            "ordre": data.get('ordre', link['ordre']),
            "updatedAt": datetime.utcnow()
        }
        
        mongo.db.links.update_one(
            {"_id": ObjectId(link_id)},
            {"$set": update_data}
        )
        
        updated_link = mongo.db.links.find_one({"_id": ObjectId(link_id)})
        updated_link['_id'] = str(updated_link['_id'])
        return jsonify(updated_link)
        
    except Exception as e:
        print(f"Erreur lors de la modification du lien: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/links/<link_id>', methods=['DELETE'])
def delete_link(link_id):
    """Supprimer un lien"""
    try:
        link = mongo.db.links.find_one({"_id": ObjectId(link_id)})
        if not link:
            return jsonify({"message": "Lien non trouvé"}), 404
        
        mongo.db.links.delete_one({"_id": ObjectId(link_id)})
        return jsonify({"message": "Lien supprimé avec succès"})
        
    except Exception as e:
        print(f"Erreur lors de la suppression du lien: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

# ===== ROUTES POUR LES STATUTS DE DEVIS =====

@app.route('/api/quote-statuses', methods=['GET'])
def get_quote_statuses():
    """Récupérer tous les statuts de devis"""
    try:
        statuses = list(mongo.db.quote_statuses.find().sort("ordre", 1))
        for status in statuses:
            status['_id'] = str(status['_id'])
        return jsonify(statuses)
    except Exception as e:
        print(f"Erreur lors de la récupération des statuts de devis: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/quote-statuses/<status_id>', methods=['GET'])
def get_quote_status(status_id):
    """Récupérer un statut de devis par ID"""
    try:
        status = mongo.db.quote_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        status['_id'] = str(status['_id'])
        return jsonify(status)
    except Exception as e:
        print(f"Erreur lors de la récupération du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/quote-statuses', methods=['POST'])
def create_quote_status():
    """Créer un nouveau statut de devis"""
    try:
        data = request.get_json()
        nom = data.get('nom')
        couleur = data.get('couleur')
        
        if not nom or not couleur:
            return jsonify({"message": "Nom et couleur sont requis"}), 400
        
        existing = mongo.db.quote_statuses.find_one({"nom": nom})
        if existing:
            return jsonify({"message": "Ce statut existe déjà"}), 400
        
        count = mongo.db.quote_statuses.count_documents({})
        
        status_data = {
            "nom": nom,
            "couleur": couleur,
            "description": data.get('description', ''),
            "ordre": data.get('ordre', count + 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = mongo.db.quote_statuses.insert_one(status_data)
        status_data['_id'] = str(result.inserted_id)
        return jsonify(status_data), 201
        
    except Exception as e:
        print(f"Erreur lors de la création du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/quote-statuses/<status_id>', methods=['PUT'])
def update_quote_status(status_id):
    """Modifier un statut de devis"""
    try:
        data = request.get_json()
        
        status = mongo.db.quote_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        
        nom = data.get('nom')
        if nom and nom != status['nom']:
            existing = mongo.db.quote_statuses.find_one({"nom": nom})
            if existing:
                return jsonify({"message": "Ce statut existe déjà"}), 400
        
        update_data = {
            "nom": data.get('nom', status['nom']),
            "couleur": data.get('couleur', status['couleur']),
            "description": data.get('description', status['description']),
            "ordre": data.get('ordre', status['ordre']),
            "updatedAt": datetime.utcnow()
        }
        
        mongo.db.quote_statuses.update_one(
            {"_id": ObjectId(status_id)},
            {"$set": update_data}
        )
        
        updated_status = mongo.db.quote_statuses.find_one({"_id": ObjectId(status_id)})
        updated_status['_id'] = str(updated_status['_id'])
        return jsonify(updated_status)
        
    except Exception as e:
        print(f"Erreur lors de la modification du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/quote-statuses/<status_id>', methods=['DELETE'])
def delete_quote_status(status_id):
    """Supprimer un statut de devis"""
    try:
        status = mongo.db.quote_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        
        mongo.db.quote_statuses.delete_one({"_id": ObjectId(status_id)})
        return jsonify({"message": "Statut supprimé avec succès"})
        
    except Exception as e:
        print(f"Erreur lors de la suppression du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

# ===== ROUTES POUR LES STATUTS DE FACTURES =====

@app.route('/api/invoice-statuses', methods=['GET'])
def get_invoice_statuses():
    """Récupérer tous les statuts de factures"""
    try:
        statuses = list(mongo.db.invoice_statuses.find().sort("ordre", 1))
        for status in statuses:
            status['_id'] = str(status['_id'])
        return jsonify(statuses)
    except Exception as e:
        print(f"Erreur lors de la récupération des statuts de factures: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/invoice-statuses/<status_id>', methods=['GET'])
def get_invoice_status(status_id):
    """Récupérer un statut de facture par ID"""
    try:
        status = mongo.db.invoice_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        status['_id'] = str(status['_id'])
        return jsonify(status)
    except Exception as e:
        print(f"Erreur lors de la récupération du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/invoice-statuses', methods=['POST'])
def create_invoice_status():
    """Créer un nouveau statut de facture"""
    try:
        data = request.get_json()
        nom = data.get('nom')
        couleur = data.get('couleur')
        
        if not nom or not couleur:
            return jsonify({"message": "Nom et couleur sont requis"}), 400
        
        existing = mongo.db.invoice_statuses.find_one({"nom": nom})
        if existing:
            return jsonify({"message": "Ce statut existe déjà"}), 400
        
        count = mongo.db.invoice_statuses.count_documents({})
        
        status_data = {
            "nom": nom,
            "couleur": couleur,
            "description": data.get('description', ''),
            "ordre": data.get('ordre', count + 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = mongo.db.invoice_statuses.insert_one(status_data)
        status_data['_id'] = str(result.inserted_id)
        return jsonify(status_data), 201
        
    except Exception as e:
        print(f"Erreur lors de la création du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/invoice-statuses/<status_id>', methods=['PUT'])
def update_invoice_status(status_id):
    """Modifier un statut de facture"""
    try:
        data = request.get_json()
        
        status = mongo.db.invoice_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        
        nom = data.get('nom')
        if nom and nom != status['nom']:
            existing = mongo.db.invoice_statuses.find_one({"nom": nom})
            if existing:
                return jsonify({"message": "Ce statut existe déjà"}), 400
        
        update_data = {
            "nom": data.get('nom', status['nom']),
            "couleur": data.get('couleur', status['couleur']),
            "description": data.get('description', status['description']),
            "ordre": data.get('ordre', status['ordre']),
            "updatedAt": datetime.utcnow()
        }
        
        mongo.db.invoice_statuses.update_one(
            {"_id": ObjectId(status_id)},
            {"$set": update_data}
        )
        
        updated_status = mongo.db.invoice_statuses.find_one({"_id": ObjectId(status_id)})
        updated_status['_id'] = str(updated_status['_id'])
        return jsonify(updated_status)
        
    except Exception as e:
        print(f"Erreur lors de la modification du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/invoice-statuses/<status_id>', methods=['DELETE'])
def delete_invoice_status(status_id):
    """Supprimer un statut de facture"""
    try:
        status = mongo.db.invoice_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        
        mongo.db.invoice_statuses.delete_one({"_id": ObjectId(status_id)})
        return jsonify({"message": "Statut supprimé avec succès"})
        
    except Exception as e:
        print(f"Erreur lors de la suppression du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

# ===== ROUTES POUR LES STATUTS D'OFFRES =====

@app.route('/api/offer-statuses', methods=['GET'])
def get_offer_statuses():
    """Récupérer tous les statuts d'offres"""
    try:
        statuses = list(mongo.db.offer_statuses.find().sort("ordre", 1))
        for status in statuses:
            status['_id'] = str(status['_id'])
        return jsonify(statuses)
    except Exception as e:
        print(f"Erreur lors de la récupération des statuts d'offres: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-statuses/<status_id>', methods=['GET'])
def get_offer_status(status_id):
    """Récupérer un statut d'offre par ID"""
    try:
        status = mongo.db.offer_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        status['_id'] = str(status['_id'])
        return jsonify(status)
    except Exception as e:
        print(f"Erreur lors de la récupération du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-statuses', methods=['POST'])
def create_offer_status():
    """Créer un nouveau statut d'offre"""
    try:
        data = request.get_json()
        nom = data.get('nom')
        couleur = data.get('couleur')
        
        if not nom or not couleur:
            return jsonify({"message": "Nom et couleur sont requis"}), 400
        
        existing = mongo.db.offer_statuses.find_one({"nom": nom})
        if existing:
            return jsonify({"message": "Ce statut existe déjà"}), 400
        
        count = mongo.db.offer_statuses.count_documents({})
        
        status_data = {
            "nom": nom,
            "couleur": couleur,
            "description": data.get('description', ''),
            "ordre": data.get('ordre', count + 1),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = mongo.db.offer_statuses.insert_one(status_data)
        status_data['_id'] = str(result.inserted_id)
        return jsonify(status_data), 201
        
    except Exception as e:
        print(f"Erreur lors de la création du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-statuses/<status_id>', methods=['PUT'])
def update_offer_status(status_id):
    """Modifier un statut d'offre"""
    try:
        data = request.get_json()
        
        status = mongo.db.offer_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        
        nom = data.get('nom')
        if nom and nom != status['nom']:
            existing = mongo.db.offer_statuses.find_one({"nom": nom})
            if existing:
                return jsonify({"message": "Ce statut existe déjà"}), 400
        
        update_data = {
            "nom": data.get('nom', status['nom']),
            "couleur": data.get('couleur', status['couleur']),
            "description": data.get('description', status['description']),
            "ordre": data.get('ordre', status['ordre']),
            "updatedAt": datetime.utcnow()
        }
        
        mongo.db.offer_statuses.update_one(
            {"_id": ObjectId(status_id)},
            {"$set": update_data}
        )
        
        updated_status = mongo.db.offer_statuses.find_one({"_id": ObjectId(status_id)})
        updated_status['_id'] = str(updated_status['_id'])
        return jsonify(updated_status)
        
    except Exception as e:
        print(f"Erreur lors de la modification du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

@app.route('/api/offer-statuses/<status_id>', methods=['DELETE'])
def delete_offer_status(status_id):
    """Supprimer un statut d'offre"""
    try:
        status = mongo.db.offer_statuses.find_one({"_id": ObjectId(status_id)})
        if not status:
            return jsonify({"message": "Statut non trouvé"}), 404
        
        mongo.db.offer_statuses.delete_one({"_id": ObjectId(status_id)})
        return jsonify({"message": "Statut supprimé avec succès"})
        
    except Exception as e:
        print(f"Erreur lors de la suppression du statut: {e}")
        return jsonify({"message": "Erreur serveur"}), 500

# ===== ROUTE DE TEST =====

@app.route('/api/test', methods=['GET'])
def test_api():
    """Test de connexion API"""
    return jsonify({"message": "API fonctionnelle !"})

# ===== GESTION DES ERREURS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Endpoint non trouvé"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Erreur serveur interne"}), 500

# ===== DÉMARRAGE DE L'APPLICATION =====

if __name__ == '__main__':
    print("🚀 Démarrage du serveur Flask...")
    print("📡 API disponible sur http://localhost:5000/api")
    app.run(debug=True, host='0.0.0.0', port=5000)

