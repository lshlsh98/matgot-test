# ============================================================
# 프론트엔드(React + Vite) Dockerfile
# 멀티스테이지 빌드: Node로 빌드 → Nginx로 정적 파일 서빙
# ============================================================

# ── Stage 1: Vite 빌드 ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# [캐시 최적화] 소스보다 package 파일 먼저 복사
# → package.json이 바뀌지 않으면 npm install 레이어를 재사용
COPY package*.json ./
RUN npm ci --silent   # npm install보다 ci가 더 빠르고 재현 가능

# 전체 소스 복사
COPY . .

# Vite 빌드 시점에 환경변수 주입 (ARG → ENV 순서로 전달)
# docker-compose.yml의 build.args에서 값을 받아옴
ARG VITE_BACKSERVER
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_NAVER_MAP_KEY

# ARG를 ENV로 변환해야 RUN 단계에서 vite가 읽을 수 있음
ENV VITE_BACKSERVER=$VITE_BACKSERVER
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_NAVER_MAP_KEY=$VITE_NAVER_MAP_KEY

# 프로덕션 빌드 → /app/dist 디렉터리에 결과물 생성
RUN npm run build

# ── Stage 2: Nginx 서빙 ───────────────────────────────────────
FROM nginx:1.25-alpine

# 기본 Nginx 설정 제거 후 커스텀 설정 적용
# (SPA 라우팅 + /api 백엔드 프록시 포함)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물(dist/)을 Nginx 웹 루트로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# HTTP 포트
EXPOSE 80

# Nginx를 포그라운드(daemon off)로 실행해야 Docker가 프로세스를 감지 가능
CMD ["nginx", "-g", "daemon off;"]
