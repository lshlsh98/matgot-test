package com.twotwo.matmatgotgot.global.response;

import com.twotwo.matmatgotgot.global.exception.ErrorCode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

//공통 응답 래퍼
@Getter
@RequiredArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String code;
    private final String message;

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(false, null, errorCode.getCode(), errorCode.getMessage());
    }

    // 실패 응답 (메시지 오버라이드)
    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        return new ApiResponse<>(false, null, errorCode.getCode(), message);
    }
}

// 응답 예시
//// 성공
//{
//        "success": true,
//        "data": { "id": 1, "memberName": "홍길동", "memberEmail": "hong@example.com" },
//        "code": null,
//        "message": null
//        }
//
//// 실패 - 사용자 없음
//        {
//        "success": false,
//        "data": null,
//        "code": "U001",
//        "message": "사용자를 찾을 수 없습니다."
//        }
//
//// 실패 - 입력값 오류 (@Valid)
//        {
//        "success": false,
//        "data": null,
//        "code": "C001",
//        "message": "이메일을 입력해주세요, 비밀번호는 8자 이상이어야 합니다."
//        }