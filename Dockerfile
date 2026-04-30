FROM node:20-alpine

WORKDIR /app

ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies first
COPY package.json package-lock.json* ./
# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source and build
COPY . .
# Set build-time env
ENV NODE_ENV=production
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
