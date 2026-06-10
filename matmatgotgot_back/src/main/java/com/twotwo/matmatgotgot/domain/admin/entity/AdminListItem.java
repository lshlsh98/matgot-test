package com.twotwo.matmatgotgot.domain.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("adminListItem")
public class AdminListItem {
    private Integer page;
    private Integer size;
    private Integer offset;

    private String keyword;
    private String searchKeyword;
    private Integer searchType;

    private String memberStatus;
    private String nameOrder;

    private String target;
    private Integer category;
    private Integer order;
    private String reportStatus;
}