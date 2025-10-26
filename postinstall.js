#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Configuration des conventions Git...\n');

try {
  // Récupère le chemin du projet parent (pas node_modules)
  const projectRoot = path.resolve(__dirname, '../..');

  // Change vers le répertoire du projet
  process.chdir(projectRoot);

  // Vérifie si c'est un dépôt Git
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch {
    console.log('⚠️  Pas un dépôt Git, skip...');
    process.exit(0);
  }

  // Install dependencies si nécessaire
  console.log('1️⃣  Installation des dépendances...');
  execSync('npm install --save-dev husky commitizen @commitlint/cli @commitlint/config-conventional cz-conventional-changelog', { stdio: 'inherit' });

  // Init Husky
  console.log('\n2️⃣  Configuration de Husky...');
  execSync('npx husky init', { stdio: 'inherit' });

  // Configure Commitizen
  console.log('\n3️⃣  Configuration de Commitizen...');
  execSync('npx commitizen init cz-conventional-changelog --save-dev --save-exact --force', { stdio: 'inherit' });

  // Copie les fichiers de config
  console.log('\n4️⃣  Copie des fichiers de configuration...');

  const sourceDir = path.join(__dirname);
  const targetDir = projectRoot;

  // Copie commitlint.config.js
  if (fs.existsSync(path.join(sourceDir, 'commitlint.config.js'))) {
    fs.copyFileSync(
      path.join(sourceDir, 'commitlint.config.js'),
      path.join(targetDir, 'commitlint.config.js')
    );
    console.log('  ✅ commitlint.config.js copié');
  }

  // Copie les hooks
  const hooksToClone = ['commit-msg', 'pre-push'];
  hooksToClone.forEach(hook => {
    const sourcePath = path.join(sourceDir, '.husky', hook);
    const targetPath = path.join(targetDir, '.husky', hook);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      fs.chmodSync(targetPath, '755');
      console.log(`  ✅ .husky/${hook} copié`);
    }
  });

  // Ajoute le script commit au package.json
  console.log('\n5️⃣  Ajout du script npm run commit...');
  execSync('npm pkg set scripts.commit="cz"', { stdio: 'inherit' });

  console.log('\n✅ Installation terminée !');
  console.log('\n📝 Utilise maintenant: npm run commit\n');

} catch (error) {
  console.error('❌ Erreur pendant l\'installation:', error.message);
  process.exit(0); // Ne bloque pas l'installation même en cas d'erreur
}
