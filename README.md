# Docker demonstration

An example Docker-based project which creates four lightweight, isolated container environments:

1. A Node.js Express server implementing HTML and JSON endpoint responses (`nodejs` container/directory).
1. An NGINX server which implements static files and reverse proxying to the Express application with gzip compression, HTTPS, and automatic HTTP rewrites (`nginx` container/directory).
1. MySQL 8 (default image, `mysql` container/directory).
1. Adminer database client (default image, development only, no files required).

Development and production builds are provided. Development mode uses `nodemon`, `--inspect`, and can provide live reloading.


## Generate localhost SSL certificates

Generate localhost SSL certificates on your system. Use [mkcert](https://github.com/FiloSottile/mkcert) to create locally-trusted development certificates:

```sh
mkcert-v1.4.1-windows-amd64.exe localhost 127.0.0.1 ::1
```

Copy the resulting files to `./nginx/ssl/cert.pem` and `./nginx/ssl/cert-key.pem` (not in Git repo).

Now create a new local CA with:

```sh
mkcert -install
```

Note: this may fail to install on Firefox. Locate the `rootCA.pem` file (`C:\Users\<name>\AppData\Local\mkcert` on Windows) then, in Firefox, choose menu, Options, and find **Certificates** in **Privacy & Security**. Click **View Certificates**, choose the **Authorities** tab, click **Import...**, select the `rootCA.pem` file, import, and restart Firefox.

Alternatively, use OpenSSL to create self-signed certificates after connecting to a container (see below):

```sh
cd ssl
apk add --update openssl
openssl genrsa -out cert-key.pem 1024
openssl req -new -key cert-key.pem -out cert.csr
openssl x509 -req -in cert.csr -signkey cert-key.pem -out cert.pem
```

## Quick start

Build and run both containers in development mode:

```sh
docker-compose build
docker-compose up
```

Open `https://localhost/` in any browser.

Access shell of container while running:

```sh
docker exec -it nginx sh
docker exec -it nodejs sh
docker exec -it mysql sh
```


## Docker overview

Docker runs applications inside a lightweight container. Ideally, each application should be small and stateless (not storing any permanent files). The Docker server can run anywhere and be controlled by the CLI.

Terminology and concepts:

|term|description|
|-:|-|
|Dockerfile|a set of instructions referencing an OS, installing dependencies, accessing host files, and starting an application|
|build|the process of creating an image from a Dockerfile|
|image|layered file system which can be run as a container (note that an image can be used as-is without a Dockerfile)|
|container|the running instance of an image|
|Docker Compose|can run and manage multiple containers|
|docker-compose.yml|Docker Compose configuration file|

This project defines Dockerfile configurations for production, but development mode can be enabled on the command-line or in docker-compose configurations.


### Dockerfile

See Dockerfile examples and [reference](https://docs.docker.com/engine/reference/builder/). Most will:

1. Reference a specific image `FROM` the [Docker hub](https://hub.docker.com/) (read instructions specific to that image).
1. Set `ENV` environment variables.
1. `RUN` specific installation commands.
1. Set a `WORKDIR` directory.
1. `COPY` or `ADD` files from the host machine.
1. Mount `VOLUME`s which can be accessed from other containers.
1. `EXPOSE` ports for external access (or internal container access).
1. Run a start `CMD`.

Each command is processed in order. A new build will only run what has changed so infrequent changes should be toward the top (`RUN npm install`) with more frequent changes to the bottom (`COPY . .`).

`alpine` images tend to be smaller than other Linux options (around 5MB download).


### .dockerignore

The `.dockerignore` file defines files which will be ignored by Docker and not copied to the image, e.g. Git files, VS Code configurations, etc. For example, block all `.txt` files except `special.txt`

```text
.config
.git
.gitignore
.npm
.vscode
node_modules

**/*.txt
!special.txt
```


### Building images

To build an image from a Dockerfile:

```sh
docker image build -t <name> .
```

where `<name>` will be the new image name.

Add `-f <file>` set a specific Dockerfile.

The Node.js and NGINX images can be manually built from their directories:

```sh
cd ./nodejs
docker build -t nodejs .

cd ../nginx
docker build -t nginx .
```

This can take some time for the initial build but it will become faster as build steps are stored.


### Managing images

Commands include:

* `docker image ls` - list images (add `-a` to view all)
* `docker rmi -f <name>` - remove an image
* `docker image prune` - remove dangling images (add `-a` to remove all)
* `docker image inspect <name>` - build step information


## Data volumes

Docker containers do not retain state information. A volume on the host can be mounted to:

* store persistent data, such as a database
* share data across containers
* access files from the host during development (app restarting, instant reloading, etc.)

A volume can be manually created:

```sh
docker volume create <name>
docker volume ls
docker volume inspect <name>
```

then referenced on the `docker container` CLI, e.g. `-v <name>:/data`.

However, it is usually easier to define volumes when a container is launched or in Docker Compose configuration.


## Networking

Docker provides a default network, but a custom network allows each machine to be referenced by its name rather than an IP address.

Docker Compose can define a network but, when running `docker` containers directly, it is necessary to create the network first:

```sh
docker network create --driver bridge <netname>
```

For this project, a `<netname>` of `localnet` is presumed.

Networking commands include:

* `docker network ls` - list networks
* `docker network inspect <name>` - inspect a network
* `docker exec <name> ifconfig` - get container internal IP


## Launch containers separately

The [`docker` CLI](https://docs.docker.com/engine/reference/commandline/cli/) can specify options, environment variables, ports, networks, volumes, etc.

Start both containers in development interactive mode where the STDOUT messages are output:

```sh
docker container run -it --rm -e NODE_ENV=development -p 3000:3000 --net localnet -v /d/documents/projects/docker-demo/nodejs:/home/node/app --name nodejs --entrypoint '/bin/sh' nodejs -c 'npm i && npm run debug'

docker container run -it --rm -p 80:80 -p 443:443 --net localnet --volumes-from nodejs --name nginx nginx

docker run -d --rm --name mysql --net localnet -p 3306:3306 -v /d/documents/projects/docker-demo/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=mysecret mysql:8

docker run -d --rm --name adminer --net localnet -p 8080:8080 adminer
```

The system can be accessed at `https://localhost/`. The Node.js app can also be accessed directly at `http://localhost:3000/`. Adminer can be accessed at `http://localhost:8080/` - attach to the `mysql` server using the `root` user and password `mysecret`.

Options include:

* `-rm` - deletes the container after it has been stopped (Ctrl + C)
* `-e` - sets an environment variable
* `-p` - maps a public port to an internal Docker port
* `--net` - set the network
* `-v` - sets a volume. A full path is required in Windows, although `$PWD` can be used on Linux to set the current working directory.
* `--name` - set a container name for easier management.
* `--entrypoint` - a custom script to run instead of `CMD`.
* `-d` - run in detached mode (background)
* `--restart-on-failure` - restarts automatically
* `--user "$(id -u):$(id -g)"` run as a specific Linux user
* `--shm-size` allocates more RAM

`Ctrl + C` stops an interactive container (it remains available unless `-rm` is set).

`Ctrl + P` then `Ctrl + Q` exits the interactive shell but the container remains active. Reattach with `docker attach <name>`.

It is possible to open the shell of any running container with:

```sh
docker exec -it <name> sh
```

(or use `bash` instead of `sh` where available.)

For example, the database can be initialised with:

```sh
docker exec -i mysql mysql -u root -pmysecret < ./mysql/install.sql
```

Alternatively, launch Adminer and execute the content of `install.sql` in a SQL command.


### Launch in production mode

Both containers can be launched in production mode (after building):

```sh
docker container run -d --rm -p 3000 --net localnet --name nodejs nodejs

docker container run -d --rm -p 80:80 -p 443:443 --net localnet --volumes-from nodejs --name nginx nginx
```

Note that `-p 3000` exposes the `nodejs` port to the Docker network but not the external network.

Both can be stopped with `docker container stop nginx nodejs`.


### Managing containers

Commands include:

* `docker container ls` - list containers
* `docker container logs <name>` - show logs (add `-f` for tail)
* `docker container stop <name1> <name2> <name3>` - stop container(s)
* `docker container rm -f <name>` - stop and remove container
* `docker container prune` - remove stopped containers
* `docker image inspect <name>` - build step information


## Docker Compose

`docker-compose` allows multiple containers to be configured and launched instead of using multiple `docker` CLI commands. Each container's settings are defined in a single [docker-compose.yml](https://docs.docker.com/compose/compose-file/) file with environment variables, build instructions, commands, volumes, networks, and ports.

`.env` files can be used to define local environment variables and host environment variables can be defined using JavaScipt-like `"replacement ${values}"`.

To build the initial images:

```sh
docker-compose build
```

To run all containers and show output:

```sh
docker-compose up
```

Add `-d` to run as a background task, then use:

* `docker-compose exec <name> sh` - access container shell
* `docker-compose stop` - stop all containers

To run in production mode:

```sh
docker-compose -f .\docker-compose-production.yml build

docker-compose -f .\docker-compose-production.yml up -d
```

This still presumes `localhost` is used, so a different Dockerfile and NGINX configuration is required for real domains.


## System and clean up

Commands include:

* `docker system info` - system information
* `docker system df` - host storage used
* `docker system prune -af` - remove all Docker images, containers, and networks
* `docker volume prune -f` - remove all Docker volumes


## Docker links

* [Docker overview](https://docs.docker.com/engine/docker-overview/)
* [Docker hub](https://hub.docker.com/)
* [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
* [docker CLI](https://docs.docker.com/engine/reference/commandline/cli/)
* [docker-compose.yml reference](https://docs.docker.com/compose/compose-file/)
* [docker-compose CLI](https://docs.docker.com/compose/reference/overview/)
* [Dive into Docker (SitePoint course)](https://www.sitepoint.com/premium/courses/dive-into-docker-3007/) - only lessons 6 and 7 are essential
* [Docker for Node.js video](https://www.youtube.com/watch?v=Zgx0o8QjJk4)


### General tips

* Use Node.js slim may be preferable to alpine images. They are a little larger but more reliable and have more features.
* Use even-numbered Node.js LTS releases.
* Do not use forever or pm2 - use Docker to restart. Tini can help.
* Use multi-stage builds, where images are built from each other ([Docker for Node.js video](https://www.youtube.com/watch?v=Zgx0o8QjJk4) around 25 mins in).
