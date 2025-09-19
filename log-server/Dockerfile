FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 9000

ENTRYPOINT [ "node", "dist/index.js" ]