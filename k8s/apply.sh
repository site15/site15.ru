/snap/bin/microk8s kubectl apply -f  ./k8s/$HOST_TYPE/postgres
POD=$(/snap/bin/microk8s kubectl get pod -l app=postgres -n postgres-$HOST_TYPE -o jsonpath="{.items[0].metadata.name}")
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE $POD -- psql -U postgres -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD'"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -c "CREATE DATABASE $POSTGRES_DATABASE"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "$POSTGRES_DATABASE" -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "$POSTGRES_DATABASE" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "$POSTGRES_DATABASE" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "$POSTGRES_DATABASE" -c "GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DATABASE TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "$POSTGRES_DATABASE" -c "ALTER USER $POSTGRES_USER WITH LOGIN CREATEROLE NOCREATEDB NOSUPERUSER INHERIT"
/snap/bin/microk8s kubectl delete deployment $PROJECT_NAME-frontend -n $PROJECT_NAME-$HOST_TYPE --now
/snap/bin/microk8s kubectl delete deployment $PROJECT_NAME-backend -n $PROJECT_NAME-$HOST_TYPE --now
/snap/bin/microk8s kubectl apply -f ./k8s/$HOST_TYPE
