package com.twotwo.matmatgotgot.domain.member.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="member")
public class Member {
    private Long memberNo;
    private String memberId;
    private String memberPw;
    private String memberName;
    private String memberEmail;
    private String memberNickname;
    private String memberAddress;
    private String memberThumb;
    private Integer memberStatus;
    private LocalDateTime enrollDate;
    private Boolean admin;
    private String socialLogin;
    private Double lat;
    private Double lng;
    private Integer adContent;

    private String newMemberPw;
    private String newMemberPwRe;

    private String newMemberEmail;
}