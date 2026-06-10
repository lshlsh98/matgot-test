package com.twotwo.matmatgotgot.domain.restaurant.controller;

import com.twotwo.matmatgotgot.domain.restaurant.dto.request.*;
import com.twotwo.matmatgotgot.domain.restaurant.dto.response.*;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Coords;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Recommand;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Restaurant;
import com.twotwo.matmatgotgot.domain.restaurant.service.RestaurantService;
import com.twotwo.matmatgotgot.global.util.FileUtil;
import com.twotwo.matmatgotgot.global.util.S3FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
// [수정] @Value("${file.root}") 제거 → S3 업로드는 FileUtil 내부에서 처리하므로 불필요
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

// [수정] java.io.File 제거 → S3 업로드로 전환되어 로컬 File 객체 불필요
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/restaurants")
public class RestaurantController {

    // file.root 필드 제거 → S3 업로드는 FileUtil 내부에서 버킷/경로를 직접 관리
    private final RestaurantService restaurantService;
    private final S3FileUtil fileUtil;

    // 맛집 등록
    @PostMapping
    public ResponseEntity<?> restaurantCreate(@RequestBody RestCreateRequest request, Authentication auth) {
        Restaurant restaurant = Restaurant.builder()
                .restName(request.getRestName())
                .restAddr(request.getRestAddr())
                .hours(request.getRestHours())
                .phone(request.getRestPhone())
                .category(request.getCategory())
                .restContent(request.getContent())
                .lat(request.getLat())
                .lng(request.getLng())
                .memberId(auth.getName())
                .build();

        Document doc = Jsoup.parse(request.getContent());
        // 이미지 태그 선택자로 첫 번째 요소를 가져옴
        // 단, 이미지 태그가 한 개도 없으면 null 리턴
        Element firstImg = doc.selectFirst("img");
        String restThumb = firstImg == null ? null : firstImg.attr("src");
        restaurant.setRestThumb(restThumb);

        int result = restaurantService.restaurantCreate(restaurant);
        if (result == 1) {
            return ResponseEntity.ok(restaurant.getRestNo());
        }

        return ResponseEntity.ok(-1);
    }//

    // 맛집 수정
    @PutMapping("/modify")
    public ResponseEntity<?> restaurantModify(@RequestBody RestCreateRequest request, Authentication auth) {
        Restaurant restaurant = Restaurant.builder()
                .restNo(request.getRestNo())
                .restName(request.getRestName())
                .restAddr(request.getRestAddr())
                .hours(request.getRestHours())
                .phone(request.getRestPhone())
                .category(request.getCategory())
                .restContent(request.getContent())
                .lat(request.getLat())
                .lng(request.getLng())
                .memberId(auth.getName())
                .build();

        Document doc = Jsoup.parse(request.getContent());
        // 이미지 태그 선택자로 첫 번째 요소를 가져옴
        // 단, 이미지 태그가 한 개도 없으면 null 리턴
        Element firstImg = doc.selectFirst("img");
        String restThumb = firstImg == null ? null : firstImg.attr("src");
        restaurant.setRestThumb(restThumb);

        int result = restaurantService.restaurantModify(restaurant);

        return ResponseEntity.ok(result);
    }//

