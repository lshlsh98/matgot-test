package com.twotwo.matmatgotgot.domain.member.entity;

import java.time.LocalDateTime; // ◀ 최신 라이브러리로 변경!

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias(value="loginMember")
public class LoginMember {
    private String token;
    private String memberId;
    private String memberThumb;
    private String memberNickname;
    private boolean admin;
    private Integer memberStatus; // 지연 - 게시글 회원 차단
    private LocalDateTime validity; // ◀ LocalDateTime 사용
    private Long memberNo;
}