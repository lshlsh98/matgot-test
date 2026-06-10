package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import com.twotwo.matmatgotgot.domain.restaurant.entity.Restaurant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="restaurantResponseDTO")
public class RestaurantResponseDTO {
    private Long restNo;
    private String title;
    private String imgName;
    private String desc;
    private String restAddr;
    private Double lat;
    private Double lng;
    private String category;
    private Integer reviewTotalCount;

    public RestaurantResponseDTO(Restaurant entity) {
        this.restNo = entity.getRestNo();
        this.title = entity.getRestName();
        this.imgName = entity.getRestThumb() != null ? entity.getRestThumb() : "basic.jpeg";
        this.desc = entity.getRestContent();
        this.restAddr = entity.getRestAddr();
        this.lat = entity.getLat();
        this.lng = entity.getLng();
        this.category = entity.getCategory();
        this.reviewTotalCount = entity.getReviewTotalCount();
    }
}
