package com.twotwo.matmatgotgot.domain.trip.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Alias(value="courseDetailResponse")
public class CourseDetailResponse {
    private Long tplanNo;
    private Long memberNo;
    private String title;
    private String desc;
    private String region;
    private int tplanDays;
    private int tplanTotalPrice;
    private int tplanView;
    private int tplanLike;
    private List<String> tags;
    private Map<Integer, List<RouteNodeDTO>> dayRoutes;
}
