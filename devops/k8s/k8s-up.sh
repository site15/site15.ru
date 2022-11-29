#!/bin/bash
set -e
source ./set-env.sh

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
npm run migrate
cd ./devops

# Change database host for applications
export PSQL_PORT=11432
export PSQL_HOST=10.0.1.1
export ROOT_POSTGRES_URL=postgres://${ROOT_POSTGRES_USER}:${ROOT_POSTGRES_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/postgres?schema=public
export SERVER_POSTGRES_URL=postgres://${PSQL_USERNAME}:${PSQL_PASSWORD}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DATABASE}?schema=public


# Create yaml files
mkdir -p ./k8s/generated/$BRANCH_NAME
cp -Rf ./k8s/template/* ./k8s/generated/$BRANCH_NAME
node ./k8s/prepare-k8s-files.js

### Apply to k8s
set +e
/snap/bin/microk8s kubectl delete secret site15-global-regcred
/snap/bin/microk8s kubectl create secret docker-registry site15-global-regcred --docker-server=$CI_REGISTRY --docker-username=$CI_REGISTRY_USER --docker-password=$CI_REGISTRY_PASSWORD
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/node/0.namespace.yaml
/snap/bin/microk8s kubectl delete configmap $NAMESPACE-config -n $NAMESPACE
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/node
/snap/bin/microk8s kubectl get secret site15-global-regcred -n default -o yaml | sed s/"namespace: default"/"namespace: ${NAMESPACE}"/ | /snap/bin/microk8s kubectl apply -n ${NAMESPACE} -f -
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/server
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/client
set -e

npx -y wait-on --timeout=160000 --interval=1000 --window --verbose --log $PROJECT_URL/api/version/check-tag/$TAG_VERSION?healthcheck=true

source ./test/test.sh