package com.twotwo.matmatgotgot.global.exception;

import com.twotwo.matmatgotgot.global.exception.BusinessException;
import com.twotwo.matmatgotgot.global.exception.ErrorCode;

public class MemberNotFoundException extends BusinessException {
    public MemberNotFoundException() {
        super(ErrorCode.MEMBER_NOT_FOUND);
    }
}
