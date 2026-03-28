#!/bin/sh
set -e

# Heroku assigne un $PORT dynamique — on l'injecte dans la config nginx
# BACKEND_URL doit être défini en Config Var Heroku sur l'app frontend
PORT="${PORT:-80}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"

sed -e "s|PORT_PLACEHOLDER|${PORT}|g" \
    -e "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" \
    /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
