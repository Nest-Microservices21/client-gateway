ARG NODE_VERSION=22.3.0
ARG PNPM_VERSION=9.7.0

FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS deps
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile --ignore-scripts

# Build stage
FROM base AS build
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Development final stage
FROM base AS final-dev
WORKDIR /usr/src/app
COPY --from=build /usr/src/app ./
EXPOSE ${PORT}
CMD ["pnpm", "start:dev"]

# Production final stage
FROM base AS final-prod
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Use --chown on COPY commands to set file permissions
USER node

COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=deps --chown=node:node /usr/src/app/package.json ./
COPY --from=build --chown=node:node /usr/src/app/dist ./dist

# Switch to root user to perform cleanup
USER root
RUN apk del --purge libc6-compat && rm -rf /var/cache/apk/* /tmp/* /usr/src/app/.pnpm-store

# Switch back to node user
USER node
EXPOSE ${PORT}
CMD ["pnpm", "start:prod"]
