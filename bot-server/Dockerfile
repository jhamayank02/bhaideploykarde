FROM node:22-alpine

WORKDIR /app

COPY prisma ./prisma/

COPY package.json .

RUN npm install

RUN npx prisma migrate dev

RUN npx prisma generate

COPY . .

RUN npx tsc

EXPOSE 9000

ENTRYPOINT [ "node", "dist/index.js" ]