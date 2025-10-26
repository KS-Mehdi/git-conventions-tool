#!/bin/bash

TYPES=("feat" "fix" "docs" "style" "refactor" "perf" "test" "build" "ci" "chore" "revert")

echo "Type de commit:"
select type in "${TYPES[@]}"; do
    if [[ -n "$type" ]]; then
        break
    fi
done

read -p "Scope (optionnel, ex: auth, api): " scope
read -p "Description du commit: " description

if [[ -n "$scope" ]]; then
    commit_msg="${type}(${scope}): ${description}"
else
    commit_msg="${type}: ${description}"
fi

git commit -m "$commit_msg"
echo "✅ Commit créé: $commit_msg"
