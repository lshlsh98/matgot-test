package com.twotwo.matmatgotgot.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SpringSecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 적용 (리액트 브라우저 접근 허용)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. CSRF 비활성화 (REST API 환경이므로 꺼둡니다)
            .csrf(csrf -> csrf.disable())
            
            // 3. 기본 세션/폼 로그인 비활성화 (JWT를 사용할 것이므로 불필요한 기본 창 해제)
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // 4. URL별 접근 권한 설정
            .authorizeHttpRequests(authorize -> authorize
                    // static 리소스나 에러 페이지 허용
                    .requestMatchers("/error", "/favicon.ico").permitAll()
                    .requestMatchers("/upload/**").permitAll()
                    .requestMatchers("/members/**", "/login", "/members/pwMember","/members/memberno").permitAll()
                .requestMatchers("/boards/**").permitAll()
                    // 에디터 이미지 접근 허용
                    .requestMatchers("/editor/**").permitAll()
                    // 맛집 이미지 접근 허용
                    .requestMatchers("/restaurants/**").permitAll()
                    // 네이버 검색 API 허용
                    .requestMatchers("/api/naver/**").permitAll()
                    .requestMatchers("/admin/**").permitAll()
                // 그 외 모든 요청은 기본적으로 인증(로그인)을 받도록 설정
                .requestMatchers("/trips/**").permitAll()
                .requestMatchers("/menu/**").permitAll()
                .requestMatchers("/api/route/**").permitAll()
                .requestMatchers("/main/**").permitAll()
                .anyRequest().authenticated()
            );
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 💡 비밀번호 암호화 객체 (회원가입 비즈니스 로직 시 필수)
    @Bean
    public BCryptPasswordEncoder bCrypt() {
        return new BCryptPasswordEncoder();
    }

    // 💡 리액트(5173 포트) 연동 및 credential 허용을 위한 CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowedOrigins(List.of("http://localhost:5173")); // 프론트엔드 주소 허용
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS")); // OPTIONS 포함 필수
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 👈 핵심: axios의 withCredentials와 맞물리는 설정!

        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 URL 경로에 위의 CORS 설정 적용
        return source;
    }
}