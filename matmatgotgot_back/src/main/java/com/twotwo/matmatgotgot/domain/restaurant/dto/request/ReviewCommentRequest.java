package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;

@Data
public class ReviewCommentRequest {

    private Long commentNo;
    private String memberId;
    private String content;
    private int depth;  // 0: 댓글, 1: 대댓글
    private Long parentComment; // 대댓글인 경우 부모 댓글 번호 (댓글이면 null)
}
