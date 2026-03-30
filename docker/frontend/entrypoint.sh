#!/bin/sh
set -e

PORT="${PORT:-80}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"

# Extraire le hostname depuis l'URL (ex: https://link-api-prod.herokuapp.com → link-api-prod.herokuapp.com)
BACKEND_HOST=$(echo "$BACKEND_URL" | sed 's|https\?://||' | cut -d/ -f1)

sed -e "s|PORT_PLACEHOLDER|${PORT}|g" \
    -e "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" \
    -e "s|BACKEND_HOST_PLACEHOLDER|${BACKEND_HOST}|g" \
    /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
