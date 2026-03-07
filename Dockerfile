# ---------- build stage ----------
FROM --platform=linux/arm64 node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm rebuild esbuild

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM --platform=linux/arm64 nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]