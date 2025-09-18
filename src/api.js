// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = "https://applesoffres-production.up.railway.app";
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
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "Erreur lors de la récupération des utilisateurs"
    );
  }

  return await res.json();
}

export async function createUser(userData, token) {
  console.log("API createUser - Données reçues:", userData);
  console.log("API createUser - Token:", token ? "Présent" : "Manquant");

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
  return result;
}

export async function updateUser(userId, userData, token) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "Erreur lors de la mise à jour de l'utilisateur"
    );
  }

  return await res.json();
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
          (item) => item.statut === "Non préparé"
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

export const fetchCallsForTender = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calls-for-tender`, {
      method: "GET",
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

export const createCallForTender = async (callData, token) => {
  try {
    console.log("Données reçues pour création:", callData);
    console.log("Token utilisé:", token ? "Présent" : "Manquant");
    const formData = new FormData();
    formData.append("title", callData.title);
    formData.append("source", callData.source);
    formData.append("client", callData.client);
    formData.append("state", callData.state);
    formData.append("description", callData.description || "");
    formData.append("deadline", callData.deadline);
    formData.append("price", (callData.price || 1).toString());
    formData.append("type", callData.type || "appel_offre");
    formData.append("commentaire", callData.commentaire || "");

    if (callData.attachments && callData.attachments.length > 0) {
      console.log("Pièces jointes à envoyer:", callData.attachments);
      callData.attachments.forEach((file, index) => {
        console.log(
          `Ajout de la pièce jointe ${index}:`,
          file.name,
          file.type,
          file.size
        );
        formData.append(`attachment_${index}`, file);
      });
      console.log(
        "FormData après ajout des pièces jointes:",
        Array.from(formData.entries())
      );
    } else {
      console.log("Aucune pièce jointe à envoyer");
    }

    const response = await fetch(`${API_BASE_URL}/api/calls-for-tender`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Réponse du backend après création:", data);
    return data;
  } catch (error) {
    console.log("Erreur lors de la création:", error);
    return { message: "Erreur de connexion" };
  }
};

export const updateCallForTender = async (callId, callData, token) => {
  try {
    console.log("Données reçues pour modification:", callData);
    const formData = new FormData();
    formData.append("title", callData.title);
    formData.append("source", callData.source);
    formData.append("client", callData.client);
    formData.append("state", callData.state);
    formData.append("description", callData.description || "");
    formData.append("deadline", callData.deadline);
    formData.append("price", (callData.price || 1).toString());
    formData.append("type", callData.type || "appel_offre");
    formData.append("commentaire", callData.commentaire || "");

    if (callData.attachments && callData.attachments.length > 0) {
      console.log("Pièces jointes à envoyer (update):", callData.attachments);
      callData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    } else {
      console.log("Aucune pièce jointe à envoyer (update)");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/calls-for-tender/${callId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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

export const deleteCallForTender = async (callId, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/calls-for-tender/${callId}`,
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
    console.log("Personnel data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching personnel:", error);
    return [];
  }
};

export const createPersonnel = async (personnelData, token) => {
  try {
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
