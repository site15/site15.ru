FROM node:22-alpine AS base
RUN corepack enable

COPY . /app
WORKDIR /app

FROM base AS build
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci --no-audit && \
    apk update && apk add --no-cache openssl jq && \
    echo '' > .env && \
    echo $(cat nx.json | jq 'del(.targetDefaults)') > nx.json && \
    echo $(cat nx.json | jq 'del(.plugins)') > nx.json && \
    echo $(cat nx.json | jq 'del(.generators)') > nx.json && \
    echo $(cat nx.json | jq 'del(.release)') > nx.json && \
    ./node_modules/.bin/nx run-many --all -t=prisma-generate --parallel=1 && \
    ./node_modules/.bin/nx run-many -p app-rest-sdk server client -t=build --configuration=production --parallel=1

FROM base AS prod-deps
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci --no-audit --production && \
    apk update && apk add --no-cache openssl jq dumb-init && \
    echo '' > .env && \
    echo $(cat nx.json | jq 'del(.targetDefaults)') > nx.json && \
    echo $(cat nx.json | jq 'del(.plugins)') > nx.json && \
    echo $(cat nx.json | jq 'del(.generators)') > nx.json && \
    echo $(cat nx.json | jq 'del(.release)') > nx.json && \
    npm install --save-dev nx@20.5.0 prisma@5.22.0 @brakebein/prisma-generator-nestjs-dto@1.24.0-beta5 -D && \
    npm uninstall --save @ant-design/icons-angular \
    @angular/animations \
    @angular/common \
    @angular/compiler \
    @angular/core \
    @angular/forms \
    @angular/platform-browser \
    @angular/platform-browser-dynamic \
    @angular/platform-server \
    @angular/router \
    @angular/ssr \
    @jsverse/transloco \
    @jsverse/transloco-keys-manager \
    @jsverse/transloco-locale \
    @jsverse/transloco-messageformat \
    @ngneat/until-destroy \
    @ngx-formly/core \
    @ngx-formly/ng-zorro-antd \
    ng-zorro-antd && \
    ./node_modules/.bin/nx run-many --all -t=prisma-generate --parallel=1

FROM base
ENV SERVER_PORT=8080
ENV CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID=248ec37f-628d-43f0-8de2-f58da037dd0f
ENV CLIENT_MINIO_URL=http://localhost:9000
COPY --from=prod-deps /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist 
RUN apk update && apk add --no-cache openssl && \
    find /app/dist -type f -name "*.js" -print0 | xargs -0 sed -i "s/___CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID___/$CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID/g" && \
    find /app/dist -type f -name "*.js" -print0 | xargs -0 sed -i "s#___CLIENT_MINIO_URL___#$CLIENT_MINIO_URL#"

EXPOSE 8080
CMD ["dumb-init","node", "dist/apps/server/main.js"]
# docker build -t nestjs-mod-sso -f ./.docker/server.Dockerfile .
# docker images
# docker run --network=host b2482e26edc8
# 1.78GB