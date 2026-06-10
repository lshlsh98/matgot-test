package com.twotwo.matmatgotgot.domain.trip.dto.request;

import lombok.Data;

@Data
public class FavoriteCountRequest {
    private Long tplanNo;
    private String action; // "INCREMENT" 또는 "DECREMENT"로 분기 처리
}
