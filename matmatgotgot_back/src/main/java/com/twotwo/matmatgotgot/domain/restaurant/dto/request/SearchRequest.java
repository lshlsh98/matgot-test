package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class SearchRequest {

    private String restName;
    private Integer page;
    private Integer size;

    public int getOffset() {
        return page * size;
    }
}
