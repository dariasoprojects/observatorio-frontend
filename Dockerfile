# ===== Etapa 1: Build de Angular =====
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --force || npm install --force
COPY . .

RUN npx ng build --project angularweb --configuration production

# ===== Etapa 2: Nginx =====
FROM nginx:stable-alpine

# Borra la página default de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Config SPA
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
  location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ { expires 7d; access_log off; }\n\
}\n' > /etc/nginx/conf.d/default.conf

# copiar desde /browser (clave)
COPY --from=build /app/dist/angularweb/browser/ /usr/share/nginx/html
