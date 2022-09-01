#!/bin/bash
export CURRENT_UID=$(id -u):$(id -g)

if [ -z "${CI_PROJECT_NAMESPACE}" ]; then
    export CI_PROJECT_NAMESPACE=site15
fi

if [ -z "${CI_PROJECT_NAME}" ]; then
    export CI_PROJECT_NAME=site15
fi

if [ -z "${CI_PROJECT_CODE}" ]; then
    export CI_PROJECT_CODE=server
fi

if [ -z "${CI_REGISTRY}" ]; then
    export CI_REGISTRY=ghcr.io
fi

if [ -z "${CI_REGISTRY_PASSWORD}"]; then
    export CI_REGISTRY_PASSWORD=$SITE15_ACCESS_TOKEN_DOCKER
fi

if [ -z "${CI_REGISTRY_USER}"]; then
    export CI_REGISTRY_USER=EndyKaufman
fi

if [ -z "${CI_COMMIT_SHORT_SHA}"]; then
    export CI_COMMIT_SHORT_SHA=$GITHUB_SHA
fi

if [ -z "${ROOT_DOMAIN}" ]; then
    export ROOT_DOMAIN=site15.ru
fi

if [ -z "${TAG_VERSION}" ]; then
    if [ -z "${CI_COMMIT_SHORT_SHA}" ]; then
        export TAG_VERSION=$(date +'%Y%m%d%H%M%S')
    else
        export TAG_VERSION=${CI_COMMIT_SHORT_SHA}
    fi
fi

export DEPLOY_DATE=$(date +'%Y-%m-%d %H:%M:%S')
export DEPLOY_COMMIT=${CI_COMMIT_SHORT_SHA}
export DEPLOY_VERSION=$(node -pe "require('../package.json')['version']")

if [ -z "${CI_BRANCH_NAME}" ]; then
    if [ -z "${CI_COMMIT_BRANCH}" ]; then
        export BRANCH_NAME=develop
    else
        export BRANCH_NAME=$CI_COMMIT_BRANCH
    fi
else
    export BRANCH_NAME=$CI_BRANCH_NAME
fi

if [ -z "${CI_BRANCH_NAME}" ]; then
    if [ "$BRANCH_NAME" == "master" ]; then
        if [ -z "${DB_DATABASE}" ]; then
            export DB_DATABASE=${CI_PROJECT_CODE}
        fi
        if [ -z "${CI_ENVIRONMENT_URL}" ]; then
            export PROJECT_URL=https://${ROOT_DOMAIN}
        else
            export PROJECT_URL=${CI_ENVIRONMENT_URL}:${EXTERNAL_PORT}
        fi
    else
        if [ -z "${DB_DATABASE}" ]; then
            export DB_DATABASE=${CI_PROJECT_CODE}_${BRANCH_NAME}
        fi
        if [ -z "${CI_ENVIRONMENT_URL}" ]; then
            export PROJECT_URL=https://${BRANCH_NAME}.${ROOT_DOMAIN}
        else
            export PROJECT_URL=${CI_ENVIRONMENT_URL}:${EXTERNAL_PORT}
        fi
    fi
else
    if [ -z "${DB_DATABASE}" ]; then
        export DB_DATABASE=${CI_PROJECT_CODE}_${BRANCH_NAME}
    fi
    if [ -z "${CI_ENVIRONMENT_URL}" ]; then
        export PROJECT_URL=https://${BRANCH_NAME}.${ROOT_DOMAIN}
    else
        export PROJECT_URL=${CI_ENVIRONMENT_URL}:${EXTERNAL_PORT}
    fi
fi
export PROJECT_DOMAIN="${PROJECT_URL/https:\/\//}"
export PROJECT_DOMAIN="${PROJECT_DOMAIN/http:\/\//}"

export ROOT_POSTGRES_URL=postgres://${ROOT_POSTGRES_USER}:${ROOT_POSTGRES_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/postgres?schema=public
export SERVER_POSTGRES_URL=postgres://${PSQL_USERNAME}:${PSQL_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DATABASE}?schema=public

export NAMESPACE=${CI_PROJECT_CODE}-$BRANCH_NAME

export SERVER_BASE_IMAGE=${CI_PROJECT_NAME}-base-image:$(checksum -- ../package.json | grep -o "^\w*\b")
export SERVER_IMAGE=${CI_PROJECT_NAME}-image:${TAG_VERSION}
export CLIENT_IMAGE=${CI_PROJECT_NAME}-client-image:${TAG_VERSION}

if [ -z "${PSQL_HOST}" ]; then
    export PSQL_HOST=10.0.1.1
fi

export K8S_SERVER_RESOURCES_REQUEST_MEMORY=350Mi
export K8S_SERVER_RESOURCES_REQUEST_CPU=150m
export K8S_SERVER_RESOURCES_LIMIT_MEMORY=1024Mi
export K8S_SERVER_RESOURCES_LIMIT_CPU=1000m
export K8S_SERVER_REPLICAS=1

export JEST_JUNIT_CLASSNAME="{classname}"
export JEST_JUNIT_TITLE="{title}"
export JEST_JUNIT_ANCESTOR_SEPARATOR=" › "
export JEST_JUNIT_SUITE_NAME="{filename}"
export JEST_JUNIT_ADD_FILE_ATTRIBUTE="true"
export JEST_JUNIT_INCLUDE_CONSOLE_OUTPUT="true"
