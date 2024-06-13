FROM node:alpine
WORKDIR /app

COPY package.json .
RUN npm install -g nodemon
RUN npm i

CMD ["npm","run", "dev"]