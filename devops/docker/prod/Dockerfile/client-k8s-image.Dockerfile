FROM nginx:alpine
COPY ./docker/prod/nginx/nginx-k8s.conf /etc/nginx/conf.d/nginx-client.conf
COPY ./docker/prod/Dockerfile/files/client /usr/share/nginx/html