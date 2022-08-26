#!/bin/bash
#!/bin/bash
source ./set-env.sh

# Create all need application databases by exists match evn key and nx app name
# for app: "server" - env: SERVER_POSTGRES_URL
# for app: "core-server" - env: CORE_SERVER_POSTGRES_URL
npm run rucken -- postgres --app-database-url=$SERVER_POSTGRES_URL

# Run migrate database for specific database
export PSQL_PORT=5432
cd ../
export POSTGRES_URL=$SERVER_POSTGRES_URL
npm run migrate -- migrate
prisma generate
cd ./devops

# Create yaml files
mkdir -p ./k8s/generated/$BRANCH_NAME
cp -Rf ./k8s/template/* ./k8s/generated/$BRANCH_NAME
node ./k8s/prepare-k8s-files.js

### Apply to k8s
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/node/0.namespace.yaml
/snap/bin/microk8s kubectl delete configmap $NAMESPACE-config -n $NAMESPACE
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/node
/snap/bin/microk8s kubectl get secret github-regcred -n default -o yaml | sed s/"namespace: default"/"namespace: ${NAMESPACE}"/ | /snap/bin/microk8s kubectl apply -n ${NAMESPACE} -f -
/snap/bin/microk8s kubectl apply -f ./k8s/generated/$BRANCH_NAME/server
