FROM node:14

RUN npm install --global @nestjs/cli

RUN mkdir -p /app/node_modules && chown -R node:node /app

USER node

# Create Directory for the Container
WORKDIR /app

# Only copy the package.json and yarn.lock to work directory
COPY package.json package-lock.json ./

# Install all Packages
RUN npm ci

# Patch jolocom lib to allow manual transfer of funds to organization
COPY ./helper.js.patch .
RUN patch -p1 < ./helper.js.patch

# Copy all other source code to work directory
COPY . ./

EXPOSE 3000

# need to build at runtime because config.ts might be replaced/mounted
CMD [ "npm", "run", "start:debug" ]
