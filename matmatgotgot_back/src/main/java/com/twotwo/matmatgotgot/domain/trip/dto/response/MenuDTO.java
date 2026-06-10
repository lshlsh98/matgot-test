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
@Alias(value="menuDTO")
public class MenuDTO {
    private Long menuNo;
    private Long restNo;
    private String name;
    private Integer price;
    private String imagePreview;
}
