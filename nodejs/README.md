# NGINX Node.js Express.js application

Express.js application. The site can be run from `http://localhost:3000/`, but NGINX is used as a reverse proxy to `https://localhost/` with gzip compression, HTTPS, and automatic HTTP rewrites.

To run in development mode, use `docker-compose up` or:

```sh
docker network create --driver bridge localnet
docker build -t nodejs .
docker container run -it --rm -e NODE_ENV=development -p 3000:3000 --net localnet -v /d/documents/projects/docker-demo/nodejs:/home/node/app --name nodejs --entrypoint '/bin/sh' nodejs -c 'npm i && npm run debug'
```

Access the shell while container is running with: `docker exec -it nodejs sh`

Notes:

* On Linux, the `-v` path can be `$PWD` for the current directory
* `legacyWatch` must be enabled for [nodemon](https://nodemon.io/) (set in `nodemon.json`)
