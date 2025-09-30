#!/usr/bin/env node

/**
 * Script de nettoyage et maintenance de l'application
 * Usage: node scripts/cleanup.js [option]
 */

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

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function removeFile(filePath) {
  if (checkFileExists(filePath)) {
    fs.unlinkSync(filePath);
    log(`✅ Supprimé: ${filePath}`, colors.green);
    return true;
  }
  return false;
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    log(`✅ Supprimé: ${dirPath}`, colors.green);
    return true;
  }
  return false;
}

function cleanBuildFiles() {
  log("\n🧹 Nettoyage des fichiers de build...", colors.cyan);

  const buildFiles = [
    "build",
    "dist",
    ".next",
    "out",
    "coverage",
    ".nyc_output",
  ];

  buildFiles.forEach((file) => {
    removeDirectory(file);
  });
}

function cleanNodeModules() {
  log("\n📦 Nettoyage de node_modules...", colors.cyan);
  removeDirectory("node_modules");
  removeFile("package-lock.json");
}

function cleanLogs() {
  log("\n📝 Nettoyage des logs...", colors.cyan);

  const logFiles = [
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "lerna-debug.log*",
    ".npm",
    ".eslintcache",
  ];

  // Nettoyer les fichiers de log courants
  const currentLogs = [
    "npm-debug.log",
    "yarn-debug.log",
    "yarn-error.log",
    ".eslintcache",
  ];

  currentLogs.forEach((log) => {
    removeFile(log);
  });
}

function cleanTempFiles() {
  log("\n🗑️ Nettoyage des fichiers temporaires...", colors.cyan);

  const tempFiles = [
    ".DS_Store",
    "Thumbs.db",
    ".vscode/settings.json",
    ".idea",
    "*.tmp",
    "*.temp",
  ];

  tempFiles.forEach((file) => {
    if (file.includes("*")) {
      // Pour les patterns avec wildcards, on cherche les fichiers correspondants
      const dir = path.dirname(file);
      const pattern = path.basename(file);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach((f) => {
          if (f.includes(pattern.replace("*", ""))) {
            removeFile(path.join(dir, f));
          }
        });
      }
    } else {
      removeFile(file);
    }
  });
}

function cleanUnusedFiles() {
  log("\n🧽 Nettoyage des fichiers inutilisés...", colors.cyan);

  const unusedFiles = [
    "src/components/PasswordModal.js",
    "src/components/PasswordModal.css",
    "src/pages/AIOffersPage.js",
    "src/pages/AIOffersPage.css",
    "src/pages/OfferStatusPage.js",
    "src/pages/OfferStatusPage.css",
    "src/pages/QuoteStatusPage.js",
    "src/pages/QuoteStatusPage.css",
    "src/pages/InvoiceStatusPage.js",
    "src/pages/InvoiceStatusPage.css",
    "src/styles/Buttons.css",
    "src/styles/Offlinebanner.css",
  ];

  unusedFiles.forEach((file) => {
    removeFile(file);
  });
}

function analyzeCodebase() {
  log("\n📊 Analyse du codebase...", colors.cyan);

  const srcDir = "src";
  const stats = {
    components: 0,
    pages: 0,
    hooks: 0,
    styles: 0,
    totalLines: 0,
  };

  function analyzeDirectory(dir, type) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        analyzeDirectory(filePath, type);
      } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
        stats[type]++;
        const content = fs.readFileSync(filePath, "utf8");
        stats.totalLines += content.split("\n").length;
      }
    });
  }

  analyzeDirectory(path.join(srcDir, "components"), "components");
  analyzeDirectory(path.join(srcDir, "pages"), "pages");
  analyzeDirectory(path.join(srcDir, "hooks"), "hooks");
  analyzeDirectory(path.join(srcDir, "styles"), "styles");

  log(`📈 Statistiques:`, colors.blue);
  log(`   • Composants: ${stats.components}`, colors.yellow);
  log(`   • Pages: ${stats.pages}`, colors.yellow);
  log(`   • Hooks: ${stats.hooks}`, colors.yellow);
  log(`   • Fichiers CSS: ${stats.styles}`, colors.yellow);
  log(`   • Lignes de code: ${stats.totalLines}`, colors.yellow);
}

function showHelp() {
  log(
    "\n🚀 Script de nettoyage et maintenance de l'application APLOFR",
    colors.bright
  );
  log("\nUsage:", colors.cyan);
  log("  node scripts/cleanup.js [option]", colors.yellow);
  log("\nOptions disponibles:", colors.cyan);
  log("  build      - Nettoyer les fichiers de build", colors.green);
  log(
    "  deps       - Nettoyer node_modules et package-lock.json",
    colors.green
  );
  log("  logs       - Nettoyer les fichiers de logs", colors.green);
  log("  temp       - Nettoyer les fichiers temporaires", colors.green);
  log("  unused     - Supprimer les fichiers inutilisés", colors.green);
  log("  analyze    - Analyser le codebase", colors.green);
  log("  all        - Effectuer tous les nettoyages", colors.green);
  log("  help       - Afficher cette aide", colors.green);
  log("\nExemples:", colors.cyan);
  log("  node scripts/cleanup.js build", colors.yellow);
  log("  node scripts/cleanup.js all", colors.yellow);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help") {
    showHelp();
    return;
  }

  log("🧹 Démarrage du nettoyage...", colors.bright);

  switch (command) {
    case "build":
      cleanBuildFiles();
      break;
    case "deps":
      cleanNodeModules();
      break;
    case "logs":
      cleanLogs();
      break;
    case "temp":
      cleanTempFiles();
      break;
    case "unused":
      cleanUnusedFiles();
      break;
    case "analyze":
      analyzeCodebase();
      break;
    case "all":
      cleanBuildFiles();
      cleanLogs();
      cleanTempFiles();
      cleanUnusedFiles();
      analyzeCodebase();
      break;
    default:
      log(`❌ Option inconnue: ${command}`, colors.red);
      showHelp();
      return;
  }

  log("\n✅ Nettoyage terminé!", colors.green);
}

// Exécuter le script
main();
