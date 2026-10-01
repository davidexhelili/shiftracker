# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copia i file di dipendenze e installa
COPY package.json package-lock.json ./
RUN npm ci

# Copia il codice sorgente e builda
COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:alpine AS production

# Rimuovi la config di default di nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la config personalizzata per SPA (gestisce il routing React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file buildati dallo stage precedente
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
