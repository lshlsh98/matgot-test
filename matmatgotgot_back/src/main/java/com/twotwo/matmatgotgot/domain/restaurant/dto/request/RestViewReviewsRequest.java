package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class RestViewReviewsRequest {

    private Long restNo;
    private int page;
    private int size;

    public int getOffset() {
        return page * size;
    }
}
