package com.twotwo.matmatgotgot.domain.board.mapper;

import com.twotwo.matmatgotgot.domain.board.entity.Board;
import com.twotwo.matmatgotgot.domain.board.entity.BoardComment;
import com.twotwo.matmatgotgot.domain.board.entity.ListItem;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface BoardMapper {

    Integer selectBoardCount(ListItem request);

    List<Board> selectBoardList(ListItem request);

    int getNewBoardNo();

    int updateBoard(Board board);

    int deleteBoard(Integer boardNo);
    
    int insertBoard(Board board);

    Board selectOneBoard(Integer boardNo);

    Integer selectPlaceNo(Board board);

    int insertPlace(Board board);

    // 좋아요
    int selectLikeCount(Integer boardNo);

    int selectIsLike(Map<String, Object> params);

    int insertLike(Map<String, Object> map);

    int deleteLike(Map<String, Object> map);

    // 신고
    int selectReportCount(Integer boardNo);

    int selectIsReport(Map<String, Object> params);

    int insertReport(Map<String, Object> map);

    int deleteReport(Map<String, Object> map);

    Long selectMemberNo(String memberId);

    List<BoardComment> selectCommentList(
            Integer boardNo
    );

    int insertComment(
            BoardComment comment
    );

    BoardComment selectOneComment(
            Integer boardCommentNo
    );

    int updateComment(BoardComment comment);

    int updateBoardStatus(Board board);

    int updateCommentStatus(BoardComment comment);

    int deleteComment(Integer boardCommentNo);

    int insertCommentReport(Map<String, Object> map);

    int selectIsCommentReport(Map<String, Object> params);

    int deleteCommentReport(Map<String, Object> map);

    List<Board> selectMyBoardList(ListItem request, String memberNo);

    List<Board> selectMyBoardLikeList(ListItem request, String memberNo);

    List<Board> selectMyBoardReportList(ListItem request, String memberNo);
}