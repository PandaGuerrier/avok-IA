FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g corepack@latest
RUN corepack enable pnpm

# Accept build-time envs (for front build/bundling)
ARG VITE_API_URL

# Make them available to build tools
ENV VITE_API_URL=$VITE_API_URL \
    CI=true

COPY . .

RUN pnpm install --force --frozen-lockfile

WORKDIR /app/apps/web

# Build the app (will read envs above if needed)
RUN node ace build --ignore-ts-errors

WORKDIR /app/apps/web/build

EXPOSE 3333

CMD ["node", "bin/server.js"]
