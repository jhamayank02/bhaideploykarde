FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

RUN apt-get install git -y

WORKDIR /home/app

# Copy the package.json file to the /app directory
COPY package.json .
# Install dependencies for the application
RUN npm install
# Copy the rest of the application code to the /app directory
COPY . .
# Build the application
RUN npm run build
# Expose the application port
EXPOSE 9003

RUN chmod +x dist/index.js

ENTRYPOINT ["node", "dist/index.js"]