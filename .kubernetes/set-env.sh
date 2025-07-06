#!/bin/bash
set -e

export REPOSITORY=site15/site15.ru
export REGISTRY=ghcr.io
export BASE_SITE_15_IMAGE_NAME="${REPOSITORY}-base-server"
export BUILDER_IMAGE_NAME="${REPOSITORY}-builder"
export MIGRATIONS_IMAGE_NAME="${REPOSITORY}-migrations"
export SITE_15_IMAGE_NAME="${REPOSITORY}-server"
export NGINX_IMAGE_NAME="${REPOSITORY}-nginx"
export E2E_TESTS_IMAGE_NAME="${REPOSITORY}-e2e-tests"
export COMPOSE_INTERACTIVE_NO_CLI=1
export NX_DAEMON=false
export NX_PARALLEL=1
export NX_SKIP_NX_CACHE=true


if [ -z "${ROOT_VERSION}" ]; then
    export ROOT_VERSION=$(npm pkg get version --workspaces=false | tr -d \")
fi
if [ -z "${SERVER_VERSION}" ]; then
    export SERVER_VERSION=$(cd ./apps/server && npm pkg get version --workspaces=false | tr -d \")
fi

if [ -z "${CLIENT_VERSION}" ]; then
    export CLIENT_VERSION=$(cd ./apps/client && npm pkg get version --workspaces=false | tr -d \")
fi

# node
if [ -z "${NAMESPACE}" ]; then
    export NAMESPACE=sso
fi

# common
if [ -z "${SITE_15_DOMAIN}" ]; then
    export SITE_15_DOMAIN=example.com
fi

# server
if [ -z "${SITE_15_PORT}" ]; then
    export SITE_15_PORT=9191
fi

# server: webhook database
if [ -z "${SITE_15_WEBHOOK_DATABASE_PASSWORD}" ]; then
    export SITE_15_WEBHOOK_DATABASE_PASSWORD=webhook_password
fi
if [ -z "${SITE_15_WEBHOOK_DATABASE_USERNAME}" ]; then
    export SITE_15_WEBHOOK_DATABASE_USERNAME=${NAMESPACE}_webhook
fi
if [ -z "${SITE_15_WEBHOOK_DATABASE_NAME}" ]; then
    export SITE_15_WEBHOOK_DATABASE_NAME=${NAMESPACE}_webhook
fi

# server: sso database
if [ -z "${SITE_15_SSO_DATABASE_PASSWORD}" ]; then
    export SITE_15_SSO_DATABASE_PASSWORD=sso_password
fi
if [ -z "${SITE_15_SSO_DATABASE_USERNAME}" ]; then
    export SITE_15_SSO_DATABASE_USERNAME=${NAMESPACE}_sso
fi
if [ -z "${SITE_15_SSO_DATABASE_NAME}" ]; then
    export SITE_15_SSO_DATABASE_NAME=${NAMESPACE}_sso
fi

# server: notifications database
if [ -z "${SITE_15_NOTIFICATIONS_DATABASE_PASSWORD}" ]; then
    export SITE_15_NOTIFICATIONS_DATABASE_PASSWORD=notifications_password
fi
if [ -z "${SITE_15_NOTIFICATIONS_DATABASE_USERNAME}" ]; then
    export SITE_15_NOTIFICATIONS_DATABASE_USERNAME=${NAMESPACE}_notifications
fi
if [ -z "${SITE_15_NOTIFICATIONS_DATABASE_NAME}" ]; then
    export SITE_15_NOTIFICATIONS_DATABASE_NAME=${NAMESPACE}_notifications
fi

# server: two factor database
if [ -z "${SITE_15_TWO_FACTOR_DATABASE_PASSWORD}" ]; then
    export SITE_15_TWO_FACTOR_DATABASE_PASSWORD=two_factor_password
fi
if [ -z "${SITE_15_TWO_FACTOR_DATABASE_USERNAME}" ]; then
    export SITE_15_TWO_FACTOR_DATABASE_USERNAME=${NAMESPACE}_two_factor
fi
if [ -z "${SITE_15_TWO_FACTOR_DATABASE_NAME}" ]; then
    export SITE_15_TWO_FACTOR_DATABASE_NAME=${NAMESPACE}_two_factor
fi

# database
if [ -z "${SITE_15_POSTGRE_SQL_POSTGRESQL_USERNAME}" ]; then
    export SITE_15_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
fi
if [ -z "${SITE_15_POSTGRE_SQL_POSTGRESQL_PASSWORD}" ]; then
    export SITE_15_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
fi
if [ -z "${SITE_15_POSTGRE_SQL_POSTGRESQL_DATABASE}" ]; then
    export SITE_15_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
fi