package com.twotwo.matmatgotgot.domain.board.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ListResponse {
    private List<Board> items;
    private Integer totalPage;
}

