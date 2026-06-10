package com.twotwo.matmatgotgot.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.twotwo.matmatgotgot.domain.member.entity.LoginMember;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;        // ◀ 추가: JWT 빌더용 기점 시간
import java.time.LocalDateTime;  // ◀ 추가: 엔티티 주입용 시간
import java.time.ZoneId;         // ◀ 추가: 시간대 변환용
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration}")
    private long expiration; // 밀리초 단위 (예: 3600000 = 1시간)

    private SecretKey secretKey;

    @PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    // // 토큰 생성
    public LoginMember createToken(String memberId, String memberNickname, Boolean admin) {
        Instant now = Instant.now();
        Instant validityInstant = now.plusMillis(expiration);

        String token = Jwts.builder()
                .subject(memberId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(validityInstant)) 
                .signWith(secretKey)
                .claim("admin", admin)
                .compact();

        LocalDateTime validityLDT = LocalDateTime.ofInstant(validityInstant, ZoneId.systemDefault());

        LoginMember login = new LoginMember();
        login.setAdmin(admin);
        login.setMemberId(memberId);
        
        // 💡 [해결 1] 리턴할 객체에 닉네임을 확실하게 넣어줍니다!
        login.setMemberNickname(memberNickname); 
        
        login.setToken(token);
        login.setValidity(validityLDT);

        return login;
    }

    // // 토큰에서 memberId 추출
    public String getMemberId(String token) {
        return Jwts.parser()                         // parserBuilder() -> parser()
                .verifyWith(secretKey)               // setSigningKey() -> verifyWith()
                .build()
                .parseSignedClaims(token)            // parseClaimsJws() -> parseSignedClaims()
                .getPayload()                        // getBody() -> getPayload()
                .getSubject();
    }

    // // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}