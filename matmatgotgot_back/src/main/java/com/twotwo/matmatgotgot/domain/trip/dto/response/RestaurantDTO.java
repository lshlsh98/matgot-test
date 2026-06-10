package com.twotwo.matmatgotgot.domain.trip.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Alias(value="restaurantDTO")
public class RestaurantDTO {
    private Long restNo;
    private String restName;         // 맛집 이름
    private String restAddr;         // 주소
    private String category;         // 음식 카테고리
    private String phone;            // 전화번호
    private String restThumb;        // 썸네일 이미지 경로
    private float lat;
    private float lng;

    private int ratingSum;           // 별점 총합
    private int reviewTotalCount;    // 전체 리뷰 수

    public double getRatingAverage() {
        if (this.reviewTotalCount == 0) return 0.0;
        return Math.round((double) this.ratingSum / this.reviewTotalCount * 10) / 10.0;
    }
}
