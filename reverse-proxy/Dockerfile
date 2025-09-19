FROM node:22-alpine

# Update package manager and install security updates
RUN apk update && apk upgrade

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 9000

ENTRYPOINT [ "node", "dist/index.js" ]