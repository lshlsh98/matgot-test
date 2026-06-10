package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class MainListRequest {

    private String region;
    private String order;
    private String[] categories;
    private int page;
    private int size;

    public int getOffset() {
        return page * size;
    }

}
