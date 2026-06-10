package com.twotwo.matmatgotgot.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class JwtAuthFilter extends GenericFilter {
    @Value("${jwt.secret}")
    private String secretKey;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        String token = parseBearerToken(httpServletRequest);
        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        // 토큰 검증 및 claims 추출
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String memberId = claims.getSubject();

            // Authentication 객체 생성
            List<GrantedAuthority> authorities = new ArrayList<>();
            UserDetails userDetails = new User(memberId, "", authorities);
            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, "",
                    userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            log.error("JWT 검증 실패", e);
//            httpServletResponse.setStatus(401);
            log.info("만료된 JWT 토큰입니다.");
            ((HttpServletResponse) response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"토큰이 만료되었습니다. 다시 로그인하거나 토큰을 재발급하세요.\"}");
            return;
        }

        chain.doFilter(request, response);
    }//

    private String parseBearerToken(HttpServletRequest request) {
        // Authorization 헤더 값 가져오기
        String bearerToken = request.getHeader("Authorization");

        // "Bearer "로 시작하는 경우에만 처리 (7글자 이후부터 실제 토큰)
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " (7글자) 제거
        }

        return null; // 토큰 없음
    }//
}
