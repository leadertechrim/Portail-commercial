module.exports = {
  extends: ["react-app", "react-app/jest"],
  rules: {
    // Désactiver les warnings pour les variables non utilisées dans les paramètres de fonction
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    // Désactiver les warnings pour les hooks avec dépendances manquantes dans certains cas
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "(useMyCustomHook|useAnotherCustomHook)",
      },
    ],
    // Permettre les console.log en développement
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    // Permettre les console.error
    "no-console": "off",
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
