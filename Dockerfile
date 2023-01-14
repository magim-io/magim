FROM node:alpine AS builder
WORKDIR /magim

COPY ./package*.json /

RUN mkdir -p lib/
COPY ./lib/ /lib/

RUN mkdir -p /env
COPY ./env /env

RUN mkdir -p /magim-core
COPY ./magim-core/package*.json /magim-core
COPY ./magim-core /magim-core
RUN npm install

WORKDIR /magim-core
RUN npx prisma generate
RUN npm run build


# FROM node:alpine AS server
# WORKDIR /magim
# COPY ./package* /
# RUN npm install --production
# COPY --from=builder /dist /dist
# RUN npx prisma generate


WORKDIR /magim
EXPOSE 8080
CMD npm run start