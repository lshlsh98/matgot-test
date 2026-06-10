package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class RestCreateRequest {

    private Long restNo;
    private String restName;
    private String restAddr;
    private String restHours;
    private String restPhone;
    private String category;
    private String content;
    private Double lat; // 위도
    private Double lng; // 경도
}
