#!/bin/bash
set -e
source ./set-env.sh

rm -rf ../devops/docker/prod/Dockerfile/files/server
mkdir -p ../devops/docker/prod/Dockerfile/files/server
cp -Rf ../apps/server/package.json ../devops/docker/prod/Dockerfile/files
# cp -Rf ../package-lock.json ../devops/docker/prod/Dockerfile/files

export SERVER_BASE_IMAGE=${CI_PROJECT_NAME}-server-base-image:${CI_COMMIT_SHORT_SHA}
# $(checksum -- ../package.json | grep -o "^\w*\b")

if [ -z "${CI_COMMIT_SHORT_SHA}" ]; then
    echo "No deploy to github [INFO-1]"

    export IMG="${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_BASE_IMAGE}"
    docker build --platform linux/amd64 -t $IMG . --file ./docker/prod/Dockerfile/base-image.Dockerfile
    docker tag $IMG ${CI_PROJECT_NAME}-server-base
else
    echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER $CI_REGISTRY --password-stdin

    export IMG="${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_BASE_IMAGE}"
    if DOCKER_CLI_EXPERIMENTAL=enabled docker manifest inspect $IMG >/dev/null; then
        echo "Docker image '${IMG}' exist!"
        if [ -z "${NO_PULL_ON_BUILD_BASE_IMAGE}" ]; then
            docker pull $IMG
        fi
    else
        echo "Need to create docker image '${IMG}'!"
        docker build --platform linux/amd64 -t $IMG . --file ./docker/prod/Dockerfile/base-image.Dockerfile
        docker push $IMG
    fi
    if [ -z "${NO_PULL_ON_BUILD_BASE_IMAGE}" ]; then
        docker tag $IMG ${CI_PROJECT_NAME}-server-base
    fi
fi
