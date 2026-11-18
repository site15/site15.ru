FROM node:23.11.0-alpine AS base
RUN apk add --no-cache jq dumb-init

FROM base AS build
WORKDIR /app
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=3
ENV NX_SKIP_NX_CACHE=true
ENV NODE_OPTIONS=--max-old-space-size=8192
COPY . .
# site15-vps is blocked on registry.yarnpkg.com by host/SNI (TLS resets on every
# Cloudflare IP, so IP pinning/extra_hosts will not help), while registry.npmjs.org
# is reachable and serves byte-identical tarballs. yarn v1 downloads by the URL in
# yarn.lock `resolved` and ignores registry/--registry/YARN_REGISTRY, so rewrite the
# host in the build-layer yarn.lock (repo yarn.lock stays untouched). Retry once;
# NO --ignore-optional: it strips the platform's own native binaries
# (@esbuild/linux-x64, rollup/lmdb) and breaks the nx build below.
ENV YARN_CACHE_FOLDER=/yarn/.cache
RUN --mount=type=cache,id=yarn,target=/yarn/.cache,sharing=shared \
    sed -i 's#https://registry.yarnpkg.com#https://registry.npmjs.org#g' yarn.lock && \
    yarn install --frozen-lockfile --ignore-scripts --prefer-offline --network-timeout 600000 || \
    yarn install --frozen-lockfile --ignore-scripts --prefer-offline --network-timeout 600000 && \
    echo '' > .env && \
    jq 'del(.targetDefaults, .plugins, .generators, .release)' nx.json > temp.json && mv temp.json nx.json && \
    yarn nx run-many -p rest-sdk server client -t=build --configuration=production

FROM base AS prod-deps
WORKDIR /app
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=3
ENV NX_SKIP_NX_CACHE=true
ENV NODE_OPTIONS=--max-old-space-size=8192
COPY . .
ENV YARN_CACHE_FOLDER=/yarn/.cache
RUN --mount=type=cache,id=yarn,target=/yarn/.cache,sharing=shared \
    echo '' > .env && \
    jq 'del(.devDependencies)' package.json > temp.json && mv temp.json package.json && \
    sed -i 's#https://registry.yarnpkg.com#https://registry.npmjs.org#g' yarn.lock && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline --network-timeout 600000 || \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline --network-timeout 600000 && \
    jq 'del(.targetDefaults, .plugins, .generators, .release)' nx.json > temp.json && mv temp.json nx.json && \
    rm -rf node_modules/@angular node_modules/ng-zorro-antd node_modules/@faker-js node_modules/@ant-design node_modules/@jsverse && \
    rm -rf node_modules/zone.js node_modules/@ngx-formly node_modules/markdown-it node_modules/@types

FROM node:23.11.0-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV TZ=UTC
# 80 by default: Coolify/caddy-docker-proxy uses portless `{{upstreams}}` labels
# which resolve to 80, so any other port silently produces 502 after a redeploy.
# Override at runtime with SITE_15_PORT (docker-compose / Coolify env).
ENV SITE_15_PORT=80
ENV SITE_15_CLIENT_MINIO_URL=http://localhost:9000

# Install PM2 for process management inside container
RUN npm install -g pm2

# Copy utility for "To work as a PID 1"
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps /app/apps
COPY --from=prod-deps /app/libs /app/libs
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
COPY --from=prod-deps /app/apps/landing /app/dist/apps/client

# Create logs directory for PM2
RUN mkdir -p logs

# Copy PM2 config and entrypoint
COPY docker/ecosystem.docker.config.json /app/ecosystem.docker.config.json
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pm2-runtime", "start", "ecosystem.docker.config.json"]
