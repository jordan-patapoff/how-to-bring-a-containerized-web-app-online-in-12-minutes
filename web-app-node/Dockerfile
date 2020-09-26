# set base image
FROM node:12

# set the working directory in the container
WORKDIR /usr/src/app

# copy the dependencies file to the working directory
COPY package*.json ./

# install dependencies
RUN npm install

# copy app source to the working directory
COPY . .

# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# command to run on container start
CMD [ "node", "server.js" ]
