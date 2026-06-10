package com.twotwo.matmatgotgot.domain.receiptocr.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

// 공통 API 응답 래퍼
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OCRApiResponse {

    private final boolean success;  // 처리 성공 여부
    private final String message;   // 응답 메시지
    private final ReceiptData data; // 실제 데이터 (실패 시 null)

    public static OCRApiResponse ok(ReceiptData data) {
        return OCRApiResponse.builder()
                .success(true)
                .message("영수증 분석이 완료되었습니다.")
                .data(data)
                .build();
    }

    public static OCRApiResponse fail(String message) {
        return OCRApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
