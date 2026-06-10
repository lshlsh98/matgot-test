package com.twotwo.matmatgotgot.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleUserProfile {
    private String id;          // 구글의 고유 유저 ID
    private String email;       // 유저 이메일
    private String name;        // 유저 이름 (별명)
    private String picture;     // 프로필 이미지 URL
    private Boolean verified_email;
}