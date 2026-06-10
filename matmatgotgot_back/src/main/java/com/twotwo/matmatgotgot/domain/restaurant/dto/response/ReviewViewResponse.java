package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@Alias("reviewViewResponse")
public class ReviewViewResponse {

    private Long restNo;
    private String memberId;
    private String restName;
    private String restAddr;
    private String memberThumb;
    private String memberName;
    private String reviewContent;
    private String reviewVisit;
    private Integer rating;
    private List<String> images;
    private List<String> reviewMenu;
    private List<String> tags;
    private boolean isLiked;
}
