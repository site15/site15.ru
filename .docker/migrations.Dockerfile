FROM node:22.14.0-alpine AS build
COPY . /app
WORKDIR /app
ENV CI=TRUE
ENV NX_DAEMON=false
ENV NX_PARALLEL=1
ENV NX_SKIP_NX_CACHE=true
RUN apk update && apk add --no-cache jq && \
    echo '' > .env && \
    echo $(cat nx.json | jq 'del(.targetDefaults)') > nx.json && \
    echo $(cat nx.json | jq 'del(.plugins)') > nx.json && \
    echo $(cat nx.json | jq 'del(.generators)') > nx.json && \
    echo $(cat nx.json | jq 'del(.release)') > nx.json && \
    echo $(cat package.json | jq 'del(.devDependencies)') > package.json && \
    echo $(cat package.json | jq 'del(.dependencies)') > package.json && \
    yarn add nx@20.7.1 pg-flyway pg-create-db

FROM node:22.14.0-alpine
COPY . /app
WORKDIR /app
RUN apk update && apk add --no-cache openssl
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/nx.json /app/nx.json
COPY --from=build /app/.env /app/.env
CMD ["npm", "run", "db:create-and-fill"]
# docker build -t nestjs-mod-migrations -f ./.docker/migrations.Dockerfile .
# docker images
# docker run --network=host b2482e26edc8
# 202MB 283MB