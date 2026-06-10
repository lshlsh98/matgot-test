package com.twotwo.matmatgotgot.domain.receiptocr.dto;

import lombok.Builder;
import lombok.Getter;

// 메뉴 단일 항목
@Getter
@Builder
public class MenuItem {

    private final String name;  // 메뉴 이름
    private final String price; // 메뉴 가격 (문자열, 예: "12,000")
}