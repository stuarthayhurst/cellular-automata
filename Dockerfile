FROM debian:stable-slim

#Install apt dependencies
RUN apt update
RUN apt install -y npm --no-install-recommends
RUN apt clean

#Copy the project and install NPM dependencies
COPY ./ /cellular-automata
WORKDIR /cellular-automata
RUN npm install

#Build the project
RUN npm run build

FROM debian:stable-slim

#Install apt dependencies
RUN apt update
RUN apt install -y apache2 --no-install-recommends
RUN apt clean

#Copy the built project
COPY --from=0 /cellular-automata/dist/assets /var/www/html/cellular-automata/assets
COPY --from=0 /cellular-automata/dist/index.html /var/www/html/index.html

#Run the web server
EXPOSE 80 443
CMD ["apachectl", "-D", "FOREGROUND"]
