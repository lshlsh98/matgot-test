package com.twotwo.matmatgotgot.domain.trip.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Alias(value="myUnfinishedCourseDTO")
public class MyUnfinishedCourseDTO {
    private Long tplanNo;
    private String tplanTitle;
    private int tplanDays;
    private int tplanTotalPrice;
    private int tplanView;
    private int restaurantCount; // 해당 플랜에 포함된 맛집 개수 산출용
    private LocalDateTime createdAt;
    private String formattedDate;
}
