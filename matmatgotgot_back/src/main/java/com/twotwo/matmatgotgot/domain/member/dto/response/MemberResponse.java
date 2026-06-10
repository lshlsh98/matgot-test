package com.twotwo.matmatgotgot.domain.member.dto.response;

import java.time.LocalDateTime;

import com.twotwo.matmatgotgot.domain.member.entity.Member;

import lombok.Data;

@Data
public class MemberResponse {
    private Long id;
    private String memberId;
    private String memberName;
    private String memberEmail;
    private String memberNickname;
    private String memberThumb;
    private int memberStatus;
    private LocalDateTime enrollDate;
    private boolean admin;
    // memberPw 없음

    public static MemberResponse from(Member member) {
        MemberResponse response = new MemberResponse();
        response.memberId = member.getMemberId();
        response.memberName = member.getMemberName();
        response.memberEmail = member.getMemberEmail();
        response.memberNickname = member.getMemberNickname();
        response.memberThumb = member.getMemberThumb();
        response.memberStatus = member.getMemberStatus();
        response.enrollDate = member.getEnrollDate();
        response.admin = member.getAdmin();
        return response;
    }
}
