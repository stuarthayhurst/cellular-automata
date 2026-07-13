#Stage 0: Build the project
FROM debian:stable-slim

#Install apt dependencies
RUN apt update
RUN apt install -y npm --no-install-recommends
RUN apt clean

#Copy the project and install NPM dependencies
COPY app /cellular-automata
WORKDIR /cellular-automata
RUN npm install

#Build the project
RUN npm run build

#Stage 1: Set up the runtime container
FROM httpd:alpine

#Metadata for GitHub Container Registry
LABEL org.opencontainers.image.source="https://github.com/stuarthayhurst/cellular-automata"
LABEL org.opencontainers.image.licenses="MPL-2.0"

#Install curl for the healthcheck
RUN apk add --no-cache curl

#Copy the built project
COPY --from=0 /cellular-automata/dist/assets /usr/local/apache2/htdocs/cellular-automata/assets
COPY --from=0 /cellular-automata/dist/index.html /usr/local/apache2/htdocs/index.html

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost/ || exit 1
