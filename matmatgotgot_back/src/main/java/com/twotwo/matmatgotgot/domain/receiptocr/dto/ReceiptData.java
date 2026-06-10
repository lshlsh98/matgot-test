package com.twotwo.matmatgotgot.domain.receiptocr.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

// 영수증 파싱 결과
@Getter

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReceiptData {

    private final String storeName;         // 가게명
    private final String address;           // 주소
    private final String date;              // 날짜 (예: 2024-01-15)
    private final List<MenuItem> menuItems; // 메뉴 항목 목록


}
