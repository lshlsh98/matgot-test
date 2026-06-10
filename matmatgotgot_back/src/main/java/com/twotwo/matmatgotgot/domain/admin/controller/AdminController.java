package com.twotwo.matmatgotgot.domain.admin.controller;

import com.twotwo.matmatgotgot.domain.admin.entity.AdminListItem;
import com.twotwo.matmatgotgot.domain.admin.entity.AdminProcessRequest;
import com.twotwo.matmatgotgot.domain.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/members")
    public ResponseEntity<?> selectMemberList(@ModelAttribute AdminListItem item) {
        return ResponseEntity.ok(adminService.selectMemberList(item));
    }

    @GetMapping("/reports")
    public ResponseEntity<?> selectReportList(@ModelAttribute AdminListItem item) {
        return ResponseEntity.ok(adminService.selectReportList(item));
    }

    @PatchMapping("/reports/{target}/{reportNo}/process")
    public ResponseEntity<?> processReport(
            @PathVariable String target,
            @PathVariable Long reportNo,
            @RequestBody AdminProcessRequest request
    ) {
        return ResponseEntity.ok(
                adminService.processReport(target, reportNo, request)
        );
    }

    @PatchMapping("/reports/{target}/{reportNo}/reject")
    public ResponseEntity<?> rejectReport(
            @PathVariable String target,
            @PathVariable Long reportNo
    ) {
        return ResponseEntity.ok(
                adminService.rejectReport(target, reportNo)
        );
    }

    @PatchMapping("/members/{memberNo}/status")
    public ResponseEntity<?> updateMemberStatus(
            @PathVariable Long memberNo,
            @RequestBody Map<String, Integer> body
    ) {
        return ResponseEntity.ok(
                adminService.updateMemberStatus(
                        memberNo,
                        body.get("memberStatus")
                )
        );
    }

    @PatchMapping("/members/{memberNo}/admin")
    public ResponseEntity<?> updateMemberAdmin(
            @PathVariable Long memberNo,
            @RequestBody Map<String, Integer> body
    ) {
        return ResponseEntity.ok(
                adminService.updateMemberAdmin(
                        memberNo,
                        body.get("admin")
                )
        );
    }
}