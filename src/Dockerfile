FROM node:22.14.0-slim

# Create app directory
WORKDIR /zebra

# Create a non-root user
RUN groupadd -r zebrauser && useradd -r -g zebrauser zebrauser

# Install Python and build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Change ownership to non-root user
RUN chown -R zebrauser:zebrauser /zebra

# Switch to non-root user
USER zebrauser

CMD [ "npm", "start" ]
