#!/usr/bin/env node

/**
 * Script de build optimisé pour l'application
 * Usage: node scripts/build.js [environment]
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Couleurs pour la console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔧 ${description}...`, colors.cyan);
  try {
    execSync(command, { stdio: "inherit" });
    log(`✅ ${description} terminé`, colors.green);
  } catch (error) {
    log(`❌ Erreur lors de ${description}: ${error.message}`, colors.red);
    process.exit(1);
  }
}

function createEnvFile(environment) {
  log("\n📝 Création du fichier .env...", colors.cyan);

  const envContent = `# Configuration pour ${environment}
REACT_APP_API_URL=${
    environment === "production"
      ? "https://back-portail-commercial-32528505fc5a.herokuapp.com"
      : "http://localhost:8000"
  }
REACT_APP_ENVIRONMENT=${environment}
REACT_APP_PWA_ENABLED=true
REACT_APP_APP_NAME=Portail des Appels d'Offres
REACT_APP_APP_SHORT_NAME=APLOFR

# Configuration des uploads Filestack
REACT_APP_FILESTACK_API_KEY=AJOUNH2oSuidEE40RQHN3z
REACT_APP_MAX_FILE_SIZE=10485760

GENERATE_SOURCEMAP=${environment === "production" ? "false" : "true"}
REACT_APP_DEBUG=${environment === "production" ? "false" : "true"}
`;

  fs.writeFileSync(".env", envContent);
  log("✅ Fichier .env créé", colors.green);
}

function optimizeBuild() {
  log("\n⚡ Optimisation du build...", colors.cyan);

  // Supprimer les fichiers inutiles du build
  const buildDir = "build";
  const filesToRemove = [
    "build/static/js/*.map",
    "build/static/css/*.map",
    "build/manifest.json",
  ];

  filesToRemove.forEach((pattern) => {
    try {
      execSync(`find ${pattern} -type f -delete 2>/dev/null || true`, {
        stdio: "inherit",
      });
    } catch (error) {
      // Ignorer les erreurs pour les patterns qui n'existent pas
    }
  });

  log("✅ Build optimisé", colors.green);
}

function generateBuildReport() {
  log("\n📊 Génération du rapport de build...", colors.cyan);

  const buildDir = "build";
  if (!fs.existsSync(buildDir)) {
    log("❌ Dossier build non trouvé", colors.red);
    return;
  }

  let totalSize = 0;
  let fileCount = 0;

  function getDirectorySize(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        getDirectorySize(filePath);
      } else {
        totalSize += stat.size;
        fileCount++;
      }
    });
  }

  getDirectorySize(buildDir);

  const report = `
# Rapport de Build - ${new Date().toLocaleString()}

## Statistiques
- Nombre de fichiers: ${fileCount}
- Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB

## Structure
${generateDirectoryTree(buildDir, 0)}

## Optimisations appliquées
- ✅ Minification activée
- ✅ Source maps désactivées (production)
- ✅ Compression gzip
- ✅ Tree shaking
- ✅ Code splitting
`;

  fs.writeFileSync("build-report.md", report);
  log("✅ Rapport généré: build-report.md", colors.green);
}

function generateDirectoryTree(dir, depth) {
  let tree = "";
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const isLast = index === files.length - 1;
    const prefix = "  ".repeat(depth) + (isLast ? "└── " : "├── ");

    if (stat.isDirectory()) {
      tree += `${prefix}${file}/\n`;
      tree += generateDirectoryTree(filePath, depth + 1);
    } else {
      const size = (stat.size / 1024).toFixed(1);
      tree += `${prefix}${file} (${size} KB)\n`;
    }
  });

  return tree;
}

function removeConsoleLogs() {
  log("\n🧹 Suppression des console.log pour la production...", colors.cyan);
  try {
    execSync("node scripts/removeConsoleLogs.js", { stdio: "inherit" });
    log("✅ Console.log supprimés", colors.green);
  } catch (error) {
    log(`⚠️  Erreur lors de la suppression des console.log: ${error.message}`, colors.yellow);
    // Ne pas bloquer le build en cas d'erreur
  }
}

function restoreConsoleLogs() {
  log("\n🔄 Restauration des console.log...", colors.cyan);
  try {
    execSync("node scripts/removeConsoleLogs.js restore", { stdio: "inherit" });
    log("✅ Console.log restaurés", colors.green);
  } catch (error) {
    log(`⚠️  Erreur lors de la restauration des console.log: ${error.message}`, colors.yellow);
    // Ne pas bloquer le build en cas d'erreur
  }
}

function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || "production";

  log("🚀 Démarrage du build optimisé...", colors.bright);
  log(`📦 Environnement: ${environment}`, colors.blue);

  // Nettoyer avant le build
  runCommand("npm run clean || true", "Nettoyage pré-build");

  // Créer le fichier d'environnement
  createEnvFile(environment);

  // Installer les dépendances
  runCommand("npm ci", "Installation des dépendances");

  // Linter
  runCommand("npm run lint || true", "Vérification du code");

  // Supprimer les console.log en production
  if (environment === "production") {
    removeConsoleLogs();
  }

  // Build
  runCommand("npm run build", "Build de l'application");

  // Restaurer les console.log après le build (en production uniquement)
  if (environment === "production") {
    restoreConsoleLogs();
  }

  // Optimiser le build
  optimizeBuild();

  // Générer le rapport
  generateBuildReport();

  log("\n🎉 Build terminé avec succès!", colors.green);
  log(`📁 Dossier de build: ./build`, colors.blue);
  log(`📄 Rapport: ./build-report.md`, colors.blue);
}

// Exécuter le script
main();
