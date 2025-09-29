// Script de test des endpoints Railway
// Copiez et collez ce code dans la console de votre application Vercel (F12)

console.log("🔍 Test des endpoints Railway");
console.log("=============================");

// Test 1: Endpoint principal
console.log("\n1. 🌐 Test endpoint principal :");
fetch("https://applesoffres-production.up.railway.app/api/test")
  .then((response) => {
    console.log("✅ /api/test - Status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("📦 Données:", data);
  })
  .catch((error) => {
    console.log("❌ Erreur /api/test:", error);
  });

// Test 2: Endpoint login
console.log("\n2. 🔐 Test endpoint login :");
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
    console.log("✅ /login - Status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("📦 Réponse:", data);
  })
  .catch((error) => {
    console.log("❌ Erreur /login:", error);
  });

// Test 3: Endpoint Flask links (sans /api)
console.log("\n3. 🔗 Test endpoint Flask links :");
fetch("https://applesoffres-production.up.railway.app/api/links")
  .then((response) => {
    console.log("✅ /api/links - Status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("📦 Données:", data.substring(0, 200) + "...");
  })
  .catch((error) => {
    console.log("❌ Erreur /api/links:", error);
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
      console.log("✅ /api/offres - Status:", response.status);
      return response.text();
    })
    .then((data) => {
      console.log("📦 Données:", data.substring(0, 200) + "...");
    })
    .catch((error) => {
      console.log("❌ Erreur /api/offres:", error);
    });
} else {
  console.log("❌ Aucun token trouvé");
}

console.log("\n🔍 Tests terminés - Vérifiez les résultats ci-dessus");

