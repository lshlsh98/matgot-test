package com.twotwo.matmatgotgot.domain.board.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("listItem")
public class ListItem {
    private Integer page;
    private Integer size;
    private Integer status;
    private Integer order;
    private Integer searchType;
    private String searchKeyword;
    private Integer category;
    private Integer offset;
}
