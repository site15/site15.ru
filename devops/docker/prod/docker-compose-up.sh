#!/bin/bash
source ./set-env.sh

if [ -z "${NO_PUSH_DOCKER_IMAGES}" ]; then
    if [ -z "${CI_COMMIT_SHORT_SHA}" ]; then
        echo "No deploy to github [INFO-4]"
    else
        echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER $CI_REGISTRY --password-stdin
    fi
fi

docker volume create --name=site15-postgres-volume --label=site15-postgres-volume

# Start only database
export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker/prod/docker-compose.yml --compatibility up -d site15-postgres

# Wait ready datatbase
until docker exec --tty $(docker ps -aqf "name=site15-postgres") pg_isready -U postgres; do
    echo "Waiting for postgres..."
    sleep 2
done

export PSQL_PORT=11432
export PSQL_HOST=localhost
export ROOT_POSTGRES_URL=postgres://${ROOT_POSTGRES_USER}:${ROOT_POSTGRES_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/postgres?schema=public
export SERVER_POSTGRES_URL=postgres://${PSQL_USERNAME}:${PSQL_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DATABASE}?schema=public
# Create all need application databases by exists match evn key and nx app name
# for app: "server" - env: SERVER_POSTGRES_URL
# for app: "core-server" - env: CORE_SERVER_POSTGRES_URL
npm run rucken -- postgres --app-database-url=$SERVER_POSTGRES_URL

# Run migrate database for specific database
cd ../
export SERVER_POSTGRES_URL=$SERVER_POSTGRES_URL
npm run migrate
cd ./devops

# Change database host for applications
export PSQL_PORT=5432
export PSQL_HOST=site15-postgres
export ROOT_POSTGRES_URL=postgres://${ROOT_POSTGRES_USER}:${ROOT_POSTGRES_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/postgres?schema=public
export SERVER_POSTGRES_URL=postgres://${PSQL_USERNAME}:${PSQL_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DATABASE}?schema=public

# Start all services
export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker/prod/docker-compose.yml --compatibility up -d

npx -y wait-on --timeout=160000 --interval=1000 --window --verbose --log http://localhost:3000/api/version/check-tag/$TAG_VERSION?healthcheck=true
