// URL de base pour toutes les APIs
// Utilise la variable d'environnement si définie, sinon Railway en production, sinon local
// TEMPORAIREMENT EN LOCAL POUR TESTS
export const API_BASE_URL = "http://127.0.0.1:8000";
// export const API_BASE_URL = "http://localhost:8080";
// export const API_BASE_URL = "https://applesoffres-production.up.railway.app";

// ---------------- LOGIN ----------------
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Erreur login");
  }

  return await res.json();
}

// ---------------- GET SOURCES ----------------
export async function fetchSources(token) {
  const res = await fetch(`${API_BASE_URL}/api/sources`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? await res.json() : [];
}

// ---------------- ADD SOURCE ----------------
export async function addSource(token, source) {
  const res = await fetch(`${API_BASE_URL}/api/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(source),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Erreur HTTP ${res.status}`);
  }

  return await res.json();
}

// ---------------- GET SOURCES GROUPED ----------------
export async function fetchSourcesGrouped(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sources/grouped`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
      },
    });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Réponse non-JSON reçue");
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return { nationale: [], internationale: [] };
  }
}

// ---------------- UPDATE SOURCE ----------------
export async function updateSource(token, sourceId, data) {
  console.log("API updateSource - ID:", sourceId, "Data:", data);
  const res = await fetch(`${API_BASE_URL}/api/sources/${sourceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  console.log("API updateSource - Response:", result);
  return result;
}

// ---------------- DELETE SOURCE ----------------
export async function deleteSource(token, sourceId) {
  const res = await fetch(`${API_BASE_URL}/api/sources/${sourceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

// ---------------- USER MANAGEMENT (ADMIN) ----------------

export async function fetchUsers(token) {
  console.log("🔍 API fetchUsers - Début");
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("📡 fetchUsers response status:", res.status);

  if (!res.ok) {
    const data = await res.json();
    console.error("❌ Erreur fetchUsers:", res.status);
    throw new Error(
      data.message || "Erreur lors de la récupération des utilisateurs"
    );
  }

  const data = await res.json();
  console.log("🔍 Données utilisateurs reçues du backend:", data);
  console.log("🔧 Nombre d'utilisateurs:", data.length);

  if (Array.isArray(data) && data.length > 0) {
    console.log("📋 Premier utilisateur:", data[0]);
    console.log("🔧 Champ Fonction présent:", "Fonction" in data[0]);
    console.log("🔧 Valeur Fonction:", data[0].Fonction);
    console.log("🔧 Champ password présent:", "password" in data[0]);
    console.log("🔧 Valeur password:", data[0].password);
    console.log("🔧 Tous les champs:", Object.keys(data[0]));
  }
  return data;
}

export async function fetchUserById(userId, token) {
  console.log("🔍 API fetchUserById - Début pour ID:", userId);
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("📡 fetchUserById response status:", res.status);

  if (!res.ok) {
    const data = await res.json();
    console.error("❌ Erreur fetchUserById:", res.status);
    throw new Error(
      data.message || "Erreur lors de la récupération de l'utilisateur"
    );
  }

  const data = await res.json();
  console.log("🔍 Données utilisateur reçues du backend:", data);
  return data;
}

export async function fetchUserDecryptedPassword(userId, token) {
  console.log("🔍 API fetchUserDecryptedPassword - Début pour ID:", userId);
  const res = await fetch(
    `${API_BASE_URL}/api/users/${userId}/decrypt-password`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log("📡 fetchUserDecryptedPassword response status:", res.status);

  if (!res.ok) {
    const data = await res.json();
    console.error("❌ Erreur fetchUserDecryptedPassword:", res.status);
    throw new Error(
      data.message || "Erreur lors du déchiffrement du mot de passe"
    );
  }

  const data = await res.json();
  console.log("🔍 Mot de passe déchiffré reçu");
  return data;
}

export async function createUser(userData, token) {
  console.log("API createUser - Données reçues:", userData);
  console.log("API createUser - Token:", token ? "Présent" : "Manquant");
  console.log("🔧 Champ Fonction dans userData:", userData.Fonction);
  console.log("🔧 Tous les champs envoyés:", Object.keys(userData));
  console.log(
    "🔧 Valeur complète de userData:",
    JSON.stringify(userData, null, 2)
  );
  console.log("🔧 Type de Fonction:", typeof userData.Fonction);
  console.log("🔧 Fonction vide?", userData.Fonction === "");
  console.log("🔧 Fonction undefined?", userData.Fonction === undefined);

  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log("API createUser - Status de réponse:", res.status);
  console.log("API createUser - Headers de réponse:", res.headers);

  if (!res.ok) {
    const data = await res.json();
    console.error("API createUser - Erreur du serveur:", data);
    throw new Error(
      data.message || "Erreur lors de la création de l'utilisateur"
    );
  }

  const result = await res.json();
  console.log("API createUser - Résultat du serveur:", result);
  console.log("🔧 Champ Fonction dans la réponse:", result.Fonction);
  console.log("🔧 Tous les champs dans la réponse:", Object.keys(result));
  return result;
}

export async function updateUser(userId, userData, token) {
  console.log("API updateUser - ID:", userId);
  console.log("API updateUser - Données:", userData);
  console.log("🔧 Champ Fonction dans userData:", userData.Fonction);
  console.log("🔧 Champ role dans userData:", userData.role);

  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log("📡 Status de la réponse:", res.status);

  if (!res.ok) {
    const data = await res.json();
    console.error("❌ Erreur HTTP lors de la mise à jour:", res.status, data);
    throw new Error(
      data.message || "Erreur lors de la mise à jour de l'utilisateur"
    );
  }

  const result = await res.json();
  console.log("✅ Résultat mise à jour utilisateur:", result);
  return result;
}

export async function deleteUser(userId, token) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "Erreur lors de la suppression de l'utilisateur"
    );
  }

  return await res.json();
}

export async function changePassword(userId, passwordData, token) {
  const res = await fetch(
    `${API_BASE_URL}/api/users/${userId}/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "Erreur lors du changement de mot de passe"
    );
  }

  return await res.json();
}

