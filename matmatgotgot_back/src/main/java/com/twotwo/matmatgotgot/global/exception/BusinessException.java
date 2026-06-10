package com.twotwo.matmatgotgot.global.exception;

import lombok.Getter;

//공통 예외 기반 클래스
// 모든 도메인 예외가 이 클래스를 상속
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
