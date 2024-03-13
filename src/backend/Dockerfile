FROM node:18

WORKDIR /usr/src/app

COPY src src
COPY package.json .
COPY tsconfig.json .

EXPOSE 7600

RUN yarn install

ENV NODE_ENV production

CMD ["yarn", "start"]