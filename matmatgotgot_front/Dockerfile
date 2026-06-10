# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

# package 파일 먼저 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 복사
COPY . .

# 빌드 시 주입할 환경변수 (docker-compose build.args 로 전달)
ARG VITE_BACKSERVER
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_NAVER_MAP_KEY
ENV VITE_BACKSERVER=$VITE_BACKSERVER
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_NAVER_MAP_KEY=$VITE_NAVER_MAP_KEY

# 프로덕션 빌드
RUN npm run build

# ===== Stage 2: Nginx =====
FROM nginx:alpine

# 커스텀 nginx 설정 복사 (API 프록시 포함)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
