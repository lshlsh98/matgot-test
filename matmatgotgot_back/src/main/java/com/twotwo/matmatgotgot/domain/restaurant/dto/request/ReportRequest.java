package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class ReportRequest {

    private String type;
    private String memberId;
    private Long no;
    private String reason;
    private String detail;
}
