# Exemples de données pour les collections MongoDB

from datetime import datetime

# 1. Catégories de Liens
link_categories_examples = [
    {
        "nom": "Moteurs de recherche",
        "description": "Sites de recherche et navigation",
        "couleur": "#007bff",
        "ordre": 1,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Médias",
        "description": "Plateformes de contenu multimédia",
        "couleur": "#dc3545",
        "ordre": 2,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Développement",
        "description": "Liens utiles pour le développement",
        "couleur": "#28a745",
        "ordre": 3,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Outils",
        "description": "Outils et ressources utiles",
        "couleur": "#ffc107",
        "ordre": 4,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# 2. Catégories d'Offres
offer_categories_examples = [
    {
        "nom": "Informatique",
        "description": "Offres liées à l'informatique et aux technologies",
        "couleur": "#007bff",
        "ordre": 1,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Construction",
        "description": "Offres de construction et travaux publics",
        "couleur": "#28a745",
        "ordre": 2,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Consulting",
        "description": "Services de conseil et expertise",
        "couleur": "#6f42c1",
        "ordre": 3,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Formation",
        "description": "Services de formation et éducation",
        "couleur": "#fd7e14",
        "ordre": 4,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# 3. Liens Utiles
links_examples = [
    {
        "nom": "Google",
        "url": "https://www.google.com",
        "categorie": "Moteurs de recherche",
        "description": "Moteur de recherche principal",
        "ordre": 1,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "YouTube",
        "url": "https://www.youtube.com",
        "categorie": "Médias",
        "description": "Plateforme de vidéos",
        "ordre": 2,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "GitHub",
        "url": "https://www.github.com",
        "categorie": "Développement",
        "description": "Plateforme de développement",
        "ordre": 3,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "LinkedIn",
        "url": "https://www.linkedin.com",
        "categorie": "Réseaux sociaux",
        "description": "Réseau professionnel",
        "ordre": 4,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# 4. Statuts de Devis
quote_statuses_examples = [
    {
        "nom": "Validé",
        "couleur": "#28a745",
        "description": "Devis validé par le client",
        "ordre": 1,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Transformé en facture",
        "couleur": "#6c757d",
        "description": "Devis transformé en facture",
        "ordre": 2,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "En attente",
        "couleur": "#ffc107",
        "description": "Devis en attente de validation",
        "ordre": 3,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Refusé",
        "couleur": "#dc3545",
        "description": "Devis refusé par le client",
        "ordre": 4,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# 5. Statuts de Factures
invoice_statuses_examples = [
    {
        "nom": "A envoyer au client",
        "couleur": "#ffc107",
        "description": "Facture prête à être envoyée",
        "ordre": 1,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "En attente de payement",
        "couleur": "#fd7e14",
        "description": "Facture envoyée, en attente de paiement",
        "ordre": 2,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Payée",
        "couleur": "#28a745",
        "description": "Facture payée par le client",
        "ordre": 3,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "En retard",
        "couleur": "#dc3545",
        "description": "Facture en retard de paiement",
        "ordre": 4,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# 6. Statuts d'Offres
offer_statuses_examples = [
    {
        "nom": "Non préparée",
        "couleur": "#dc3545",
        "description": "Offre non préparée",
        "ordre": 1,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "En préparation",
        "couleur": "#ffc107",
        "description": "Offre en cours de préparation",
        "ordre": 2,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Envoyée",
        "couleur": "#28a745",
        "description": "Offre envoyée au client",
        "ordre": 3,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "nom": "Clôturée",
        "couleur": "#6c757d",
        "description": "Offre clôturée",
        "ordre": 4,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

