package com.twotwo.matmatgotgot.domain.member.dto;

import lombok.Data;

@Data // Lombok이 없다면 Getter, Setter 직접 생성
public class LoginResponseDto {
    private Long memberNo;
    private String memberId;
    private String memberName;
    private String memberEmail;
    private String memberNickname;
    private String memberThumb;
    private Boolean admin;
    private Integer memberStatus; //지연 - 게시글 회원 기능 차단
    private String token;
    private long validity; // 💡 프론트엔드가 계산하기 편하게 숫자로 변경!
    private Double lat;
    private Double lng;
}