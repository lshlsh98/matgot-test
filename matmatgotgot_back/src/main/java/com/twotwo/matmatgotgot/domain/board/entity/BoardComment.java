package com.twotwo.matmatgotgot.domain.board.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("boardComment")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BoardComment {

    private Integer boardCommentNo;
    private String boardCommentContent;

    private Long memberNo;

    private Integer boardNo;
    private String boardCommentDate;

    private Integer commentStatus;

    private String memberThumb;

    private String boardCommentWriter;

}