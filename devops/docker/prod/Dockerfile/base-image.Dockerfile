FROM node:16 as builder
WORKDIR /usr/src/app
COPY ./docker/prod/Dockerfile/files/package.json ./
COPY ./docker/prod/Dockerfile/files/package-lock.json ./
RUN npm ci --force

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
STOPSIGNAL SIGINT