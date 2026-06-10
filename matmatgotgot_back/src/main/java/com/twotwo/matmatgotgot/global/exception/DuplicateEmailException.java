package com.twotwo.matmatgotgot.global.exception;

import com.twotwo.matmatgotgot.global.exception.BusinessException;
import com.twotwo.matmatgotgot.global.exception.ErrorCode;

public class DuplicateEmailException extends BusinessException {
    public DuplicateEmailException() {
        super(ErrorCode.DUPLICATE_EMAIL);
    }
}
