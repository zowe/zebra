FROM node:8-slim

# Create app directory
WORKDIR /zebra

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install && npm install -g nodemon@2.0.0

# Bundle app source
COPY . .

CMD [ "npm", "run", "docker" ]