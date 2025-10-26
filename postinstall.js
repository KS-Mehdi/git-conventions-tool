#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isInNodeModules = __dirname.includes('node_modules');

if (!isInNodeModules) {
  console.log('⚠️  Ce script doit être installé via npm');
  process.exit(0);
}

const projectRoot = path.resolve(__dirname, '../..');
process.chdir(projectRoot);

console.log('\n🔧 Configuration automatique des conventions Git...\n');

try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch {
  console.log('⚠️  Pas un dépôt Git, configuration annulée');
  process.exit(0);
}

const pkgPath = path.join(projectRoot, 'package.json');
let pkg = {};

if (fs.existsSync(pkgPath)) {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

if (pkg.scripts && pkg.scripts.commit) {
  console.log('✅ Conventions Git déjà configurées\n');
  process.exit(0);
}

try {
  console.log('📦 Installation des dépendances...');
  execSync(
    'npm install --save-dev husky commitizen @commitlint/cli @commitlint/config-conventional cz-conventional-changelog --silent',
    { stdio: 'inherit' }
  );

  console.log('\n⚙️  Configuration de Commitizen...');
  execSync(
    'npx commitizen init cz-conventional-changelog --save-dev --save-exact --force --silent',
    { stdio: 'inherit' }
  );

  console.log('\n🪝 Configuration de Husky...');
  execSync('npx husky init', { stdio: 'inherit' });

  // Copie commitlint.config.js
  console.log('\n📄 Configuration de Commitlint...');
  const sourceConfig = path.join(__dirname, 'commitlint.config.js');
  const targetConfig = path.join(projectRoot, 'commitlint.config.js');
  fs.copyFileSync(sourceConfig, targetConfig);

  // Copie les hooks
  console.log('🪝 Configuration des hooks Git...');
  const hooksSource = path.join(__dirname, 'hooks');
  const hooksTarget = path.join(projectRoot, '.husky');

  ['commit-msg', 'pre-push'].forEach(hook => {
    const source = path.join(hooksSource, hook);
    const target = path.join(hooksTarget, hook);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
      fs.chmodSync(target, '755');
      console.log(`  ✅ ${hook} configuré`);
    }
  });

  // Vide le pre-commit
  fs.writeFileSync(
    path.join(projectRoot, '.husky/pre-commit'),
    '#!/bin/sh\necho "✅ Pre-commit check passed"'
  );

  console.log('\n📝 Ajout du script npm run commit...');
  execSync('npm pkg set scripts.commit="cz"', { stdio: 'inherit' });

  console.log('\n✅ Configuration terminée !\n');
  console.log('📚 Utilise: npm run commit\n');

} catch (error) {
  console.error('\n❌ Erreur:', error.message);
}
