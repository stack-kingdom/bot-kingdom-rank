FROM node:23

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

RUN npm rebuild sqlite3

COPY . .

CMD ["npm", "start"]