export async function changeOwnPassword(passwordData, token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "Erreur lors du changement de mot de passe"
    );
  }

  return await res.json();
}

// ===== GESTION DES OFFRES =====
export const fetchOffers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offres`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📡 Réponse complète du backend:", data);
    console.log("📊 Type de données:", typeof data);
    console.log("📋 Est-ce un tableau?", Array.isArray(data));
    if (Array.isArray(data)) {
      console.log("✅ Nombre d'offres:", data.length);
    } else {
      console.log("⚠️ Structure des données:", data);
    }
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    return [];
  }
};

export const addOffer = async (offerData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offres`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateOffer = async (offerId, offerData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offres/${offerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteOffer = async (offerId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offres/${offerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getOffersStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offres/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    try {
      const offers = await fetchOffers(token);
      const stats = {
        total_items: offers.length,
        en_preparation_items: offers.filter(
          (item) => item.statut === "En préparation"
        ).length,
        envoyee_items: offers.filter((item) => item.statut === "Envoyée")
          .length,
        non_prepare_items: offers.filter(
          (item) => item.statut === "Non préparée"
        ).length,
      };
      return stats;
    } catch (fallbackError) {
      return {
        total_items: 0,
        en_preparation_items: 0,
        envoyee_items: 0,
        non_prepare_items: 0,
      };
    }
  }
};

// ===========================================
// GESTION DES CLIENTS
// ===========================================

export const fetchClients = async (token) => {
  try {
    console.log("Fetching clients with token:", token ? "Present" : "Missing");
    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Clients response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Clients API error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Clients data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
};

export const createClient = async (clientData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

export const updateClient = async (clientId, clientData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

export const deleteClient = async (clientId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

// ===========================================
// GESTION DES PARTENAIRES
// ===========================================

export const fetchPartners = async (token) => {
  try {
    console.log("Fetching partners with token:", token ? "Present" : "Missing");
    const response = await fetch(`${API_BASE_URL}/api/partenaires`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Partners response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Partners API error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Partners data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
};

export const createPartner = async (partnerData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/partenaires`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(partnerData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

export const updatePartner = async (partnerId, partnerData, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/partenaires/${partnerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partnerData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

export const deletePartner = async (partnerId, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/partenaires/${partnerId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

// ===========================================
// GESTION DU PERSONNEL
// ===========================================

export const fetchPersonnel = async (token) => {
  try {
    console.log(
      "Fetching personnel with token:",
      token ? "Present" : "Missing"
    );
    const response = await fetch(`${API_BASE_URL}/api/personnels`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Personnel response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Personnel API error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Données personnel reçues du backend:", data);
    if (Array.isArray(data) && data.length > 0) {
      console.log("📋 Premier membre du personnel:", data[0]);
      console.log("🔧 Champ Fonction présent:", "Fonction" in data[0]);
    }
    return data;
  } catch (error) {
    console.error("Error fetching personnel:", error);
    return [];
  }
};

export const createPersonnel = async (personnelData, token) => {
  try {
    console.log("API createPersonnel - Données reçues:", personnelData);
    console.log(
      "🔧 Champ Fonction dans personnelData:",
      personnelData.Fonction
    );

    const response = await fetch(`${API_BASE_URL}/api/personnels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(personnelData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

export const updatePersonnel = async (personnelId, personnelData, token) => {
  try {
    console.log("API updatePersonnel - ID:", personnelId);
    console.log("API updatePersonnel - Données:", personnelData);
    console.log(
      "🔧 Champ Fonction dans personnelData:",
      personnelData.Fonction
    );

    const response = await fetch(
      `${API_BASE_URL}/api/personnels/${personnelId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(personnelData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

export const deletePersonnel = async (personnelId, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/personnels/${personnelId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Erreur de connexion" };
  }
};

// ---------------- DEVIS API ----------------
export const fetchDevis = async (token) => {
  try {
    console.log("🔄 API: Chargement des devis...");

    const response = await fetch(`${API_BASE_URL}/api/devis`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 API: Réponse devis - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API: Erreur devis -", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Devis reçus:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors du chargement des devis:", error);
    return [];
  }
};

export const createDevis = async (devisData, token) => {
  try {
    console.log("🔄 API: Création d'un devis...");
    console.log("📋 API: Données envoyées:", devisData);
    console.log("📋 API: Champ numero_devis:", devisData.numero_devis);
    console.log("📋 API: Champ numero:", devisData.numero);
    console.log("📋 API: Toutes les clés:", Object.keys(devisData));

    const response = await fetch(`${API_BASE_URL}/api/devis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(devisData),
    });

    console.log("📡 API: Réponse création devis - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur création devis -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Devis créé avec succès:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors de la création du devis:", error);
    return { message: `Erreur lors de la création du devis: ${error.message}` };
  }
};

export const updateDevis = async (devisId, devisData, token) => {
  try {
    console.log("🔄 API: Mise à jour d'un devis...");
    console.log("📋 API: Devis ID:", devisId);
    console.log("📋 API: Données envoyées:", devisData);
    console.log("📋 API: Champ numero_devis:", devisData.numero_devis);
    console.log("📋 API: Champ numero:", devisData.numero);
    console.log("📋 API: Toutes les clés:", Object.keys(devisData));

    const response = await fetch(`${API_BASE_URL}/api/devis/${devisId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(devisData),
    });

    console.log("📡 API: Réponse mise à jour devis - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur mise à jour devis -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Devis mis à jour avec succès:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors de la mise à jour du devis:", error);
    return {
      message: `Erreur lors de la mise à jour du devis: ${error.message}`,
    };
  }
};

export const deleteDevis = async (devisId, token) => {
  try {
    console.log("🔄 API: Suppression d'un devis...");
    console.log("📋 API: Devis ID:", devisId);

    const response = await fetch(`${API_BASE_URL}/api/devis/${devisId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 API: Réponse suppression devis - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur suppression devis -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Devis supprimé avec succès:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors de la suppression du devis:", error);
    return {
      message: `Erreur lors de la suppression du devis: ${error.message}`,
    };
  }
};

export const transformDevisToFacture = async (devisId, token) => {
  try {
    console.log("🔄 API: Transformation devis en facture...");
    console.log("📋 API: Devis ID:", devisId);

    const response = await fetch(
      `${API_BASE_URL}/api/devis/${devisId}/transform-to-facture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "📡 API: Réponse transformation devis - Status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur transformation devis -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Devis transformé en facture avec succès:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors de la transformation du devis:", error);
    return { message: `Erreur lors de la transformation: ${error.message}` };
  }
};

export const fetchDevisEtats = async (token) => {
  try {
    console.log("🔄 API: Chargement des états des devis...");

    const response = await fetch(`${API_BASE_URL}/api/devis/etats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 API: Réponse états devis - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API: Erreur états devis -", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: États devis reçus:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ API: Erreur lors du chargement des états des devis:",
      error
    );
    // Retourner les états par défaut si l'API n'est pas disponible
    console.log("🔄 API: Utilisation des états par défaut pour les devis");
    return ["Validé", "Transformé en facture"];
  }
};

// ---------------- FACTURES API ----------------
export const fetchFactures = async (token) => {
  try {
    console.log("🔄 API: Chargement des factures...");

    const response = await fetch(`${API_BASE_URL}/api/factures`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 API: Réponse factures - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API: Erreur factures -", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Factures reçues:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors du chargement des factures:", error);
    return [];
  }
};

export const createFacture = async (factureData, token) => {
  try {
    console.log("🔄 API: Création d'une facture...");
    console.log("📋 API: Données envoyées:", factureData);
    console.log("📋 API: Champ numero_facture:", factureData.numero_facture);
    console.log("📋 API: Champ numero:", factureData.numero);
    console.log("📋 API: Toutes les clés:", Object.keys(factureData));

    const response = await fetch(`${API_BASE_URL}/api/factures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(factureData),
    });

    console.log("📡 API: Réponse création facture - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur création facture -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Facture créée avec succès:", data);
    return data;
  } catch (error) {
    console.error("❌ API: Erreur lors de la création de la facture:", error);
    return {
      message: `Erreur lors de la création de la facture: ${error.message}`,
    };
  }
};

export const updateFacture = async (factureId, factureData, token) => {
  try {
    console.log("🔄 API: Mise à jour d'une facture...");
    console.log("📋 API: Facture ID:", factureId);
    console.log("📋 API: Données envoyées:", factureData);
    console.log("📋 API: Champ numero_facture:", factureData.numero_facture);
    console.log("📋 API: Champ numero:", factureData.numero);
    console.log("📋 API: Toutes les clés:", Object.keys(factureData));

    const response = await fetch(`${API_BASE_URL}/api/factures/${factureId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(factureData),
    });

    console.log(
      "📡 API: Réponse mise à jour facture - Status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur mise à jour facture -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Facture mise à jour avec succès:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ API: Erreur lors de la mise à jour de la facture:",
      error
    );
    return {
      message: `Erreur lors de la mise à jour de la facture: ${error.message}`,
    };
  }
};

export const deleteFacture = async (factureId, token) => {
  try {
    console.log("🔄 API: Suppression d'une facture...");
    console.log("📋 API: Facture ID:", factureId);

    const response = await fetch(`${API_BASE_URL}/api/factures/${factureId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "📡 API: Réponse suppression facture - Status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur suppression facture -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: Facture supprimée avec succès:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ API: Erreur lors de la suppression de la facture:",
      error
    );
    return {
      message: `Erreur lors de la suppression de la facture: ${error.message}`,
    };
  }
};

export const fetchFacturesEtats = async (token) => {
  try {
    console.log("🔄 API: Chargement des états des factures...");

    const response = await fetch(`${API_BASE_URL}/api/factures/etats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 API: Réponse états factures - Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API: Erreur états factures -",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ API: États factures reçus:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ API: Erreur lors du chargement des états des factures:",
      error
    );
    // Retourner les états par défaut si l'API n'est pas disponible
    console.log("🔄 API: Utilisation des états par défaut pour les factures");
    return ["A envoyer au client", "En attente de payement", "Payée"];
  }
};

// Fonction utilitaire pour les appels API Flask
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API Flask ${endpoint}:`, error);
    throw error;
  }
};

// ===== CATÉGORIES DE LIENS =====
export const linkCategoriesAPI = {
  // Récupérer toutes les catégories
  getAll: () => apiCall("/link-categories"),

  // Récupérer une catégorie par ID
  getById: (id) => apiCall(`/link-categories/${id}`),

  // Créer une nouvelle catégorie
  create: (categoryData) =>
    apiCall("/link-categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  // Modifier une catégorie
  update: (id, categoryData) =>
    apiCall(`/link-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  // Supprimer une catégorie
  delete: (id) =>
    apiCall(`/link-categories/${id}`, {
      method: "DELETE",
    }),
};

// ===== CATÉGORIES D'OFFRES =====
export const offerCategoriesAPI = {
  // Récupérer toutes les catégories
  getAll: () => apiCall("/offer-categories"),

  // Récupérer une catégorie par ID
  getById: (id) => apiCall(`/offer-categories/${id}`),

  // Créer une nouvelle catégorie
  create: (categoryData) =>
    apiCall("/offer-categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  // Modifier une catégorie
  update: (id, categoryData) =>
    apiCall(`/offer-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  // Supprimer une catégorie
  delete: (id) =>
    apiCall(`/offer-categories/${id}`, {
      method: "DELETE",
    }),
};

// ===== LIENS UTILES =====
export const linksAPI = {
  // Récupérer tous les liens
  getAll: (categorie = null) => {
    const endpoint = categorie
      ? `/links?categorie=${encodeURIComponent(categorie)}`
      : "/links";
    return apiCall(endpoint);
  },

  // Récupérer un lien par ID
  getById: (id) => apiCall(`/links/${id}`),

  // Créer un nouveau lien
  create: (linkData) =>
    apiCall("/links", {
      method: "POST",
      body: JSON.stringify(linkData),
    }),

  // Modifier un lien
  update: (id, linkData) =>
    apiCall(`/links/${id}`, {
      method: "PUT",
      body: JSON.stringify(linkData),
    }),

  // Supprimer un lien
  delete: (id) =>
    apiCall(`/links/${id}`, {
      method: "DELETE",
    }),
};

// ===== STATUTS DE DEVIS =====
export const quoteStatusesAPI = {
  // Récupérer tous les statuts
  getAll: () => apiCall("/quote-statuses"),

  // Récupérer un statut par ID
  getById: (id) => apiCall(`/quote-statuses/${id}`),

  // Créer un nouveau statut
  create: (statusData) =>
    apiCall("/quote-statuses", {
      method: "POST",
      body: JSON.stringify(statusData),
    }),

  // Modifier un statut
  update: (id, statusData) =>
    apiCall(`/quote-statuses/${id}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    }),

  // Supprimer un statut
  delete: (id) =>
    apiCall(`/quote-statuses/${id}`, {
      method: "DELETE",
    }),
};

// ===== STATUTS DE FACTURES =====
export const invoiceStatusesAPI = {
  // Récupérer tous les statuts
  getAll: () => apiCall("/invoice-statuses"),

  // Récupérer un statut par ID
  getById: (id) => apiCall(`/invoice-statuses/${id}`),

  // Créer un nouveau statut
  create: (statusData) =>
    apiCall("/invoice-statuses", {
      method: "POST",
      body: JSON.stringify(statusData),
    }),

  // Modifier un statut
  update: (id, statusData) =>
    apiCall(`/invoice-statuses/${id}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    }),

  // Supprimer un statut
  delete: (id) =>
    apiCall(`/invoice-statuses/${id}`, {
      method: "DELETE",
    }),
};

// ===== STATUTS D'OFFRES =====
export const offerStatusesAPI = {
  // Récupérer tous les statuts
  getAll: () => apiCall("/offer-statuses"),

  // Récupérer un statut par ID
  getById: (id) => apiCall(`/offer-statuses/${id}`),

  // Créer un nouveau statut
  create: (statusData) =>
    apiCall("/offer-statuses", {
      method: "POST",
      body: JSON.stringify(statusData),
    }),

  // Modifier un statut
  update: (id, statusData) =>
    apiCall(`/offer-statuses/${id}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    }),

  // Supprimer un statut
  delete: (id) =>
    apiCall(`/offer-statuses/${id}`, {
      method: "DELETE",
    }),
};

// ===== GESTION DES RÔLES ET PERMISSIONS =====
export const rolesAPI = {
  // Récupérer tous les rôles
  getAll: async (token) => {
    try {
      console.log(
        "🔧 rolesAPI.getAll - Token:",
        token ? "Présent" : "Manquant"
      );
      console.log("🔧 rolesAPI.getAll - URL:", `${API_BASE_URL}/api/roles`);

      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔧 rolesAPI.getAll - Status:", response.status);
      console.log("🔧 rolesAPI.getAll - OK:", response.ok);

      if (!response.ok) {
        console.warn(
          "❌ Impossible de charger les rôles depuis l'API - Status:",
          response.status
        );
        const errorText = await response.text();
        console.warn("❌ Erreur détaillée:", errorText);
        return [];
      }

      const data = await response.json();
      console.log("🔧 rolesAPI.getAll - Données reçues:", data);
      return data;
    } catch (error) {
      console.warn("❌ Erreur lors du chargement des rôles:", error);
      return [];
    }
  },

  // Récupérer un rôle par ID
  getById: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn(`Rôle avec ID ${id} non trouvé`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn("Erreur lors du chargement du rôle:", error);
      return null;
    }
  },

  // Créer un nouveau rôle
  create: async (roleData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "❌ Erreur HTTP lors de la création:",
          response.status,
          errorData
        );
        throw new Error(
          errorData.message || "Erreur lors de la création du rôle"
        );
      }

      const result = await response.json();
      console.log("✅ Réponse création rôle:", result);
      return result;
    } catch (error) {
      console.error("Erreur lors de la création du rôle:", error);
      throw error;
    }
  },

  // Modifier un rôle
  update: async (id, roleData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la modification du rôle"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
      throw error;
    }
  },

  // Supprimer un rôle
  delete: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression du rôle"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression du rôle:", error);
      throw error;
    }
  },

  // Récupérer les permissions disponibles
  getAvailablePermissions: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn("Impossible de charger les permissions depuis l'API");
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn("Erreur lors du chargement des permissions:", error);
      return [];
    }
  },

  // Récupérer les permissions d'un utilisateur
  getUserPermissions: async (userId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Permissions pour l'utilisateur ${userId} non trouvées`);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn(
        "Erreur lors du chargement des permissions utilisateur:",
        error
      );
      return [];
    }
  },

  // Assigner un rôle à un utilisateur
  assignRole: async (userId, roleId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/assign-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roleId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'assignation du rôle"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'assignation du rôle:", error);
      throw error;
    }
  },

  // Retirer un rôle d'un utilisateur
  removeRole: async (userId, roleId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/remove-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roleId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du retrait du rôle");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du retrait du rôle:", error);
      throw error;
    }
  },

  // Récupérer les permissions de l'utilisateur actuel
  getCurrentUserPermissions: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn(
          "Impossible de charger les permissions de l'utilisateur actuel"
        );
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn(
        "Erreur lors du chargement des permissions actuelles:",
        error
      );
      return [];
    }
  },

  // Récupérer tous les utilisateurs avec leurs rôles
  getUsersWithRoles: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users-with-roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn("Impossible de charger les utilisateurs avec rôles");
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn(
        "Erreur lors du chargement des utilisateurs avec rôles:",
        error
      );
      return [];
    }
  },

  // Tester une permission spécifique
  testPermission: async (permissionName, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/test-permission/${permissionName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Impossible de tester la permission ${permissionName}`);
        return false;
      }

      const data = await response.json();
      return data.has_permission || false;
    } catch (error) {
      console.warn(
        `Erreur lors du test de la permission ${permissionName}:`,
        error
      );
      return false;
    }
  },

  // Initialiser les rôles et permissions par défaut
  initializeDefaults: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/init`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'initialisation");
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation des rôles et permissions:",
        error
      );
      throw error;
    }
  },

  // Test de connexion API
  testConnection: async (token) => {
    try {
      // Test avec une route plus simple d'abord
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du test de connexion:", error);
      throw error;
    }
  },

  // Ajouter permission à un rôle
  addPermissionToRole: async (roleId, permissionId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/roles/${roleId}/permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissionId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'ajout de permission"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'ajout de permission au rôle:", error);
      throw error;
    }
  },

  // Retirer permission d'un rôle
  removePermissionFromRole: async (roleId, permissionId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/roles/${roleId}/permissions`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissionId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du retrait de permission"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors du retrait de permission du rôle:", error);
      throw error;
    }
  },

  // Mise à jour en lot des rôles
  bulkUpdate: async (rolesData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roles: rolesData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour en lot"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour en lot des rôles:", error);
      throw error;
    }
  },

  // Exporter rôles et permissions
  export: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'export des rôles:", error);
      throw error;
    }
  },

  // Importer rôles et permissions
  import: async (importData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(importData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'import");
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'import des rôles:", error);
      throw error;
    }
  },
};

// ===== APPELS D'OFFRES IA =====
export const offresIAAPI = {
  // Récupérer les statistiques
  getStats: async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/offres-ia/statistiques`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Erreur chargement stats offres IA:", error);
      return { total: 0, informatique: 0, masques: 0 };
    }
  },

  // Récupérer tous les appels d'offres informatiques
  getAll: async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/offres-ia/informatique`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("📊 Offres informatiques reçues:", data?.length || 0);

      // Filtrer les offres en corbeille (au cas où le backend les retourne)
      const offresFiltrees = data.filter((offre) => !offre.en_corbeille);
      console.log(
        "📊 Offres informatiques (hors corbeille):",
        offresFiltrees.length
      );

      return offresFiltrees;
    } catch (error) {
      console.error("Erreur chargement offres IA:", error);
      return [];
    }
  },

  // Masquer un appel d'offres (faux positif)
  masquer: async (url, token) => {
    try {
      console.log("Tentative de masquage pour URL:", url);

      const response = await fetch(`${API_BASE_URL}/api/offres-ia/masquer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      console.log("Statut de la réponse:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("Données reçues:", data);
      } catch (parseError) {
        console.error("Erreur parsing JSON:", parseError);
        throw new Error(
          `Erreur serveur: ${response.status} - Impossible de parser la réponse`
        );
      }

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || `Erreur HTTP ${response.status}`;
        console.error("Erreur du serveur:", errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("Erreur masquage offre IA:", error);
      console.error("Type d'erreur:", typeof error);
      console.error("Message:", error.message);
      throw error;
    }
  },

  // Démasquer un appel d'offres
  demasquer: async (url, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offres-ia/demasquer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Erreur ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Erreur démasquage offre IA:", error);
      throw error;
    }
  },

  // Récupérer les offres masquées
  getMasques: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offres-ia/masques`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("📊 Offres masquées reçues:", data?.length || 0);

      // S'assurer que toutes les offres ont est_masque: true
      // et filtrer celles qui sont en corbeille
      const offresAvecFlag = data
        .filter((offre) => !offre.en_corbeille) // Exclure corbeille
        .map((offre) => ({
          ...offre,
          est_masque: true, // Forcer le flag car ce sont des offres masquées
        }));

      console.log(
        "📊 Offres masquées (hors corbeille):",
        offresAvecFlag.length
      );
      return offresAvecFlag;
    } catch (error) {
      console.error("Erreur chargement offres masquées:", error);
      return [];
    }
  },
};

// ===== FONCTIONS UTILITAIRES =====
export const apiUtils = {
  // Test de connexion API Flask
  testFlaskConnection: () => apiCall("/test"),

  // Récupérer toutes les données de configuration
  getAllConfig: async () => {
    try {
      const [
        linkCategories,
        offerCategories,
        links,
        quoteStatuses,
        invoiceStatuses,
        offerStatuses,
      ] = await Promise.all([
        linkCategoriesAPI.getAll(),
        offerCategoriesAPI.getAll(),
        linksAPI.getAll(),
        quoteStatusesAPI.getAll(),
        invoiceStatusesAPI.getAll(),
        offerStatusesAPI.getAll(),
      ]);

      return {
        linkCategories,
        offerCategories,
        links,
        quoteStatuses,
        invoiceStatuses,
        offerStatuses,
      };
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
      throw error;
    }
  },
};
