package com.twotwo.matmatgotgot.domain.restaurant.dto.response;

import lombok.Data;
import org.apache.ibatis.type.Alias;

@Data
@Alias("reviewCommentResponse")
public class ReviewCommentResponse {

    private Long commentNo;
    private String memberId;
    private String writerName;
    private String memberThumb;
    private String content;
    private String createdAt;
    private int depth;  // 0: 댓글, 1: 대댓글
    private Long parentComment; // 대댓글인 경우 부모 댓글 번호 (댓글이면 null)
}
