#!/bin/bash
# GitHub Security Audit Script v2
# Checks all your GitHub repos for exposed .env files

echo "🔍 GitHub Security Audit for Astrocyte74"
echo "=========================================="
echo ""

# Your repos
repos=(
  "Astrocyte74/jeopardy"
  "Astrocyte74/InkyPi"
  "Astrocyte74/YTV2"
  "Astrocyte74/-YTV2-NAS-"
  "Astrocyte74/summarizer"
  "Astrocyte74/tts-hub"
  "Astrocyte74/unified-platform-spec"
  "Astrocyte74/burgess"
)

temp_dir="/tmp/github-audit-$$"
mkdir -p "$temp_dir"

echo "Step 1: Cloning repos..."
for repo in "${repos[@]}"; do
  repo_name=$(basename "$repo")
  echo -n "  Cloning $repo_name ... "

  # Use regular git clone with https
  if git clone "https://github.com/$repo.git" "$temp_dir/$repo_name" --quiet 2>/dev/null; then
    echo "✅"
  else
    # Try with SSH
    if git clone "git@github.com:$repo.git" "$temp_dir/$repo_name" --quiet 2>/dev/null; then
      echo "✅ (SSH)"
    else
      echo "❌ (failed - might be private)"
    fi
  fi
done

echo ""
echo "Step 2: Checking for .env files..."
echo ""

found_any=false
for repo_dir in "$temp_dir"/*; do
  if [ -d "$repo_dir" ]; then
    repo_name=$(basename "$repo_dir")

    if git -C "$repo_dir" log --all --full-history -- ".env" 2>/dev/null | grep -q .env; then
      echo "⚠️  $repo_name - EXPOSED .env FOUND!"
      echo "   URL: https://github.com/Astrocyte74/$repo_name"

      # Get commit info
      commit=$(git -C "$repo_dir" log --all --diff-filter=A --oneline -- ".env" 2>/dev/null | head -1)
      echo "   Commit: $commit"

      # Check .gitignore
      if [ -f "$repo_dir/.gitignore" ] && grep -q "^\.env$" "$repo_dir/.gitignore"; then
        echo "   In .gitignore: YES"
      else
        echo "   In .gitignore: NO"
      fi

      echo ""
      found_any=true
    fi
  fi
done

if [ "$found_any" = false ]; then
  echo "✅ No exposed .env files found in any accessible repos!"
fi

echo ""
echo "Step 3: Cleanup..."
rm -rf "$temp_dir"
echo "✅ Done!"

echo ""
echo "=========================================="
echo "⚠️  REMEMBER:"
echo "1. Private repos (quizzernator, mkpy, bhrt_1, ai-infographic-generator) couldn't be checked"
echo "2. Check them manually with:"
echo "   git clone https://github.com/Astrocyte74/<repo>.git"
echo "   cd <repo>"
echo "   git log --all --oneline -- .env"
echo "=========================================="
