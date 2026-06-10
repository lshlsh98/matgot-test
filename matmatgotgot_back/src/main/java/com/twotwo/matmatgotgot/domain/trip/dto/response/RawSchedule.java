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
@Alias(value="rawSchedule")
public class RawSchedule {
    private Long tscheNo;
    private int tscheDayNo;
    private int tscheOrderNo;
    private Long restNo;
    private String restName;
    private double lat;
    private double lng;
}
