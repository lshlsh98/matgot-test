package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckDuplicationResponse {

    private boolean duplicate;
    private Long restNo;
}
