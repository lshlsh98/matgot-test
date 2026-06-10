package com.twotwo.matmatgotgot.domain.member.dto; // 패키지 경로에 맞게 수정

import lombok.Data;

@Data
public class MemberLoginDto {
    private Long memberNo; // 로그인 시 회원 번호도 함께 전달받도록 추가
    private String memberId;
    private String memberPw;
    private String memberEmail;
    private String memberNickname;
    private String memberThumb;

    // 기본 생성자, Getter, Setter 필수! (Lombok이 있다면 @Data 나 @Getter/@Setter 추가)
    public Long getMemberNo() { return memberNo; }
    public void setMemberNo(Long memberNo) { this.memberNo = memberNo; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getMemberPw() { return memberPw; }
    public void setMemberPw(String memberPw) { this.memberPw = memberPw; }

}