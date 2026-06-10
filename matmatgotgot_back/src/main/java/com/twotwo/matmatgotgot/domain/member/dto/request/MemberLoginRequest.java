package com.twotwo.matmatgotgot.domain.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MemberLoginRequest {
    @NotBlank
    private String memberId;

    @NotBlank
    private String memberPw;
}
