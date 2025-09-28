#!/usr/bin/env python3
"""
Script de migration des données pour MongoDB
Insère les données d'exemple dans les collections
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Ajouter le répertoire parent au path pour importer les exemples
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.mongodb_examples import (
    link_categories_examples,
    offer_categories_examples,
    links_examples,
    quote_statuses_examples,
    invoice_statuses_examples,
    offer_statuses_examples
)

# Charger les variables d'environnement
load_dotenv()

def migrate_data():
    """Migrer les données d'exemple vers MongoDB"""
    try:
        # Connexion à MongoDB
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/aplofr")
        client = MongoClient(mongodb_uri)
        db = client.aplofr
        
        print("✅ Connexion à MongoDB réussie")
        
        # Nettoyer les collections existantes
        print("🧹 Nettoyage des collections existantes...")
        db.link_categories.delete_many({})
        db.offer_categories.delete_many({})
        db.links.delete_many({})
        db.quote_statuses.delete_many({})
        db.invoice_statuses.delete_many({})
        db.offer_statuses.delete_many({})
        
        # Insérer les données d'exemple
        print("📥 Insertion des données d'exemple...")
        
        # Catégories de liens
        link_categories_result = db.link_categories.insert_many(link_categories_examples)
        print(f"✅ {len(link_categories_result.inserted_ids)} catégories de liens insérées")
        
        # Catégories d'offres
        offer_categories_result = db.offer_categories.insert_many(offer_categories_examples)
        print(f"✅ {len(offer_categories_result.inserted_ids)} catégories d'offres insérées")
        
        # Liens utiles
        links_result = db.links.insert_many(links_examples)
        print(f"✅ {len(links_result.inserted_ids)} liens insérés")
        
        # Statuts de devis
        quote_statuses_result = db.quote_statuses.insert_many(quote_statuses_examples)
        print(f"✅ {len(quote_statuses_result.inserted_ids)} statuts de devis insérés")
        
        # Statuts de factures
        invoice_statuses_result = db.invoice_statuses.insert_many(invoice_statuses_examples)
        print(f"✅ {len(invoice_statuses_result.inserted_ids)} statuts de factures insérés")
        
        # Statuts d'offres
        offer_statuses_result = db.offer_statuses.insert_many(offer_statuses_examples)
        print(f"✅ {len(offer_statuses_result.inserted_ids)} statuts d'offres insérés")
        
        print("🎉 Migration des données terminée avec succès !")
        
        # Afficher un résumé
        print("\n📊 Résumé des données insérées :")
        print(f"- Catégories de liens: {len(link_categories_result.inserted_ids)}")
        print(f"- Catégories d'offres: {len(offer_categories_result.inserted_ids)}")
        print(f"- Liens utiles: {len(links_result.inserted_ids)}")
        print(f"- Statuts de devis: {len(quote_statuses_result.inserted_ids)}")
        print(f"- Statuts de factures: {len(invoice_statuses_result.inserted_ids)}")
        print(f"- Statuts d'offres: {len(offer_statuses_result.inserted_ids)}")
        
        # Afficher quelques exemples
        print("\n🔍 Exemples de données insérées :")
        
        # Afficher une catégorie de lien
        sample_category = db.link_categories.find_one()
        print(f"Catégorie de lien: {sample_category['nom']} ({sample_category['couleur']})")
        
        # Afficher un lien
        sample_link = db.links.find_one()
        print(f"Lien: {sample_link['nom']} - {sample_link['url']}")
        
        # Afficher un statut de devis
        sample_status = db.quote_statuses.find_one()
        print(f"Statut de devis: {sample_status['nom']} ({sample_status['couleur']})")
        
    except Exception as error:
        print(f"❌ Erreur lors de la migration: {error}")
        return False
    finally:
        # Fermer la connexion
        client.close()
        print("🔌 Connexion MongoDB fermée")
    
    return True

if __name__ == "__main__":
    print("🚀 Démarrage de la migration des données...")
    success = migrate_data()
    if success:
        print("✅ Migration terminée avec succès !")
        sys.exit(0)
    else:
        print("❌ Migration échouée !")
        sys.exit(1)