    // 리뷰 수정
    @PutMapping("/review/modify")
    public ResponseEntity<?> reviewModify(@ModelAttribute ReviewCreateRequest req) {
        try {
            int result = restaurantService.reviewModify(req);
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }//

    // TipTap 에디터 이미지 업로드
    // S3 "restaurant" 폴더에 업로드 후 S3 퍼블릭 URL 전체 반환
    //          → TipTap 에디터는 반환된 URL을 <img src> 에 바로 삽입
    @PostMapping(value = "/image-upload")
    public ResponseEntity<?> imageUpload(@RequestParam MultipartFile image) {
        // 로컬 경로 대신 S3 폴더명("restaurant")을 인자로 전달
        String s3Url = fileUtil.upload("restaurant", image);
        return ResponseEntity.ok(s3Url);
    }//

    @DeleteMapping("/images")
    public void imageDelete(@RequestBody List<String> deletedUrls) {
        for (String url : deletedUrls) {
            fileUtil.deleteFile(url);
        }
    }//

    //
    @GetMapping
    public ResponseEntity<?> restaurantViewInfo(@RequestParam Long restNo, Authentication auth) {
        RestViewResponse restRes = restaurantService.restaurantViewInfo(auth.getName(), restNo);

        // 신고 기능 - 지연
        if (restRes == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("비공개 또는 삭제된 맛집입니다.");
        }
        //

        return ResponseEntity.ok(restRes);
    }//

    @GetMapping("/reviews")
    public ResponseEntity<?> restaurantViewReviews(@ModelAttribute RestViewReviewsRequest request) {
        List<RestReviewsResponse> reviewResList = restaurantService.restaurantViewReviews(request);

        int count = restaurantService.restaurantViewReviewsCnt(request);
        int totalPage = (int) Math.ceil(count / (double) request.getSize());

        Map<String, Object> res = new HashMap<>();
        res.put("list", reviewResList);
        res.put("reviewsCnt", count);
        res.put("totalPage", totalPage);

        return ResponseEntity.ok(res);
    }//

    // 리뷰 등록
    @PostMapping("/review")
    public ResponseEntity<?> reviewCreate(@ModelAttribute ReviewCreateRequest request, Authentication auth) {
        request.setMemberId(auth.getName());
        try {
            boolean result = restaurantService.reviewCreate(request);

            return ResponseEntity.ok(ReviewCreateResponse.builder()
                    .success(result)
                    .reviewNo(request.getReviewNo())
                    .build());

        } catch (RuntimeException e) {
            log.info("error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(false);
        }
    }//

    @GetMapping("/review")
    public ResponseEntity<?> getReviewView(@RequestParam Long reviewNo, Authentication auth) {
        ReviewViewResponse res = restaurantService.getReviewView(reviewNo, auth.getName());

        if (res == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("비공개 또는 삭제된 리뷰입니다.");
        }

        return ResponseEntity.ok(res);
    }//

    // 댓글/대댓글 목록 조회
    @GetMapping("/review/{reviewNo}/comments")
    public ResponseEntity<?> commentList(@PathVariable Long reviewNo) {
        List<ReviewCommentResponse> list = restaurantService.commentList(reviewNo);
        return ResponseEntity.ok(list);
    }//

    // 댓글/대댓글 등록
    @PostMapping("/review/{reviewNo}/comments")
    public ResponseEntity<?> commentRegist(@PathVariable Long reviewNo,
                                           @RequestBody ReviewCommentRequest request,
                                           Authentication auth) {
        request.setMemberId(auth.getName());
        ReviewCommentResponse saved = restaurantService.commentRegist(reviewNo, request);
        return ResponseEntity.ok(saved);
    }//

    // 댓글/대댓글 수정
    @PatchMapping("/review/comment/{commentNo}")
    public ResponseEntity<?> commentUpdate(@PathVariable Long commentNo,
                                           @RequestBody ReviewCommentUpdateRequest request) {
        restaurantService.commentUpdate(commentNo, request.getContent());
        return ResponseEntity.ok().build();
    }//

    // 댓글/대댓글 삭제
    @DeleteMapping("/review/comment/{commentNo}")
    public ResponseEntity<?> commentDelete(@PathVariable Long commentNo) {
        restaurantService.commentDelete(commentNo);
        return ResponseEntity.ok().build();
    }//

    // 맛집 메인화면 인기
    @GetMapping("/popular")
    public ResponseEntity<?> getPopular(Authentication auth) {
        List<Recommand> popular = restaurantService.getPopular(auth.getName());

        return ResponseEntity.ok(popular);
    }//

    // 맛집 메인화면 찜
    @GetMapping("/like")
    public ResponseEntity<?> getLike(Authentication auth) {
        List<Recommand> like = restaurantService.getLike(auth.getName());

        return ResponseEntity.ok(like);
    }//

    // 맛집 메인화면 근처
    @GetMapping("/region")
    public ResponseEntity<?> getRegionList(@ModelAttribute Coords coords, Authentication auth) {
        List<Recommand> region = restaurantService.getRegion(auth.getName(), coords);

        return ResponseEntity.ok(region);
    }//

    // 맛집 메인 - 메인리스트
    @GetMapping("/main")
    public ResponseEntity<?> getMainList(@ModelAttribute MainListRequest req, Authentication auth) {
        List<Recommand> mainList = restaurantService.getMainList(req, auth.getName());

        int count = restaurantService.getMainListCount(req, auth.getName());
        int totalPage = (int) Math.ceil(count / (double) req.getSize());

        Map<String, Object> res = new HashMap<>();
        res.put("list", mainList);
        res.put("totalPage", totalPage);

        return ResponseEntity.ok(res);
    }//

    // 맛집 - 이름 검색
    @GetMapping("/search")
    public ResponseEntity<?> restSearch(@ModelAttribute SearchRequest req, Authentication auth){
        List<Recommand> searchList = restaurantService.getRestSearch(req, auth.getName());

        int count = restaurantService.getRestSearchCount(req, auth.getName());
        int totalPage = (int) Math.ceil(count / (double) req.getSize());

        Map<String, Object> res = new HashMap<>();
        res.put("list", searchList);
        res.put("totalPage", totalPage);

        return ResponseEntity.ok(res);
    }//

    // 맛집 등록 중복 확인
    @GetMapping("/isdup")
    public ResponseEntity<?> isDup(@ModelAttribute CheckDuplicationRequest chk) {
        CheckDuplicationResponse res = restaurantService.isDup(chk);

        return ResponseEntity.ok(res);
    }//

    // 리뷰할 맛집 존재 확인
    @GetMapping("/isexist")
    public ResponseEntity<?> isExist(@ModelAttribute CheckDuplicationRequest chk) {
        CheckDuplicationResponse res = restaurantService.isDup(chk);

        if (res.isDuplicate()) {
            if (Objects.equals(chk.getRestNo(), res.getRestNo())) {
                // 영수증 storeName, lat, lng 로 찾은 restNo 와 리뷰등록버튼을 눌렀을 때 넘긴 restNo이 같으면 리뷰 등록 가능
                return ResponseEntity.ok(true);
            }
        }

        // 영수증 정보랑 리뷰등록버튼 눌렀을 때 넘긴 restNo이 다르면 리뷰 등록 불가
        return ResponseEntity.ok(false);
    }//

    // 신고
    @PostMapping("/report")
    public ResponseEntity<?> report(@RequestBody ReportRequest report, Authentication auth) {
        report.setMemberId(auth.getName());
        try {
            int result = restaurantService.report(report);
            return ResponseEntity.ok(result);

        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest()
                    .body("이미 신고한 맛집입니다.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("신고 처리 중 오류가 발생했습니다.");
        }
    }//

    // 리뷰 like
    @PatchMapping("/review/like")
    public ResponseEntity<?> reviewLike(@RequestParam Long reviewNo, Authentication auth) {
        int result = restaurantService.reviewLike(reviewNo, auth.getName());

        return ResponseEntity.ok(result);
    }//

    // 리뷰 unlike
    @DeleteMapping("/review/unlike")
    public ResponseEntity<?> reviewUnlike(@RequestParam Long reviewNo, Authentication auth) {
        int result = restaurantService.reviewUnlike(reviewNo, auth.getName());

        return ResponseEntity.ok(result);
    }//

    // 맛집 like
    @PatchMapping("/rest/like")
    public ResponseEntity<?> restLike(@RequestParam Long restNo, Authentication auth) {
        int result = restaurantService.restLike(restNo, auth.getName());

        return ResponseEntity.ok(result);
    }//

    // 맛집 unlike
    @DeleteMapping("/rest/unlike")
    public ResponseEntity<?> restUnlike(@RequestParam Long restNo, Authentication auth) {
        int result = restaurantService.restUnlike(restNo, auth.getName());

        return ResponseEntity.ok(result);
    }//

    // 리뷰 제거
    @DeleteMapping("/review/{reviewNo}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewNo) {
        int result = restaurantService.deleteReview(reviewNo);

        return ResponseEntity.ok(result);
    }//

    // 맛집 제거
    @DeleteMapping("rest/{restNo}")
    public ResponseEntity<?> deleteRest(@PathVariable Long restNo) {
        int result = restaurantService.deleteRest(restNo);

        return ResponseEntity.ok(result);
    }//



}
