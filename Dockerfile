FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies first
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
