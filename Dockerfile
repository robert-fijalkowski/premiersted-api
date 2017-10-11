FROM node:latest

WORKDIR  /app
ADD package.json /app/
RUN npm i --only=production
ADD . /app/
CMD npx nf run node app
EXPOSE 80
ENV LETSENCRYPT_EMAIL=mateusz@odel.ga
ARG host=api.premiersted.schibted.ga
ENV LETSENCRYPT_HOST ${host}
ENV VIRTUAL_HOST ${host}