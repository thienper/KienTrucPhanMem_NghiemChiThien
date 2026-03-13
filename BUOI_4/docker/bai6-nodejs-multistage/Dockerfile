FROM node:18 AS builder

WORKDIR /app

COPY package.json .
RUN npm install

COPY src ./src
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
