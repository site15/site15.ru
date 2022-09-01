#!/bin/bash
source ./set-env.sh

cp -Rf ../dist/apps/server ../devops/docker/prod/Dockerfile/files
cp -Rf ../prisma ../devops/docker/prod/Dockerfile/files

if [ -z "${NO_PUSH_DOCKER_IMAGES}" ]; then
    if [ -z "${CI_COMMIT_SHORT_SHA}" ]; then
        echo "No deploy to github [INFO-2]"

        export IMG="${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_BASE_IMAGE}"
        docker build --platform linux/amd64 -t $IMG . --file ./docker/prod/Dockerfile/base-image.Dockerfile
        docker tag $IMG ${CI_PROJECT_NAME}-server-base

        docker build --platform linux/amd64 -t ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE} . --file ./docker/prod/Dockerfile/server-image.Dockerfile
        docker tag ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE} ${CI_PROJECT_NAME}-${TAG_VERSION}
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
        docker tag $IMG ${CI_PROJECT_NAME}-server-base

        docker build --platform linux/amd64 -t ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE} . --file ./docker/prod/Dockerfile/server-image.Dockerfile
        docker push ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE}
        docker tag ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE} ${CI_PROJECT_NAME}-${TAG_VERSION}
    fi
else
    echo "No deploy to github [INFO-3]"

    docker logout $CI_REGISTRY

    export IMG="${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_BASE_IMAGE}"
    echo ${CI_PROJECT_NAME}-server-base
    docker tag $IMG ${CI_PROJECT_NAME}-server-base

    docker build --platform linux/amd64 -t ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE} . --file ./docker/prod/Dockerfile/server-image.Dockerfile
    docker tag ${CI_REGISTRY}/${CI_PROJECT_NAMESPACE}/${SERVER_IMAGE} ${CI_PROJECT_NAME}-${TAG_VERSION}
fi
