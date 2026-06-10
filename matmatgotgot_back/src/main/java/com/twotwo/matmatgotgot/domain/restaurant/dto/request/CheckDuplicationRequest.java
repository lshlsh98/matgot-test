package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class CheckDuplicationRequest {

    private String storeName;
    private Double lat;
    private Double lng;
    private Long restNo;
}
