# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts
RUN ./node_modules/.bin/esbuild --version || npm install esbuild

COPY . .


ARG VITE_API_URL
ARG VITE_GRAFANA_URL
RUN echo "확인: VITE_API_URL=$VITE_API_URL VITE_GRAFANA_URL=$VITE_GRAFANA_URL"
# 값이 비면 API 호출·Grafana iframe이 조용히 깨지므로 빌드를 실패시킨다 (GitLab CI 변수 확인)
RUN test -n "$VITE_API_URL" && test -n "$VITE_GRAFANA_URL"
RUN printf 'VITE_API_URL=%s\nVITE_GRAFANA_URL=%s\n' "$VITE_API_URL" "$VITE_GRAFANA_URL" > .env
RUN cat .env
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]