package com.twotwo.matmatgotgot.domain.trip.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class TripCreateRequestDTO {
    private int memberNo;
    private String tplanTitle;
    private String tplanDesc;
    private String tplanRegion;
    private int tplanDays;
    private int tplanTotalPrice;
    private List<Integer> tagNos; // PLAN_TAG_TBL에 저장될 태그 번호들
    private List<DayData> days;   // 일차별 일정 리스트

    @Data
    public static class DayData {
        private int day;
        private List<ScheduleData> schedules;
    }

    @Data
    public static class ScheduleData {
        private int tscheDayNo;
        private int tscheOrderNo;
        private Long restNo;
        private List<Long> selectedMenuNos; // RECOMMEND_MENU_TBL에 저장될 메뉴 번호들
        private RouteData route;            // 다음 식당으로의 이동 정보 (마지막 식당이면 null)

        // MyBatis insert 후 발급된 tsche_no를 담아두기 위한 필드 (DB 저장용 인터널 필드)
        private Long generatedTscheNo;
    }

    @Data
    public static class RouteData {
        private String transitType; // 'WALK', 'PUB', 'CAR'
    }
}
