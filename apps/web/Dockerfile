# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.20.0

FROM node:${NODE_VERSION}-bookworm-slim AS dependencies
WORKDIR /workspace

COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY tests/e2e/package.json tests/e2e/package.json
RUN npm ci --ignore-scripts

FROM dependencies AS build
COPY tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY apps/web apps/web
RUN npm run build --workspace @habit-shaper/contracts \
    && npm run build --workspace @habit-shaper/web

FROM nginx:1.29.8-trixie AS runtime
RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
