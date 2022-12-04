#!/bin/bash
set -e
export TEST_PROJECT_URL=http://localhost:3000
export PSQL_PORT=11432
export PSQL_HOST=localhost
export ROOT_POSTGRES_URL=postgres://${ROOT_POSTGRES_USER}:${ROOT_POSTGRES_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/postgres?schema=public
export SERVER_POSTGRES_URL=postgres://${PSQL_USERNAME}:${PSQL_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DATABASE}?schema=public

export TAG_VERSION=local

source ./test/test.sh
