package com.twotwo.matmatgotgot.domain.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AdminProcessRequest {
    private Long contentNo;
    private String action;
}