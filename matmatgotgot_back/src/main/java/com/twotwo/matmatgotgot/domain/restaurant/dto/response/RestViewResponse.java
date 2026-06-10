package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@Alias("restViewResponse")
public class RestViewResponse {

    private String memberId;
    private Long restNo;
    private String restName;
    private String restAddr;
    private String category;
    private String aiReview;
    private String restContent;
    private Double lat;
    private Double lng;
    private String phone;
    private String hours;
    private Integer ratingSum;
    private Integer reviewTotalCount;
    private Double ratingAvg;
    private Boolean isLike;
    private Boolean isReport;
    private List<String> tags;
    private List<String> menus;
}
