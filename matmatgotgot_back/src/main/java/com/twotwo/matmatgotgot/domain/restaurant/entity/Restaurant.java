package com.twotwo.matmatgotgot.domain.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="restaurant")
public class Restaurant {

    private Long restNo;
    private String memberId;
    private String restName;
    private String restAddr;
    private Double lat; // 위도
    private Double lng; // 경도
    private String category;
    private String phone;
    private String hours;
    private Integer ratingSum;
    private Integer reviewTotalCount;
    private Integer localReviewCount;
    private String restContent;
    private String aiReview;
    private String restStatus;  // NORMAL, HIDDEN
    private String restThumb;
    private String createdAt;
}


