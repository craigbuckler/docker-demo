FROM node:lts-alpine

RUN npm i -g nodemon

ENV HOME=/home/node/app
ENV NODE_ENV=production

RUN mkdir -p $HOME && chown -R node:node $HOME

COPY package*.json $HOME/

USER node
WORKDIR $HOME
RUN npm i

COPY --chown=node:node . .

VOLUME ["/home/node/app/static"]
EXPOSE 3000

CMD npm start
