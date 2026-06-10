package com.twotwo.matmatgotgot.domain.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="mainBestReviewDTO")
public class MainBestReviewDTO {
    private Long boardNo;
    private Long memberNo;
    private Integer boardCategory;
    private String boardTitle;
    private String boardThumb;
    private Integer likeCount;
}
