package com.twotwo.matmatgotgot.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleOAuthService {

    // application.properties에 등록한 보안 키들을 가져옵니다.
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String redirectUri;

    public String getGoogleAccessToken(String code) {
        RestTemplate restTemplate = new RestTemplate();
        String targetUrl = "https://oauth2.googleapis.com/token";

        // 1. Http Header 설정 (구글은 application/x-www-form-urlencoded 형식을 요구합니다)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 2. Http Body 설정 (구글이 요구하는 5가지 필수 파라미터)
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", "http://localhost:5173");
        body.add("grant_type", "authorization_code");

        // 3. Header와 Body를 하나의 Request 객체로 묶기
        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // 구글 서버로 POST 요청 전송
            ResponseEntity<String> response = restTemplate.postForEntity(targetUrl, requestEntity, String.class);

            // 💡 디버깅용 로그: 구글이 실제로 보내준 응답 전체를 콘솔에 찍어봅니다.
            System.out.println("구글 서버 응답 바디: " + response.getBody());

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            return jsonNode.get("access_token").asText();

        } catch (Exception e) {
            // 💡 에러가 나면 단순히 문구만 출력하지 말고, 구체적인 에러 원인(StackTrace)을 출력하도록 변경
            e.printStackTrace(); 
            throw new RuntimeException("구글 Access Token을 가져오는데 실패했습니다: " + e.getMessage());
        }
    }

    public GoogleUserProfile getGoogleUserProfile(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        // 1. Http Header에 Access Token을 Bearer 토큰으로 세팅
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        // Header를 담은 Request 객체 생성 (GET 요청이므로 Body는 필요 없음)
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        try {
            // 2. 구글 유저 정보 API로 GET 요청 전송
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    requestEntity,
                    String.class
            );

            // 3. JSON 응답을 자바 객체(GoogleUserProfile)로 매핑
            ObjectMapper objectMapper = new ObjectMapper();
            GoogleUserProfile userProfile = objectMapper.readValue(response.getBody(), GoogleUserProfile.class);

            return userProfile;

        } catch (Exception e) {
            throw new RuntimeException("구글 유저 정보를 가져오는데 실패했습니다: " + e.getMessage());
        }
    }
}