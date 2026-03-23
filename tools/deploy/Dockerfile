# livedemo-web-app: install deps and run Vite dev server on port 5000
# Build from repo root: docker build -f tools/deploy/Dockerfile .
FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# App source and env used by start-vite
COPY . .

EXPOSE 5000

# start-vite: . ./dev.env && node configEnv.js && vite serve --port 5000
# --host 0.0.0.0 is required so the server accepts connections from outside the container
CMD ["npm", "run", "start-vite", "--", "--host", "0.0.0.0"]
