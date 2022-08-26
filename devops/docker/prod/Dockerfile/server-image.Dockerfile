FROM "site15-server-base"
WORKDIR /usr/src/app
COPY ./docker/prod/Dockerfile/files/server .
COPY ./docker/prod/Dockerfile/files/prisma ./prisma
RUN npm run prisma -- generate
EXPOSE 3000
STOPSIGNAL SIGINT
ENTRYPOINT ["sh" , "-c", "node main.js"]
