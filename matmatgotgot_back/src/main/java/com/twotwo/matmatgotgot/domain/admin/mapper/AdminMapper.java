package com.twotwo.matmatgotgot.domain.admin.mapper;

import com.twotwo.matmatgotgot.domain.admin.entity.AdminListItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminMapper {

    Integer selectMemberCount(AdminListItem item);

    List<Map<String, Object>> selectMemberList(AdminListItem item);

    Integer selectBoardReportCount(AdminListItem item);

    List<Map<String, Object>> selectBoardReportList(AdminListItem item);

    Integer selectBoardCommentReportCount(AdminListItem item);

    List<Map<String, Object>> selectBoardCommentReportList(AdminListItem item);

    Integer selectRestReportCount(AdminListItem item);

    List<Map<String, Object>> selectRestReportList(AdminListItem item);

    Integer selectReviewReportCount(AdminListItem item);

    List<Map<String, Object>> selectReviewReportList(AdminListItem item);

    Integer selectReviewCommentReportCount(AdminListItem item);

    List<Map<String, Object>> selectReviewCommentReportList(AdminListItem item);

    int updateBoardContentStatus(@Param("contentNo") Long contentNo, @Param("status") Integer status);

    int updateBoardCommentContentStatus(@Param("contentNo") Long contentNo, @Param("status") Integer status);

    int updateRestContentStatus(@Param("contentNo") Long contentNo, @Param("status") String status);

    int updateReviewContentStatus(@Param("contentNo") Long contentNo, @Param("status") Integer status);

    int updateReviewCommentContentStatus(@Param("contentNo") Long contentNo, @Param("status") Integer status);

    int updateBoardReportStatus(@Param("reportNo") Long reportNo, @Param("reportStatus") Integer reportStatus);

    int updateBoardCommentReportStatus(@Param("reportNo") Long reportNo, @Param("reportStatus") Integer reportStatus);

    int updateRestReportStatus(@Param("reportNo") Long reportNo, @Param("reportStatus") Integer reportStatus);

    int updateReviewReportStatus(@Param("reportNo") Long reportNo, @Param("reportStatus") Integer reportStatus);

    int updateReviewCommentReportStatus(@Param("reportNo") Long reportNo, @Param("reportStatus") Integer reportStatus);

    int updateMemberStatus(@Param("memberNo") Long memberNo, @Param("memberStatus") Integer memberStatus);

    int updateMemberAdmin(@Param("memberNo") Long memberNo, @Param("admin") Integer admin);

}