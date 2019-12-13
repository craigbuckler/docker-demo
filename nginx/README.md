# NGINX Docker image

NGINX image. Attempts to access static files on shared volume or acts a reverse proxy to `http://nodejs:3000/`. The site can be run from `https://localhost/` with gzip compression, HTTPS, and automatic HTTP rewrites.

To run in development mode, use `docker-compose up` or:

```sh
docker network create --driver bridge localnet
docker build -t nginx .
docker container run -it --rm -p 80:80 -p 443:443 --net localnet --volumes-from nodejs --name nginx nginx
```

Access the shell while container is running with: `docker exec -it nginx sh`
