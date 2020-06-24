FROM node:14.3.0-alpine3.11

WORKDIR /opt/penny
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
