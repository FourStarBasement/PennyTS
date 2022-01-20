FROM node:17-stretch-slim

WORKDIR /opt/penny
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
