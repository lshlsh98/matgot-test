package com.twotwo.matmatgotgot.domain.board.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;
import org.springframework.data.relational.core.mapping.Column;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("board")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Board {
    private Integer boardNo;
    private Long memberNo;
    private Integer boardCategory; //카테고리(1:여행후기, 2:자유게시글)
    private String boardTitle;
    private String boardContent;
    private String boardDate;
    private Integer boardStatus;   //게시글 상태(0:관리자 비공개/1:공개/2:삭제)
    private String boardThumb;
    private Integer placeNo;       //장소 번호
    private Integer boardView;
    private Integer boardLike;
    private Integer boardComment;

    //-- 목록/상세보기 조회용 --
    private String memberThumb;    //회원 프로필
    private String boardWriter; //화면에 보여줄 작성자 닉네임/아이디용 변수
    private String placeName; //장소명
    private String addressName;

    private Integer reportStatus;

    private Double placeLat;
    private Double placeLng;
}
