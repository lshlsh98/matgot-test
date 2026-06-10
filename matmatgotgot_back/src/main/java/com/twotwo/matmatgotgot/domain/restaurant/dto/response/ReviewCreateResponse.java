package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewCreateResponse {

    private boolean success;
    private Long reviewNo;
}
