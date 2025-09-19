FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 9000

CMD npx run db-migrate-up && node dist/index.js