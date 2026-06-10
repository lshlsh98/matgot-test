package com.twotwo.matmatgotgot.domain.trip.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MenuInsertRequest {
    private Long restNo;
    private String menuName;
    private Integer menuPrice;
    private String menuImg;
}