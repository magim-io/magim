FROM node:alpine

WORKDIR /usr/magim

COPY package*.json .

RUN npm install

COPY . .

WORKDIR /usr/magim/magim-core

RUN npx prisma generate

RUN npm run build

WORKDIR /usr/magim/dist/magim-core/env

COPY env/ ./

WORKDIR /usr/magim

EXPOSE 8080

CMD ["npm", "run", "start"]