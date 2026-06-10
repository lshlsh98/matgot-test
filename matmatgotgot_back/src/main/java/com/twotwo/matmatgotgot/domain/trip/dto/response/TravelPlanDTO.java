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
@Alias(value="travelPlanDTO")
public class TravelPlanDTO {
    private Long tplanNo;
    private Long memberNo;
    private String tplanTitle;
    private String tplanDesc;
    private String tplanRegion;
    private int tplanDays;
    private int tplanTotalPrice;
}
