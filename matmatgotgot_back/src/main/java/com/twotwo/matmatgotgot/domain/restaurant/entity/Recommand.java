package com.twotwo.matmatgotgot.domain.restaurant.entity;

import lombok.Data;
import org.apache.ibatis.type.Alias;

@Data
@Alias("recommand")
public class Recommand {

    private Long restNo;
    private String restName;
    private String restThumb;
    private String restAddr;
    private String category;
    private Integer ratingAvg;
    private Boolean isLike;
    private Integer reviewTotalCount;
}
