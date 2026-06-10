package com.twotwo.matmatgotgot.domain.trip.dto.request;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@Alias(value = "tripUpdateDTO")
public class TripUpdateDTO {
    private Long tplanNo;
    private String tplanTitle;
    private String tplanDesc;
    private String tplanRegion;
    private int tplanDays;
    private int tplanTotalPrice;
    private List<Integer> tagNos;
    private List<DayDataDto> days;

    @Data
    public static class DayDataDto {
        private int day;
        private List<ScheduleDto> schedules;
    }

    @Data
    public static class ScheduleDto {
        private int tscheDayNo;
        private int tscheOrderNo;
        private Long restNo;
        private List<Long> selectedMenuNos;
        private RouteDto route;
    }

    @Data
    public static class RouteDto {
        private String transitType;
    }
}