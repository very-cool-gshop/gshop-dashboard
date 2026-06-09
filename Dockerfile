FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV PORT=3002
EXPOSE 3002
CMD ["node", ".output/server/index.mjs"]
