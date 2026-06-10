package com.twotwo.matmatgotgot.domain.trip.controller;

import com.twotwo.matmatgotgot.domain.trip.dto.request.*;
import com.twotwo.matmatgotgot.domain.trip.dto.response.*;
import com.twotwo.matmatgotgot.domain.trip.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/trips")
public class TripController {
    private final TripService tripService;

    @GetMapping("/main")
    public ResponseEntity<Map<String, List<TripCourseResponse>>> getTripMain(
            @RequestParam(value = "memberNo", required = false) Long memberNo) {

        Map<String, List<TripCourseResponse>> data = tripService.getTripMainData(memberNo);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/create/search")
    public ResponseEntity<?> searchRestaurants(@RequestParam("keyword") String keyword) {
        List<RestaurantDTO> list = tripService.searchRestaurants(keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/create/tags")
    public ResponseEntity<?> selectTags() {
        List<TagDTO> list = tripService.selectTags();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/create/menus")
    public ResponseEntity<?> selectMenus(@RequestParam("restNo") Long restNo) {
        List<MenuDTO> list = tripService.selectMenus(restNo);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/create/menu")
    public ResponseEntity<?> insertMenu(
            @RequestParam Long restNo,
            @RequestParam String menuName,
            @RequestParam Integer menuPrice,
            @RequestPart(required = false)
            MultipartFile image
    ) throws Exception {
        tripService.insertMenu(
                restNo,
                menuName,
                menuPrice,
                image
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/create")
    public ResponseEntity<String> createTripCourse(@RequestBody TripCreateRequestDTO requestDTO) {
        try {
            tripService.createTripCourse(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("코스가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("코스 등록 중 서버 에러가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/detail/{tplanNo}")
    public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable Long tplanNo) {
        CourseDetailResponse detail = tripService.getCourseDetail(tplanNo);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/favorite/toggle")
    public ResponseEntity<Boolean> toggleFavorite(@RequestBody FavoriteRequest req) {
        boolean result = tripService.toggleFavorite(req);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/favorite/check")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(@ModelAttribute FavoriteRequest req) {

        boolean isFavorite = tripService.isFavoritePlan(req);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/favorite/count")
    public ResponseEntity<Integer> updateFavoriteCount(@RequestBody FavoriteCountRequest req) {
        int updatedCount = tripService.updateFavoriteCount(req.getTplanNo(), req.getAction());
        return ResponseEntity.ok(updatedCount);
    }

    @PutMapping("/edit/{tplanNo}")
    public ResponseEntity<?> updateCourse(
            @PathVariable("tplanNo") Long tplanNo,
            @RequestBody TripUpdateDTO updateDto) {
        System.out.println(updateDto);
        updateDto.setTplanNo(tplanNo);

        try {
            tripService.updateCourse(updateDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("코스 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/my-unfinished")
    public ResponseEntity<List<MyUnfinishedCourseDTO>> getMyUnfinishedCourses(@RequestParam Long memberNo) {
        List<MyUnfinishedCourseDTO> list = tripService.getMyUnfinishedCourses(memberNo);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{tplanNo}")
    public ResponseEntity<String> deleteTripPlan(
            @PathVariable("tplanNo") Long tplanNo,
            @RequestParam("memberNo") Long memberNo) {
        try {
            boolean isDeleted = tripService.removeTripPlan(tplanNo, memberNo);
            if (isDeleted) {
                return ResponseEntity.ok("코스가 정상적으로 삭제되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 처리에 실패했습니다.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }
}
