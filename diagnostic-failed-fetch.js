// Script de diagnostic pour le problème "Failed to fetch"
// Copiez et collez ce code dans la console de votre application Vercel (F12)

console.log("🔍 Diagnostic du problème 'Failed to fetch'");
console.log("==========================================");

// Test 1: Vérifier les URLs
console.log("\n1. 📍 URLs configurées :");
console.log("API_BASE_URL:", "https://applesoffres-production.up.railway.app");
console.log(
  "FLASK_API_BASE_URL:",
  "https://applesoffres-production.up.railway.app/api"
);

// Test 2: Test de connectivité basique
console.log("\n2. 🌐 Test de connectivité :");
fetch("https://applesoffres-production.up.railway.app/api/test")
  .then((response) => {
    console.log("✅ Backend accessible - Status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("📦 Données reçues:", data);
  })
  .catch((error) => {
    console.log("❌ Erreur de connectivité:", error);
  });

// Test 3: Test de login (sans token)
console.log("\n3. 🔐 Test de login :");
fetch("https://applesoffres-production.up.railway.app/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@test.com",
    password: "test",
  }),
})
  .then((response) => {
    console.log("✅ Login endpoint accessible - Status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("📦 Réponse login:", data);
  })
  .catch((error) => {
    console.log("❌ Erreur login:", error);
  });

// Test 4: Test avec token (si disponible)
console.log("\n4. 🎫 Test avec token :");
const token = localStorage.getItem("token");
if (token) {
  console.log("🔑 Token trouvé:", token.substring(0, 20) + "...");

  fetch("https://applesoffres-production.up.railway.app/api/offres", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      console.log("✅ API offres accessible - Status:", response.status);
      return response.text();
    })
    .then((data) => {
      console.log("📦 Données offres:", data.substring(0, 200) + "...");
    })
    .catch((error) => {
      console.log("❌ Erreur API offres:", error);
    });
} else {
  console.log("❌ Aucun token trouvé dans localStorage");
}

console.log("\n🔍 Diagnostic terminé - Vérifiez les résultats ci-dessus");

