FROM node:16 as builder
WORKDIR /usr/src/app
COPY ./docker/prod/Dockerfile/files/package.json ./
RUN npm i --force

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
STOPSIGNAL SIGINT