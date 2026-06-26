#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY="${DEPLOY_KEY:-$HOME/Desktop/privatekey-1080840.pem}"
HOST="${DEPLOY_HOST:-ubuntu@195.209.216.109}"
SITE_DIR="${DEPLOY_SITE_DIR:-/var/www/sergievskaya}"
API_DIR="${DEPLOY_API_DIR:-/var/www/sergievskaya-api}"
SSH_OPTS=(-i "$KEY" -o StrictHostKeyChecking=no)

chmod 600 "$KEY" 2>/dev/null || true

cd "$ROOT"
npm run build

echo "→ Frontend (vk/ is never deleted on the server)"
rsync -avz --delete \
  --exclude 'vk/' \
  -e "ssh ${SSH_OPTS[*]}" \
  dist/ "$HOST:$SITE_DIR/"

echo "→ API"
rsync -avz \
  -e "ssh ${SSH_OPTS[*]}" \
  server/index.js server/store.js server/paths.js server/auth.js \
  "$HOST:$API_DIR/"

echo "→ Restart API"
ssh "${SSH_OPTS[@]}" "$HOST" "sudo systemctl restart sergievskaya-api"

if [[ -f "$ROOT/server/nginx-sergievskaya.conf" ]]; then
  echo "→ Nginx config"
  rsync -avz \
    -e "ssh ${SSH_OPTS[*]}" \
    "$ROOT/server/nginx-sergievskaya.conf" "$HOST:/tmp/nginx-sergievskaya.conf"
  ssh "${SSH_OPTS[@]}" "$HOST" "sudo cp /tmp/nginx-sergievskaya.conf /etc/nginx/sites-available/sergievskaya && sudo nginx -t && sudo systemctl reload nginx"
fi

echo "Done."
