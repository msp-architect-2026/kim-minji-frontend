<h1 align="center">kim-minji-frontend</h1>

<p align="center">
  웨이퍼 결함 탐지 시스템의 <strong>React 기반 웹 대시보드</strong> 레포지토리입니다.
</p>



<p align="center">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"/>
<img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white"/>
</p>


## ▍개요

웨이퍼 이미지 업로드부터 AI 추론 결과 시각화, 이력 관리, 통계 분석, 모니터링까지 **서비스 전체를 통합 운영할 수 있는 웹 대시보드**입니다.

Backend REST API와 연동하며, Grafana 대시보드를 iframe으로 임베드해 클러스터 상태와 애플리케이션 메트릭을 한 화면에서 확인할 수 있습니다.

<br>

## ▍관련 레포지토리

| Repository | 설명 |
|------------|------|
| [kim-minji-wiki](https://github.com/msp-architect-2026/kim-minji-wiki) | 프로젝트 메인 (Wiki, 칸반보드) |
| [kim-minji-backend](https://github.com/msp-architect-2026/kim-minji-backend) | Spring Boot API 서버 |
| [kim-minji-ai](https://github.com/msp-architect-2026/kim-minji-ai) | FastAPI AI 추론 서비스 |
| [kim-minji-helm](https://github.com/msp-architect-2026/kim-minji-helm) | Kubernetes Helm Chart |
| [kim-minji-infra](https://github.com/msp-architect-2026/kim-minji-infra) | k3s 클러스터 및 GitOps 인프라 |

<br>

## ▍주요 기능

### 1. 🤖 이미지 업로드 및 AI 추론
드래그앤드롭 또는 파일 선택으로 웨이퍼 이미지를 업로드하면 결함 유형과 신뢰도를 즉시 반환합니다.

| none | scratch | random |
|------|---------|--------|
| <img src="https://github.com/user-attachments/assets/c031f298-ae7f-4d50-9ed4-65650c780f91" width="250"/> | <img src="https://github.com/user-attachments/assets/acacd5a2-510b-4341-a6ff-5562c0f581e6" width="250"/> | <img src="https://github.com/user-attachments/assets/be2e48a0-634f-4f22-ab43-d936e4950c7e" width="250"/> |

| loc | donut | near-full |
|-----|-------|-----------|
| <img src="https://github.com/user-attachments/assets/51864da6-016b-4b4d-8809-b110a397dd8b" width="250"/> | <img src="https://github.com/user-attachments/assets/ab4940bb-7843-42af-832d-856b4e518898" width="250"/> | <img src="https://github.com/user-attachments/assets/7a04f608-c9c7-4881-90e6-b4732247d4e5" width="250"/> |

| center | edge-loc | edge-ring |
|--------|----------|-----------|
| <img src="https://github.com/user-attachments/assets/1b73faca-8462-4dcb-a312-44ef1c2af535" width="250"/> | <img src="https://github.com/user-attachments/assets/e6b8d7f2-a9e3-4110-ab03-3c56e304ac5f" width="250"/> | <img src="https://github.com/user-attachments/assets/d1a2fe6c-3042-494b-9fba-d28902837c8d" width="250"/> |

<br>

### 2. 🖥 통합 운영 대시보드

시스템 전체 분석 현황을 한눈에 확인할 수 있는 **통합 관제 화면**을 제공합니다.  
총 검사 수, 결함 수, 정상 수, 평균 신뢰도 등 핵심 KPI를 실시간으로 확인할 수 있습니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/528a50c3-a73c-42ac-980a-80a9237098c5" width="620"/>
</p>

### 3. 📊 실시간 분석 대시보드
KPI 카드, 결함 분포, 일별 추이 차트를 통해 분석 현황을 실시간으로 확인할 수 있습니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/70e48e28-f20f-4eac-9b41-fd6dc42535db" width="620"/>
</p>

### 4. 📦 이력 관리 및 CSV 내보내기
검색, 페이징, 날짜·결함 유형 필터를 지원하며 분석 이력을 날짜별로 CSV로 내보낼 수 있습니다. <br>
각 항목 클릭 시 파일명, 예측 클래스, 신뢰도, 생성 시각을 상세 확인할 수 있습니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/e2cd6dae-b5f5-4023-a170-146092f67a2c" width="620"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/33e47aaa-930d-40d8-bb01-beab847588f8" width="620"/>
</p>





### 5. 🔍 통합 모니터링
Grafana 대시보드(클러스터 현황 / 앱 메트릭 / 로그)를 iframe으로 임베드해 운영 현황을 한눈에 파악합니다.

| 구분 | 화면 |
|------|------|
| **클러스터 모니터링** | <img src="https://github.com/user-attachments/assets/43bc87e9-7dd0-4e7c-bb94-7313614ac96e" width="520"/> |
| **애플리케이션 메트릭** | <img src="https://github.com/user-attachments/assets/b75f66ed-9697-4a8e-b895-7796306a32a1" width="400"/> |
| **로그 모니터링** | <img src="https://github.com/user-attachments/assets/0bd09915-aea4-4b8e-8d68-d66227ddab53" width="520"/> |





<br>

## ▍페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Dashboard | KPI 카드 + 최근 추론 목록 |
| `/analyze` | UploadAndAnalyze | 이미지 업로드 + 결과 카드 |
| `/records` | RecordList | 이력 목록 + 검색/페이징/CSV 내보내기 |
| `/records/:id` | RecordDetail | 추론 결과 상세 + confidence bar |
| `/analytics` | Analytics | 일별 라인차트 + 결함 분포 파이차트 |
| `/monitoring` | Monitoring | Grafana 대시보드 iframe 임베드 |

<br>

## ▍프로젝트 구조

```
src/
├── api/
│   └── recordApi.js          # Backend API 호출 함수 모음
├── utils/
│   └── defectColors.js       # 결함 유형별 색상 매핑 (DEFECT_COLORS, CHART_COLORS)
└── pages/
    ├── Dashboard.jsx
    ├── UploadAndAnalyze.jsx
    ├── RecordList.jsx
    ├── RecordDetail.jsx
    ├── Analytics.jsx
    └── Monitoring.jsx
```

<br>

## ▍API 연동

| 함수 | 메서드 | 경로 | 설명 |
|------|--------|------|------|
| `uploadAndAnalyze` | POST | `/ai/predict` | 이미지 업로드 및 추론 |
| `fetchPagedRecords` | GET | `/wafer/records/pages` | 페이지네이션 목록 |
| `fetchRecordById` | GET | `/wafer/records/{id}` | 단건 상세 조회 |
| `fetchStats` | GET | `/wafer/stats` | KPI 통계 |
| `fetchDailyStats` | GET | `/wafer/stats/daily` | 일별 추이 |
| `fetchDefectDistribution` | GET | `/wafer/stats/defect-distribution` | 결함 분포 |
| `fetchAllRecords` | GET | `/wafer/records` | 전체 목록 |
| `exportRecords` | GET | `/wafer/records/export` | CSV 내보내기용 필터 목록 |

<br>

## ▍환경변수

```bash
VITE_API_URL=http://api.wafer.local:32088
```

React는 빌드 타임에 API URL이 번들에 포함되므로 GitLab CI/CD Variables에 등록 후 kaniko 빌드 시 `--build-arg`로 주입합니다.

<br>

## ▍Dockerfile (멀티스테이지)

```dockerfile
# Build Stage
FROM node:20-alpine AS build
ARG VITE_API_URL
RUN echo "VITE_API_URL=$VITE_API_URL" > .env
RUN npm run build

# Runtime Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

- Vite 기반 빌드, esbuild 별도 설치 (alpine 호환 이슈 대응)
- React SPA 라우팅 fallback 처리 (`nginxSpaFallback: enabled`)
- `--platform=linux/arm64` (맥북 M5 기반 VM 대응)

<br>

## ▍Helm Chart 스펙

| 항목 | 값 |
|------|----|
| replicaCount | 1 |
| CPU requests / limits | 100m / 300m |
| Memory requests / limits | 128Mi / 256Mi |
| Probe | liveness / readiness TCP 포트 확인 |
| Ingress | 비활성화 (별도 ingress chart 관리) |

<br>

## ▍CI/CD 파이프라인

```
git push (main 브랜치)
└─ GitLab CI 트리거
   └─ kaniko ARM64 이미지 빌드 (VITE_API_URL 주입)
      └─ GitLab Registry (gitlab.local:5050) push (SHA + latest 태그)
         └─ update-helm.sh → kim-minji-helm values.yaml 태그 업데이트
            └─ ArgoCD 감지 → k3s 자동 배포
```

- `develop` 브랜치: build 단계만 실행
- `main` 브랜치: build + update-helm 전체 실행

<br>

## ▍사용 라이브러리

| 라이브러리 | 용도 |
|-----------|------|
| `recharts` | 라인차트, 파이차트 |
| `axios` | HTTP 통신 |
| `react-router-dom` | SPA 라우팅 |



