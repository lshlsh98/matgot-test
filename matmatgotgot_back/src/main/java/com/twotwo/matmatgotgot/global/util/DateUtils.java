package com.twotwo.matmatgotgot.global.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// 여러 레이어에서 공통으로 쓰는 날짜 유틸
public class DateUtils {

    private DateUtils() {}  // 인스턴스 생성 금지

    public static String format(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime.isBefore(LocalDateTime.now());
    }
}