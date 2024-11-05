FROM node:8-slim

# Create app directory
WORKDIR /zebra

#this needs to be done since node 8 is old and doesn't support the latest sqlite3 version.
#update sources.list to use archive repositories and remove security updates.
RUN sed -i -e 's/deb.debian.org/archive.debian.org/g' \
    -e '/security/d' \
    -e '/updates/d' /etc/apt/sources.list \
    && echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/100disablechecks

#install Python and build dependencies, needed for sqlite3. will change in future versions.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "start" ]