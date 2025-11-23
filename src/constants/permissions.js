/**
 * CONSTANTS DES PERMISSIONS - APLOFR
 * Toutes les permissions de l'application avec leurs variables correspondantes
 */

// ===== PERMISSIONS DE NAVIGATION ET MENU =====
export const PERMISSIONS_MENU = {
  VIEW_SOURCES: "menu_view_sources",
  VIEW_CLIENTS: "menu_view_clients",
  VIEW_DEVIS: "menu_view_devis",
  VIEW_FACTURES: "menu_view_factures",
  VIEW_CART: "menu_view_cart",
  VIEW_LINKS: "menu_view_links",
  VIEW_ADMIN: "menu_view_admin",
  VIEW_OFFRES_IA: "menu_view_offres_ia",  // 🆕 Menu Appels d'Offres IA
};

// ===== PERMISSIONS OFFRE/SOURCES =====
export const PERMISSIONS_SOURCES = {
  VIEW: "sources_view",
  CREATE: "sources_create",
  EDIT: "sources_edit",
  DELETE: "sources_delete",
  VIEW_ALL: "sources_view_all",
};

// ===== PERMISSIONS CLIENTS =====
export const PERMISSIONS_CLIENTS = {
  VIEW: "clients_view",
  CREATE: "clients_create",
  EDIT: "clients_edit",
  DELETE: "clients_delete",
};

// ===== PERMISSIONS DEVIS =====
export const PERMISSIONS_DEVIS = {
  VIEW: "devis_view",
  VIEW_ALL: "devis_view_all",
  CREATE: "devis_create",
  EDIT: "devis_edit",
  DELETE: "devis_delete",
};

// ===== PERMISSIONS FACTURES =====
export const PERMISSIONS_FACTURES = {
  VIEW: "factures_view",
  VIEW_ALL: "factures_view_all",
  CREATE: "factures_create",
  EDIT: "factures_edit",
  DELETE: "factures_delete",
};

// ===== PERMISSIONS PANIER =====
export const PERMISSIONS_CART = {
  VIEW: "cart_view",
  ADD: "cart_add",
  REMOVE: "cart_remove",
  VIEW_ALL: "cart_view_all",
};

// ===== PERMISSIONS RH =====
export const PERMISSIONS_PERSONNEL = {
  VIEW: "personnel_view",
  MANAGE: "personnel_manage",
};

export const PERMISSIONS_PARTNERS = {
  VIEW: "partners_view",
  MANAGE: "partners_manage",
};

// ===== PERMISSIONS ADMIN =====
export const PERMISSIONS_ADMIN = {
  SETTINGS: "admin_settings",
  USERS_MANAGE: "users_manage",
  ROLES_MANAGE: "roles_manage",
};

// ===== PERMISSIONS PARAMÉTRAGE =====
export const PERMISSIONS_PARAMETRAGE = {
  OFFER_STATUS: "offer_status_manage",
  QUOTE_STATUS: "quote_status_manage",
  INVOICE_STATUS: "invoice_status_manage",
  OFFER_CATEGORIES: "offer_categories_manage",
  LINK_CATEGORIES: "link_categories_manage",
};

// ===== PERMISSIONS LIENS =====
export const PERMISSIONS_LINKS = {
  VIEW: "links_view",
  MANAGE: "links_manage",
};

// ===== PERMISSIONS APPELS D'OFFRES IA =====
export const PERMISSIONS_OFFRES_IA = {
  VIEW: "offres_ia_view",
  MASQUER: "offres_ia_masquer",  // Seul permission pour masquer les faux positifs
  VIEW_STATS: "offres_ia_view_stats",
  SUPPRIMER: "offres_ia_supprimer",
};

// ===== REGROUPEMENT PAR MODULE =====
export const PERMISSIONS_BY_MODULE = {
  MENU: PERMISSIONS_MENU,
  SOURCES: PERMISSIONS_SOURCES,
  CLIENTS: PERMISSIONS_CLIENTS,
  DEVIS: PERMISSIONS_DEVIS,
  FACTURES: PERMISSIONS_FACTURES,
  CART: PERMISSIONS_CART,
  PERSONNEL: PERMISSIONS_PERSONNEL,
  PARTNERS: PERMISSIONS_PARTNERS,
  ADMIN: PERMISSIONS_ADMIN,
  PARAMETRAGE: PERMISSIONS_PARAMETRAGE,
  LINKS: PERMISSIONS_LINKS,
  OFFRES_IA: PERMISSIONS_OFFRES_IA,  // 🆕
};

// ===== REGROUPEMENT POUR ROLE ADMIN =====
export const ADMIN_PERMISSIONS = [
  ...Object.values(PERMISSIONS_MENU),
  ...Object.values(PERMISSIONS_SOURCES),
  ...Object.values(PERMISSIONS_CLIENTS),
  ...Object.values(PERMISSIONS_DEVIS),
  ...Object.values(PERMISSIONS_FACTURES),
  ...Object.values(PERMISSIONS_CART),
  ...Object.values(PERMISSIONS_PERSONNEL),
  ...Object.values(PERMISSIONS_PARTNERS),
  ...Object.values(PERMISSIONS_ADMIN),
  ...Object.values(PERMISSIONS_PARAMETRAGE),
  ...Object.values(PERMISSIONS_LINKS),
  ...Object.values(PERMISSIONS_OFFRES_IA),  // 🆕
];

// ===== ROLE PERMISSIONS PAR DÉFAUT =====
export const ROLE_PERMISSIONS = {
  admin: ADMIN_PERMISSIONS,

  user: [
    // Navigation
    PERMISSIONS_MENU.VIEW_SOURCES,
    PERMISSIONS_MENU.VIEW_CLIENTS,
    PERMISSIONS_MENU.VIEW_DEVIS,
    PERMISSIONS_MENU.VIEW_FACTURES,
    PERMISSIONS_MENU.VIEW_CART,
    PERMISSIONS_MENU.VIEW_LINKS,
    // Sources
    PERMISSIONS_SOURCES.VIEW,
    // Clients
    PERMISSIONS_CLIENTS.VIEW,
    PERMISSIONS_CLIENTS.CREATE,
    PERMISSIONS_CLIENTS.EDIT,
    // Devis
    PERMISSIONS_DEVIS.VIEW,
    PERMISSIONS_DEVIS.CREATE,
    PERMISSIONS_DEVIS.EDIT,
    // Factures
    PERMISSIONS_FACTURES.VIEW,
    PERMISSIONS_FACTURES.CREATE,
    PERMISSIONS_FACTURES.EDIT,
    // Panier
    PERMISSIONS_CART.VIEW,
    PERMISSIONS_CART.ADD,
    PERMISSIONS_CART.REMOVE,
    // Liens
    PERMISSIONS_LINKS.VIEW,
  ],

  spectateur: [
    PERMISSIONS_MENU.VIEW_SOURCES,
    PERMISSIONS_MENU.VIEW_DEVIS,
    PERMISSIONS_MENU.VIEW_FACTURES,
    PERMISSIONS_MENU.VIEW_LINKS,
    PERMISSIONS_SOURCES.VIEW,
    PERMISSIONS_DEVIS.VIEW,
    PERMISSIONS_FACTURES.VIEW,
    PERMISSIONS_CART.VIEW,
    PERMISSIONS_LINKS.VIEW,
  ],
};

export default PERMISSIONS_BY_MODULE;


