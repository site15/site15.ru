#!/bin/bash
source ./set-env.sh
export COMPOSE_INTERACTIVE_NO_CLI=1 && docker-compose -f ./docker/dev/docker-compose.yml down
docker volume rm site15-postgres-volume --force