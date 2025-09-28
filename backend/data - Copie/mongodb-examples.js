// Exemples de données pour les collections MongoDB

// 1. Catégories de Liens
const linkCategoriesExamples = [
  {
    _id: "507f1f77bcf86cd799439011",
    nom: "Moteurs de recherche",
    description: "Sites de recherche et navigation",
    couleur: "#007bff",
    ordre: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439012",
    nom: "Médias",
    description: "Plateformes de contenu multimédia",
    couleur: "#dc3545",
    ordre: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439013",
    nom: "Développement",
    description: "Liens utiles pour le développement",
    couleur: "#28a745",
    ordre: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439014",
    nom: "Outils",
    description: "Outils et ressources utiles",
    couleur: "#ffc107",
    ordre: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 2. Catégories d'Offres
const offerCategoriesExamples = [
  {
    _id: "507f1f77bcf86cd799439021",
    nom: "Informatique",
    description: "Offres liées à l'informatique et aux technologies",
    couleur: "#007bff",
    ordre: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439022",
    nom: "Construction",
    description: "Offres de construction et travaux publics",
    couleur: "#28a745",
    ordre: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439023",
    nom: "Consulting",
    description: "Services de conseil et expertise",
    couleur: "#6f42c1",
    ordre: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439024",
    nom: "Formation",
    description: "Services de formation et éducation",
    couleur: "#fd7e14",
    ordre: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 3. Liens Utiles
const linksExamples = [
  {
    _id: "507f1f77bcf86cd799439031",
    nom: "Google",
    url: "https://www.google.com",
    categorie: "Moteurs de recherche",
    description: "Moteur de recherche principal",
    ordre: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439032",
    nom: "YouTube",
    url: "https://www.youtube.com",
    categorie: "Médias",
    description: "Plateforme de vidéos",
    ordre: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439033",
    nom: "GitHub",
    url: "https://www.github.com",
    categorie: "Développement",
    description: "Plateforme de développement",
    ordre: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439034",
    nom: "LinkedIn",
    url: "https://www.linkedin.com",
    categorie: "Réseaux sociaux",
    description: "Réseau professionnel",
    ordre: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 4. Statuts de Devis
const quoteStatusesExamples = [
  {
    _id: "507f1f77bcf86cd799439041",
    nom: "Validé",
    couleur: "#28a745",
    description: "Devis validé par le client",
    ordre: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439042",
    nom: "Transformé en facture",
    couleur: "#6c757d",
    description: "Devis transformé en facture",
    ordre: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439043",
    nom: "En attente",
    couleur: "#ffc107",
    description: "Devis en attente de validation",
    ordre: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439044",
    nom: "Refusé",
    couleur: "#dc3545",
    description: "Devis refusé par le client",
    ordre: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 5. Statuts de Factures
const invoiceStatusesExamples = [
  {
    _id: "507f1f77bcf86cd799439051",
    nom: "A envoyer au client",
    couleur: "#ffc107",
    description: "Facture prête à être envoyée",
    ordre: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439052",
    nom: "En attente de payement",
    couleur: "#fd7e14",
    description: "Facture envoyée, en attente de paiement",
    ordre: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439053",
    nom: "Payée",
    couleur: "#28a745",
    description: "Facture payée par le client",
    ordre: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439054",
    nom: "En retard",
    couleur: "#dc3545",
    description: "Facture en retard de paiement",
    ordre: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 6. Statuts d'Offres
const offerStatusesExamples = [
  {
    _id: "507f1f77bcf86cd799439061",
    nom: "Non préparée",
    couleur: "#dc3545",
    description: "Offre non préparée",
    ordre: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439062",
    nom: "En préparation",
    couleur: "#ffc107",
    description: "Offre en cours de préparation",
    ordre: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439063",
    nom: "Envoyée",
    couleur: "#28a745",
    description: "Offre envoyée au client",
    ordre: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "507f1f77bcf86cd799439064",
    nom: "Clôturée",
    couleur: "#6c757d",
    description: "Offre clôturée",
    ordre: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  linkCategoriesExamples,
  offerCategoriesExamples,
  linksExamples,
  quoteStatusesExamples,
  invoiceStatusesExamples,
  offerStatusesExamples,
};
