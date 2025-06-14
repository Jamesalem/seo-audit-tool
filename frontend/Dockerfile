# ─────────────────────────────────────────────────────────────────────────────
# Use the latest Alpine-based Node 18 release
FROM node:18.18.1-alpine AS build

WORKDIR /app

# Copy lockfiles first for better caching
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest and build
COPY frontend/ ./
RUN yarn build

# ─── Serve via Nginx ─────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default site if you have a custom nginx.conf, otherwise this is fine
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy the static build into Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
