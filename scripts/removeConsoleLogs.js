#!/usr/bin/env node

/**
 * Script pour supprimer les console.log en production
 * Ce script supprime tous les console.log des fichiers source avant le build
 * Usage: node scripts/removeConsoleLogs.js [restore]
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

// Dossier de sauvegarde pour restaurer les fichiers
const BACKUP_DIR = ".console-backup";

/**
 * Crée une sauvegarde des fichiers modifiés
 */
function createBackup(filePath, content) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.writeFileSync(backupPath, content, "utf8");
}

/**
 * Restaure les fichiers depuis la sauvegarde
 */
function restoreBackup(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  
  if (fs.existsSync(backupPath)) {
    const content = fs.readFileSync(backupPath, "utf8");
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

/**
 * Supprime les console.log d'un fichier
 */
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    const lines = content.split('\n');
    const newLines = [];
    let skipLines = 0;
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (skipLines > 0) {
        skipLines--;
        continue;
      }
      
      const line = lines[i];
      
      // Vérifier si cette ligne commence un console.log
      const consoleLogMatch = line.match(/^(\s*)console\.log\s*\(/);
      
      if (consoleLogMatch) {
        // Trouvé un console.log - déterminer s'il est sur une ou plusieurs lignes
        let parenCount = 0;
        let inString = false;
        let stringChar = null;
        let escapeNext = false;
        const startIndex = line.indexOf('console.log(') + 12; // longueur de "console.log("
        
        // Compter les parenthèses depuis le début du console.log
        for (let j = startIndex; j < line.length; j++) {
          const char = line[j];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = true;
            stringChar = char;
          } else if (inString && char === stringChar) {
            inString = false;
            stringChar = null;
          } else if (!inString) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            // Si on trouve une parenthèse fermante et que parenCount = 0, on cherche le point-virgule ou virgule
            if (parenCount === 0 && (char === ';' || char === ',')) {
              // console.log sur une seule ligne - le supprimer
              modified = true;
              continue;
            }
          }
        }
        
        // Si parenCount > 0, c'est un console.log multi-lignes
        if (parenCount > 0 || line.trim().endsWith('(') || (parenCount === 0 && !line.includes(';') && !line.includes(','))) {
          // Chercher la fin du console.log dans les lignes suivantes
          let lineOffset = 0;
          let foundEnd = false;
          
          // Réinitialiser pour le parcours multi-lignes
          parenCount = 0;
          inString = false;
          stringChar = null;
          escapeNext = false;
          
          for (let j = i; j < lines.length && !foundEnd; j++) {
            const currentLine = lines[j];
            const startPos = (j === i ? startIndex : 0);
            
            for (let k = startPos; k < currentLine.length; k++) {
              const char = currentLine[k];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\') {
                escapeNext = true;
                continue;
              }
              
              if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
              } else if (inString && char === stringChar) {
                inString = false;
                stringChar = null;
              } else if (!inString) {
                if (char === '(') parenCount++;
                if (char === ')') parenCount--;
                
                // Si parenCount = 0 et qu'on trouve un point-virgule ou une virgule, c'est la fin
                if (parenCount === 0 && (char === ';' || char === ',')) {
                  foundEnd = true;
                  lineOffset = j - i;
                  break;
                }
                // Cas où la ligne se termine par ) sans point-virgule
                if (parenCount === 0 && k === currentLine.length - 1 && currentLine.trim().endsWith(')')) {
                  foundEnd = true;
                  lineOffset = j - i;
                  break;
                }
              }
            }
          }
          
          // Si on n'a pas trouvé la fin, supprimer jusqu'à la fin du fichier (cas d'erreur)
          if (!foundEnd) {
            lineOffset = lines.length - i - 1;
          }
          
          // Ignorer toutes les lignes de ce console.log
          skipLines = lineOffset;
          modified = true;
          continue;
        } else {
          // console.log sur une seule ligne - le supprimer
          modified = true;
          continue;
        }
      }
      
      newLines.push(line);
    }
    
    let newContent = newLines.join('\n');
    
    // Nettoyer les lignes vides multiples consécutives (maximum 2)
    newContent = newContent.replace(/\n{3,}/g, '\n\n');
    
    if (newContent !== originalContent) {
      // Créer une sauvegarde si elle n'existe pas déjà
      const relativePath = path.relative(process.cwd(), filePath);
      const backupPath = path.join(BACKUP_DIR, relativePath);
      if (!fs.existsSync(backupPath)) {
        createBackup(filePath, originalContent);
      }
      
      fs.writeFileSync(filePath, newContent, "utf8");
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Erreur lors du traitement de ${filePath}: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Restaure tous les fichiers depuis la sauvegarde
 */
function restoreAllFiles() {
  if (!fs.existsSync(BACKUP_DIR)) {
    log("⚠️  Aucune sauvegarde trouvée", colors.yellow);
    return;
  }
  
  log("\n🔄 Restauration des fichiers...", colors.cyan);
  
  function restoreDirectory(dir) {
    const files = fs.readdirSync(dir);
    let restoredCount = 0;
    
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        restoredCount += restoreDirectory(filePath);
      } else {
        const relativePath = path.relative(BACKUP_DIR, filePath);
        const originalPath = path.join(process.cwd(), relativePath);
        
        if (restoreBackup(originalPath)) {
          restoredCount++;
        }
      }
    });
    
    return restoredCount;
  }
  
  const restoredCount = restoreDirectory(BACKUP_DIR);
  
  // Supprimer le dossier de sauvegarde
  fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
  
  log(`✅ ${restoredCount} fichier(s) restauré(s)`, colors.green);
}

/**
 * Parcourt récursivement le dossier src et supprime les console.log
 */
function processDirectory(dir, fileExtensions = [".js", ".jsx"]) {
  let processedCount = 0;
  let removedCount = 0;
  
  if (!fs.existsSync(dir)) {
    return { processedCount, removedCount };
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules, build, et autres dossiers à exclure
      if (!["node_modules", "build", ".git", BACKUP_DIR].includes(file)) {
        const result = processDirectory(filePath, fileExtensions);
        processedCount += result.processedCount;
        removedCount += result.removedCount;
      }
    } else {
      const ext = path.extname(file);
      if (fileExtensions.includes(ext)) {
        processedCount++;
        if (removeConsoleLogs(filePath)) {
          removedCount++;
        }
      }
    }
  });
  
  return { processedCount, removedCount };
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === "restore") {
    restoreAllFiles();
    return;
  }
  
  log("🧹 Suppression des console.log pour la production...", colors.bright);
  
  const srcDir = path.join(process.cwd(), "src");
  const result = processDirectory(srcDir);
  
  log(`\n📊 Résultats:`, colors.blue);
  log(`   • Fichiers traités: ${result.processedCount}`, colors.yellow);
  log(`   • Fichiers modifiés: ${result.removedCount}`, colors.yellow);
  log(`\n✅ Suppression terminée!`, colors.green);
  log(`💡 Utilisez 'node scripts/removeConsoleLogs.js restore' pour restaurer les fichiers`, colors.cyan);
}

// Exécuter le script
main();

