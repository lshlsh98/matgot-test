package com.twotwo.matmatgotgot.domain.admin.service;

import com.twotwo.matmatgotgot.domain.admin.entity.AdminListItem;
import com.twotwo.matmatgotgot.domain.admin.entity.AdminListResponse;
import com.twotwo.matmatgotgot.domain.admin.entity.AdminProcessRequest;
import com.twotwo.matmatgotgot.domain.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminMapper adminMapper;

    public AdminListResponse selectMemberList(AdminListItem item) {
        paging(item);

        Integer totalCount = adminMapper.selectMemberCount(item);
        Integer totalPage = (int) Math.ceil(totalCount / (double) item.getSize());

        List<Map<String, Object>> list = adminMapper.selectMemberList(item);

        return new AdminListResponse(list, totalPage);
    }

    public AdminListResponse selectReportList(AdminListItem item) {
        paging(item);

        if (item.getTarget() == null || item.getTarget().isBlank()) {
            item.setTarget("board");
        }

        Integer totalCount;
        List<Map<String, Object>> list;

        switch (item.getTarget()) {
            case "rest" -> {
                totalCount = adminMapper.selectRestReportCount(item);
                list = adminMapper.selectRestReportList(item);
            }
            case "review" -> {
                totalCount = adminMapper.selectReviewReportCount(item);
                list = adminMapper.selectReviewReportList(item);
            }
            case "reviewComment" -> {
                totalCount = adminMapper.selectReviewCommentReportCount(item);
                list = adminMapper.selectReviewCommentReportList(item);
            }
            case "boardComment" -> {
                totalCount = adminMapper.selectBoardCommentReportCount(item);
                list = adminMapper.selectBoardCommentReportList(item);
            }
            default -> {
                totalCount = adminMapper.selectBoardReportCount(item);
                list = adminMapper.selectBoardReportList(item);
            }
        }

        Integer totalPage = (int) Math.ceil(totalCount / (double) item.getSize());

        return new AdminListResponse(list, totalPage);
    }

    @Transactional
    public int processReport(String target, Long reportNo, AdminProcessRequest request) {
        Integer numberStatus = getNumberStatus(request.getAction());
        String restStatus = getRestStatus(request.getAction());

        int result;

        switch (target) {
            case "rest" -> {
                adminMapper.updateRestContentStatus(request.getContentNo(), restStatus);
                result = adminMapper.updateRestReportStatus(reportNo, 1);
            }
            case "review" -> {
                adminMapper.updateReviewContentStatus(request.getContentNo(), getReviewStatus(request.getAction()));
                result = adminMapper.updateReviewReportStatus(reportNo, 1);
            }
            case "reviewComment" -> {
                adminMapper.updateReviewCommentContentStatus(request.getContentNo(), getReviewStatus(request.getAction()));
                result = adminMapper.updateReviewCommentReportStatus(reportNo, 1);
            }
            case "boardComment" -> {
                adminMapper.updateBoardCommentContentStatus(request.getContentNo(), numberStatus);
                result = adminMapper.updateBoardCommentReportStatus(reportNo, 1);
            }
            default -> {
                adminMapper.updateBoardContentStatus(request.getContentNo(), numberStatus);
                result = adminMapper.updateBoardReportStatus(reportNo, 1);
            }
        }

        return result;
    }

    @Transactional
    public int rejectReport(String target, Long reportNo) {
        return switch (target) {
            case "rest" -> adminMapper.updateRestReportStatus(reportNo, 2);
            case "review" -> adminMapper.updateReviewReportStatus(reportNo, 2);
            case "reviewComment" -> adminMapper.updateReviewCommentReportStatus(reportNo, 2);
            case "boardComment" -> adminMapper.updateBoardCommentReportStatus(reportNo, 2);
            default -> adminMapper.updateBoardReportStatus(reportNo, 2);
        };
    }

    private void paging(AdminListItem item) {
        if (item.getPage() == null || item.getPage() < 0) {
            item.setPage(0);
        }

        if (item.getSize() == null || item.getSize() < 1) {
            item.setSize(5);
        }

        item.setOffset(item.getPage() * item.getSize());
    }

    private Integer getNumberStatus(String action) {
        if ("private".equals(action)) {
            return 0;
        }

        if ("delete".equals(action)) {
            return 2;
        }

        return 1;
    }

    //추가 - 관리자 신고 관리(지연)
    private Integer getReviewStatus(String action) {
        if ("private".equals(action)) {
            return 1;
        }

        if ("delete".equals(action)) {
            return 2;
        }

        return 0;
    }

    private String getRestStatus(String action) {
        if ("private".equals(action)) {
            return "HIDDEN";
        }

        if ("delete".equals(action)) {
            return "DELETED";
        }

        return "NORMAL";
    }

    @Transactional
    public int updateMemberStatus(Long memberNo, Integer memberStatus) {
        return adminMapper.updateMemberStatus(memberNo, memberStatus);
    }

    @Transactional
    public int updateMemberAdmin(Long memberNo, Integer admin) {
        return adminMapper.updateMemberAdmin(memberNo, admin);
    }
}