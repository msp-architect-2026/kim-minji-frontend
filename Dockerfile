# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 레이어: package*.json이 그대로면 kaniko 캐시를 재사용한다 (소스만 바뀐 빌드는 설치를 건너뜀)
COPY package.json package-lock.json ./
# npm ci: lockfile 그대로 설치 (install보다 빠르고 결과가 고정). esbuild 바이너리가 없으면 그때만 보충 설치
RUN npm ci --ignore-scripts \
 && (./node_modules/.bin/esbuild --version || npm install --no-save esbuild)

COPY . .

ARG VITE_API_URL
ARG VITE_GRAFANA_URL
# 값이 비면 API 호출·Grafana iframe이 조용히 깨지므로 빌드를 실패시킨다 (GitLab CI 변수 확인)
RUN echo "확인: VITE_API_URL=$VITE_API_URL VITE_GRAFANA_URL=$VITE_GRAFANA_URL" \
 && test -n "$VITE_API_URL" && test -n "$VITE_GRAFANA_URL" \
 && printf 'VITE_API_URL=%s\nVITE_GRAFANA_URL=%s\n' "$VITE_API_URL" "$VITE_GRAFANA_URL" > .env \
 && npm run build

# ---------- runtime stage ----------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
