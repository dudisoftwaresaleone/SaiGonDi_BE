FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_PATH=/app/src
ENV NODE_OPTIONS="--experimental-loader /app/alias-loader.mjs"
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/app.js"]
