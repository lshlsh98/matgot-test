package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="restaurantMapMarkerDTO")
public class RestaurantMapMarkerDTO {
    private Long restNo;
    private String restName;
    private Double restLat; // 위도 (Y축)
    private Double restLng; // 경도 (X축)
}
