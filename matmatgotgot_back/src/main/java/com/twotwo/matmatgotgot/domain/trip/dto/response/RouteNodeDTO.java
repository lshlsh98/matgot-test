package com.twotwo.matmatgotgot.domain.trip.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Alias(value="routeNodeDTO")
public class RouteNodeDTO {
    private Long tscheNo;
    private int tscheOrderNo;
    private Long restNo;
    private String restName;
    private double lat;
    private double lng;
    private String transitType;
    private List<MenuDTO> selectedMenus;
}
