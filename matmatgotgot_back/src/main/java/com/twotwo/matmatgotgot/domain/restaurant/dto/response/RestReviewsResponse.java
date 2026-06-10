package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@Alias("restReviewsResponse")
public class RestReviewsResponse {

    private Long reviewNo;
    private String writer;
    private String writerThumb;
    private Integer rating;
    private String reviewContent;
    private String visitDate;
    private List<String> menus;
}
