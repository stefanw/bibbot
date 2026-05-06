FROM node:16

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive \
        apt-get install --no-install-recommends --assume-yes \
        zip
USER node
WORKDIR /home/node
COPY --chown=node:node package.json /home/node/
RUN npm install
COPY --chown=node:node . /home/node/

VOLUME /home/node/dist
CMD ["/home/node/dist.sh"]
