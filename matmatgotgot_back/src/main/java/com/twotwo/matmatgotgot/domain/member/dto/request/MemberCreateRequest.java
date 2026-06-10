package com.twotwo.matmatgotgot.domain.member.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MemberCreateRequest {
    @NotBlank(message = "아이디를 입력해주세요")
    private String memberId;

    @NotBlank(message = "비밀번호를 입력해주세요")
    private String memberPw;

    @NotBlank
    private String memberName;

    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String memberEmail;

    private String memberNickname;
}
