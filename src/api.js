// // src/api.js
// export async function loginUser(email, password) {
//   const res = await fetch("http://127.0.0.1:8000/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   if (!res.ok) {
//     const data = await res.json();
//     throw new Error(data.message || "Erreur login");
//   }

//   return await res.json(); // { token, role }
// }

// export async function fetchSources(token) {
//   const res = await fetch("http://127.0.0.1:8000/api/sources", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.ok ? await res.json() : [];
// }

// export async function addSource(token, source) {
//   const res = await fetch("http://127.0.0.1:8000/api/sources", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(source),
//   });
//   return await res.json();
// }

// src/api.js

// ✅ Déclare ton backend une seule fois
const API_BASE_URL = "http://127.0.0.1:8000";
// const API_BASE_URL = "https://applesoffres-production.up.railway.app/";

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

  return await res.json(); // { token, role }
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
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("fetchSourcesGrouped failed:", e);
    return { nationale: [], internationale: [] };
  }
}

// ... existing code ...

// ---------------- UPDATE SOURCE ----------------
export async function updateSource(token, sourceId, data) {
  const res = await fetch(`${API_BASE_URL}/api/sources/${sourceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// ---------------- DELETE SOURCE ----------------
export async function deleteSource(token, sourceId) {
  const res = await fetch(`${API_BASE_URL}/api/sources/${sourceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}
