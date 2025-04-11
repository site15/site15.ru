FROM node:22.14.0-alpine AS build
WORKDIR /app
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=2
ENV NX_SKIP_NX_CACHE=true
ENV NODE_OPTIONS=--max-old-space-size=8192
COPY . .
RUN --mount=type=cache,id=yarn,target=/yarn/.cache,sharing=shared YARN_CACHE_FOLDER=/yarn/.cache \
    yarn install --frozen-lockfile --ignore-scripts --prefer-offline && \
    apk add --no-cache jq && \
    echo '' > .env && \
    jq 'del(.targetDefaults, .plugins, .generators, .release)' nx.json > temp.json && mv temp.json nx.json && \
    yarn nx run-many --all -t=prisma-generate && \
    yarn nx run-many -p app-rest-sdk server client -t=build --configuration=production

FROM node:22.14.0-alpine AS prod-deps
WORKDIR /app
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=2
ENV NX_SKIP_NX_CACHE=true
ENV NODE_OPTIONS=--max-old-space-size=8192
COPY . .
RUN --mount=type=cache,id=yarn,target=/yarn/.cache,sharing=shared YARN_CACHE_FOLDER=/yarn/.cache \
    apk add --no-cache jq && \
    echo '' > .env && \
    jq 'del(.devDependencies)' package.json > temp.json && mv temp.json package.json && \
    yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline && \
    jq 'del(.targetDefaults, .plugins, .generators, .release)' nx.json > temp.json && mv temp.json nx.json && \
    yarn add -D nx@20.7.1 prisma@5.22.0 @brakebein/prisma-generator-nestjs-dto@1.24.0-beta5 pg-flyway pg-create-db && \
    yarn nx run-many --all -t=prisma-generate

FROM node:22.14.0-alpine
WORKDIR /app
EXPOSE 8080
ENV NODE_ENV=production
ENV TZ=UTC
ENV SERVER_PORT=8080
ENV CLIENT_MINIO_URL=http://localhost:9000
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps /app/apps
COPY --from=prod-deps /app/libs /app/libs
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
RUN apk update && apk add --no-cache openssl dumb-init && \
    find /app/dist -type f -name "*.js" -print0 | xargs -0 sed -i \
    -e "s#___CLIENT_MINIO_URL___#$CLIENT_MINIO_URL#g"
CMD ["dumb-init", "node", "dist/apps/server/main.js"]