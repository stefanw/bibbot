#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd "$(dirname "$0")" && pwd)
repository_dir=$(cd "$script_dir/.." && pwd)
cd "$repository_dir"

npm run build:userscript
node scripts/verify-tampermonkey-ios.mjs

echo "Tampermonkey-Userscript: dist/bibbot.user.js"
