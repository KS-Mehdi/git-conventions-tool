#!/bin/bash

# Copie les hooks
cp hooks/* .git/hooks/
chmod +x .git/hooks/*

# Crée des alias Git
git config alias.nb "!sh $(pwd)/bin/branch.sh"
git config alias.nc "!sh $(pwd)/bin/commit.sh"

echo "✅ Conventions Git installées!"
echo "Utilise: git nb (nouvelle branche) et git nc (nouveau commit)"
