# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts
RUN ./node_modules/.bin/esbuild --version || npm install esbuild

COPY . .

ARG VITE_API_URL
RUN echo "VITE_API_URL=$VITE_API_URL" > .env
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]