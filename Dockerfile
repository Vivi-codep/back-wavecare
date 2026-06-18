FROM node:22-slim

RUN apt update -y && apt install openssl -y

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD ["tail", "-f", "/dev/null"]