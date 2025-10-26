#!/bin/bash

# Liste des types valides
TYPES=("feature" "bugfix" "hotfix" "chore" "refactor" "test" "doc")

echo "Type de branche:"
select type in "${TYPES[@]}"; do
    if [[ -n "$type" ]]; then
        break
    fi
done

read -p "ID du ticket: " ticket_id
read -p "Description (kebab-case): " description

# Nettoyage de la description
description=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

branch_name="${type}/${ticket_id}-${description}"
git checkout -b "$branch_name"
echo "✅ Branche créée: $branch_name"
