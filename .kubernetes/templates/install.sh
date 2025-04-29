#!/bin/bash
set -e

# docker regcred for pull docker images
sudo microk8s kubectl delete secret -n %NAMESPACE% docker-regcred || echo 'not need delete secret docker-regcred'
sudo microk8s kubectl create secret -n %NAMESPACE% docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred

# namespace and common config
sudo microk8s kubectl apply -f .kubernetes/generated/node
sudo microk8s kubectl get secret docker-regcred -n default -o yaml || sed s/"namespace: default"/"namespace: %NAMESPACE%"/ || microk8s kubectl apply -n %NAMESPACE% -f - || echo 'not need update docker-regcred'

# minio
sudo microk8s kubectl delete -f .kubernetes/templates/minio/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/minio

# redis
sudo microk8s kubectl delete -f .kubernetes/templates/redis/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/redis

# server
sudo microk8s kubectl delete -f .kubernetes/templates/server/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/server