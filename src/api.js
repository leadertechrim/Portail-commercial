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
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "Erreur lors de la création de l'utilisateur"
    );
  }

  return await res.json();
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

// ===== GESTION DES APPELS D'OFFRES (PANIER) =====
export const fetchCartItems = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/panier`, {
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
      console.log("Données récupérées du backend:", data);

      if (Array.isArray(data)) {
        const mappedData = data.map((item) => ({
          _id: item._id,
          title: item.title || "Titre non défini",
          type: "appel_offre",
          description: item.description || "",
          source: item.source || "",
          pieces_jointes: item.pieces_jointes || item.attachments || [],
          commentaire:
            item.Commentaire ||
            item.commentaire ||
            item.note ||
            item.comment ||
            "",
          quantity: 1,
          price: item.price || 0,
          status: item.state || "pending",
          client: item.client || "",
          deadline: item.deadline,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }));
        console.log("Données mappées:", mappedData);
        return mappedData;
      }

      return data;
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

export const addCartItem = async (itemData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/panier`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
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

export const updateCartItem = async (itemId, itemData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/panier/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
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

export const deleteCartItem = async (itemId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/panier/${itemId}`, {
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

export const getCartStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/panier/stats`, {
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
      const cartItems = await fetchCartItems(token);
      const stats = {
        total_items: cartItems.length,
        non_prepare_items: cartItems.filter(
          (item) => item.status === "non_prepare"
        ).length,
        en_preparation_items: cartItems.filter(
          (item) => item.status === "en_preparation"
        ).length,
        envoyee_items: cartItems.filter((item) => item.status === "envoyee")
          .length,
        pending_items: cartItems.filter(
          (item) => item.status === "pending" || item.status === "ouvert"
        ).length,
        approved_items: cartItems.filter(
          (item) => item.status === "approved" || item.status === "attribue"
        ).length,
        completed_items: cartItems.filter(
          (item) => item.status === "completed" || item.status === "ferme"
        ).length,
        total_value: cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
      return stats;
    } catch (fallbackError) {
      return {
        total_items: 0,
        non_prepare_items: 0,
        en_preparation_items: 0,
        envoyee_items: 0,
        pending_items: 0,
        approved_items: 0,
        completed_items: 0,
        total_value: 0,
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
