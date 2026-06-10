package com.twotwo.matmatgotgot.domain.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminListResponse {
    private List<Map<String, Object>> items;
    private Integer totalPage;
}