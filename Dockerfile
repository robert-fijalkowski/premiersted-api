FROM node:latest
RUN npm i -g npm foreman
WORKDIR  /app
CMD npx nf run node app
EXPOSE 80
ENV LETSENCRYPT_EMAIL=mateusz@odel.ga
ARG host=api.premiersted.schibsted.ga
ENV LETSENCRYPT_HOST ${host}
ENV VIRTUAL_HOST ${host}

ADD package.json /app/
RUN npm i --only=production
ADD . /app/