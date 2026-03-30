FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/frontend --workspace=packages/shared
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
RUN npm run build --workspace=apps/frontend

FROM nginx:alpine
# Supprimer la directive "user" — nginx tourne sans root sur Heroku
RUN sed -i '/^user /d' /etc/nginx/nginx.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
# Copier le template nginx (PORT et BACKEND_URL injectés au démarrage)
COPY docker/frontend/nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/frontend/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
CMD ["/docker-entrypoint.sh"]
