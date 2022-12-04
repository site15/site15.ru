#!/bin/bash
set -e
source ./set-env.sh

rm -rf ../devops/docker/prod/Dockerfile/files/client
mkdir -p ../devops/docker/prod/Dockerfile/files/client
cp -Rf ../dist/apps/client ../devops/docker/prod/Dockerfile/files

if [ -z "${NO_PUSH_DOCKER_IMAGES}" ]; then
    if [ -z "${CI_COMMIT_SHORT_SHA}" ]; then
        echo "No deploy to github [INFO-2]"

        docker build --platform linux/amd64 -t ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE} . --file ./docker/prod/Dockerfile/client-image.Dockerfile
        docker tag ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE} ${CI_PROJECT_NAME}-client-${TAG_VERSION}
    else
        echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER $CI_REGISTRY --password-stdin

        docker build --platform linux/amd64 -t ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE} . --file ./docker/prod/Dockerfile/client-image.Dockerfile
        docker push ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE}
        docker tag ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE} ${CI_PROJECT_NAME}-client-${TAG_VERSION}
    fi
else
    echo "No deploy to github [INFO-3]"

    docker logout $CI_REGISTRY

    docker build --platform linux/amd64 -t ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE} . --file ./docker/prod/Dockerfile/client-image.Dockerfile
    docker tag ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${CLIENT_IMAGE} ${CI_PROJECT_NAME}-client-${TAG_VERSION}
fi
