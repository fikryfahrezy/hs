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
COPY apps/api apps/api
RUN npm run build --workspace @habit-shaper/contracts \
    && npm run build --workspace @habit-shaper/api

FROM node:${NODE_VERSION}-bookworm-slim AS production-dependencies
WORKDIR /workspace

COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY tests/e2e/package.json tests/e2e/package.json
RUN npm ci --omit=dev --ignore-scripts \
    --workspace @habit-shaper/api \
    --workspace @habit-shaper/contracts

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace

COPY --from=production-dependencies --chown=node:node /workspace/node_modules ./node_modules
COPY --from=build --chown=node:node /workspace/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /workspace/packages/contracts/dist ./packages/contracts/dist
COPY --chown=node:node apps/api/package.json apps/api/package.json
COPY --chown=node:node packages/contracts/package.json packages/contracts/package.json

USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]

FROM node:${NODE_VERSION}-bookworm-slim AS migration
ENV NODE_ENV=production
WORKDIR /workspace

COPY --from=dependencies /workspace/node_modules/dbmate /opt/dbmate
COPY --from=dependencies /workspace/node_modules/@dbmate /opt/node_modules/@dbmate
COPY db/migrations ./db/migrations
COPY --chmod=0555 infra/migrate/entrypoint.sh /usr/local/bin/run-migrations

USER node
ENTRYPOINT ["run-migrations"]
CMD ["up"]
