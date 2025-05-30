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
RUN --mount=type=cache,id=yarn,target=/yarn/.cache,sharing=shared YARN_CACHE_FOLDER=/yarn/.cache \
    yarn install --frozen-lockfile --ignore-scripts --prefer-offline && \
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
RUN --mount=type=cache,id=yarn,target=/yarn/.cache,sharing=shared YARN_CACHE_FOLDER=/yarn/.cache \
    echo '' > .env && \
    jq 'del(.devDependencies)' package.json > temp.json && mv temp.json package.json && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline && \
    jq 'del(.targetDefaults, .plugins, .generators, .release)' nx.json > temp.json && mv temp.json nx.json && \
    rm -rf node_modules/@angular node_modules/ng-zorro-antd node_modules/@faker-js node_modules/@ant-design node_modules/@jsverse && \
    rm -rf node_modules/zone.js node_modules/@ngx-formly node_modules/markdown-it node_modules/@types

FROM node:23.11.0-alpine
WORKDIR /app
EXPOSE 8080
ENV NODE_ENV=production
ENV TZ=UTC
ENV SINGLE_SIGN_ON_PORT=8080
ENV SINGLE_SIGN_ON_CLIENT_MINIO_URL=http://localhost:9000
# Copy utility for "To work as a PID 1"
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps /app/apps
COPY --from=prod-deps /app/libs /app/libs
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
CMD ["dumb-init", "node", "dist/apps/server/main.js"]