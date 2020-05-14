FROM node:10

RUN npm install --global @nestjs/cli

RUN mkdir -p /app/node_modules && chown -R node:node /app

USER node

# Create Directory for the Container
WORKDIR /app

# Only copy the package.json and yarn.lock to work directory
COPY package.json package-lock.json ./

# Install all Packages
RUN npm install

# Copy all other source code to work directory
COPY . ./

ENV SSI_SERVER_URL=https://path/to/my/server

EXPOSE 3000

# need to build at runtime because config.ts might be replaced/mounted
CMD [ "npm", "run", "start:dev" ]
