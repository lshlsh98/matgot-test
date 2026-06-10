package com.twotwo.matmatgotgot.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

// 에러코드 Enum
// HTTP 상태코드 + 에러코드 + 메시지를 한 곳에서 관리
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통 (C)
    INVALID_INPUT(HttpStatus.BAD_REQUEST,            "C001", "잘못된 입력값입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED,            "C002", "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN,                  "C003", "접근 권한이 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C004", "서버 오류가 발생했습니다."),

    // 회원 (U)
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND,             "U001", "사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT,             "U002", "이미 사용 중인 이메일입니다."),

    // 주문 (O)
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND,            "O001", "주문을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}