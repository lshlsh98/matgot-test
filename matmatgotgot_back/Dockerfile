# ============================================================
# 백엔드(Spring Boot) Dockerfile
# 멀티스테이지 빌드: 빌드 이미지와 실행 이미지를 분리해 최종 이미지 크기 절감
# ============================================================

# ── Stage 1: 빌드 ────────────────────────────────────────────
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# [캐시 최적화] 소스보다 의존성 파일을 먼저 복사
# → build.gradle이 바뀌지 않으면 gradle dependencies 레이어를 재사용
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon || true

# 전체 소스 복사 후 JAR 빌드 (테스트는 CI/CD에서 별도 실행하므로 스킵)
COPY src ./src
# RUN gradle bootJar --no-daemon -x test

# ── Stage 2: 실행 ────────────────────────────────────────────
# JRE만 포함된 경량 Alpine 이미지 사용 (JDK 불필요)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 타임존을 서울(KST)로 설정
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone \
    && apk del tzdata

# 빌드 스테이지에서 생성된 JAR만 복사 (소스/Gradle 캐시는 제외)
COPY --from=builder /app/build/libs/*.jar app.jar

# Spring Boot 기본 포트
EXPOSE 8080

# JVM 메모리 옵션 설명:
#   -XX:+UseContainerSupport        : 컨테이너 메모리 제한을 JVM이 인식
#   -XX:MaxRAMPercentage=75.0       : 컨테이너 메모리의 75%를 힙으로 사용
#   -Djava.security.egd=...         : Tomcat 구동 속도 향상 (난수 생성기 설정)
ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-jar", "app.jar"]
