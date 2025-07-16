#!/bin/bash
set -e

export REPOSITORY=site15/site15.ru
export REGISTRY=ghcr.io
export SITE_15_IMAGE_NAME="${REPOSITORY}-server"
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
    echo "Error: NAMESPACE not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# common
if [ -z "${SITE_15_DOMAIN}" ]; then
    echo "Error: SITE_15_DOMAIN not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# server
if [ -z "${SITE_15_PORT}" ]; then
    echo "Error: SITE_15_PORT not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# server: webhook database
if [ -z "${SITE_15_WEBHOOK_DATABASE_PASSWORD}" ]; then
    echo "Error: SITE_15_WEBHOOK_DATABASE_PASSWORD not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_WEBHOOK_DATABASE_USERNAME}" ]; then
    echo "Error: SITE_15_WEBHOOK_DATABASE_USERNAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_WEBHOOK_DATABASE_NAME}" ]; then
    echo "Error: SITE_15_WEBHOOK_DATABASE_NAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# server: sso database
if [ -z "${SITE_15_SSO_DATABASE_PASSWORD}" ]; then
    echo "Error: SITE_15_SSO_DATABASE_PASSWORD not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_SSO_DATABASE_USERNAME}" ]; then
    echo "Error: SITE_15_SSO_DATABASE_USERNAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_SSO_DATABASE_NAME}" ]; then
    echo "Error: SITE_15_SSO_DATABASE_NAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# server: notifications database
if [ -z "${SITE_15_NOTIFICATIONS_DATABASE_PASSWORD}" ]; then
    echo "Error: SITE_15_NOTIFICATIONS_DATABASE_PASSWORD not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_NOTIFICATIONS_DATABASE_USERNAME}" ]; then
    echo "Error: SITE_15_NOTIFICATIONS_DATABASE_USERNAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_NOTIFICATIONS_DATABASE_NAME}" ]; then
    echo "Error: SITE_15_NOTIFICATIONS_DATABASE_NAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# server: two factor database
if [ -z "${SITE_15_TWO_FACTOR_DATABASE_PASSWORD}" ]; then
    echo "Error: SITE_15_TWO_FACTOR_DATABASE_PASSWORD not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_TWO_FACTOR_DATABASE_USERNAME}" ]; then
    echo "Error: SITE_15_TWO_FACTOR_DATABASE_USERNAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_TWO_FACTOR_DATABASE_NAME}" ]; then
    echo "Error: SITE_15_TWO_FACTOR_DATABASE_NAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# database
if [ -z "${SITE_15_POSTGRE_SQL_POSTGRESQL_USERNAME}" ]; then
    echo "Error: SITE_15_POSTGRE_SQL_POSTGRESQL_USERNAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_POSTGRE_SQL_POSTGRESQL_PASSWORD}" ]; then
    echo "Error: SITE_15_POSTGRE_SQL_POSTGRESQL_PASSWORD not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_POSTGRE_SQL_POSTGRESQL_DATABASE}" ]; then
    echo "Error: SITE_15_POSTGRE_SQL_POSTGRESQL_DATABASE not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi

# new
if [ -z "${SITE_15_SSO_ADMIN_EMAIL}" ]; then
    echo "Error: SITE_15_SSO_ADMIN_EMAIL not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_SSO_ADMIN_USERNAME}" ]; then
    echo "Error: SITE_15_SSO_ADMIN_USERNAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_SSO_DEFAULT_PUBLIC_TENANTS}" ]; then
    echo "Error: SITE_15_SSO_DEFAULT_PUBLIC_TENANTS not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_SSO_DEFAULT_TENANT}" ]; then
    echo "Error: SITE_15_SSO_DEFAULT_TENANT not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_NOTIFICATIONS_MAIL_TRANSPORT}" ]; then
    echo "Error: SITE_15_NOTIFICATIONS_MAIL_TRANSPORT not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_NOTIFICATIONS_MAIL_DEFAULT_SENDER_NAME}" ]; then
    echo "Error: SITE_15_NOTIFICATIONS_MAIL_DEFAULT_SENDER_NAME not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi
if [ -z "${SITE_15_NOTIFICATIONS_MAIL_DEFAULT_SENDER_EMAIL}" ]; then
    echo "Error: SITE_15_NOTIFICATIONS_MAIL_DEFAULT_SENDER_EMAIL not set!" >&2 # Redirect error message to stderr
    exit 1 # Exit with an error code
fi