package com.twotwo.matmatgotgot.domain.restaurant.service;

import com.twotwo.matmatgotgot.domain.restaurant.dto.request.*;
import com.twotwo.matmatgotgot.domain.restaurant.dto.response.*;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Coords;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Recommand;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Restaurant;
import com.twotwo.matmatgotgot.domain.restaurant.mapper.RestaurantMapper;
import com.twotwo.matmatgotgot.global.util.FileUtil;
import com.twotwo.matmatgotgot.global.util.S3FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// [수정] @Value("${file.root}") 제거 → S3 경로 관리는 FileUtil 내부에서 처리
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

// [수정] java.io.File 제거 → S3 업로드 전환으로 로컬 File 객체 불필요
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantMapper restaurantMapper;
    private final S3FileUtil fileUtil;
    // [수정] file.root 필드 제거 → S3 폴더명은 FileUtil.upload() 호출 시 직접 지정

    @Transactional
    public int restaurantCreate(Restaurant restaurant) {
        return restaurantMapper.restaurantCreate(restaurant);
    }//

    @Transactional
    public int restaurantModify(Restaurant restaurant) {
        return restaurantMapper.restaurantModify(restaurant);
    }//

    public RestViewResponse restaurantViewInfo(String memberId, Long restNo) {
        RestViewResponse restRes = restaurantMapper.restaurantViewInfo(memberId, restNo);
        List<String> tags = restaurantMapper.getTags(restNo);
        List<String> menus = restaurantMapper.getMenus(restNo);

        // 신고 기능 - 지연
        if (restRes == null) {
            return null;
        }
        //

        restRes.setTags(tags);
        restRes.setMenus(menus);

        return restRes;
    }//

    public List<RestReviewsResponse> restaurantViewReviews(RestViewReviewsRequest request) {
        List<RestReviewsResponse> reviewResList = restaurantMapper.restaurantViewReviews(request);

        for (RestReviewsResponse restReviewsResponse : reviewResList) {
            List<String> menus = restaurantMapper.getMenusByReviewNo(restReviewsResponse.getReviewNo());
            restReviewsResponse.setMenus(menus);
        }

        return reviewResList;
    }//

    public int restaurantViewReviewsCnt(RestViewReviewsRequest request) {
        return restaurantMapper.restaurantViewReviewsCnt(request);
    }//

    @Transactional
    public boolean reviewCreate(ReviewCreateRequest request) {
        int res1 = restaurantMapper.reviewInsert(request);
        if (res1 != 1) {
            throw new RuntimeException("리뷰 저장 실패");
        }

        if (request.getReviewMenus() != null && !request.getReviewMenus().isEmpty()) {
            int res2 = restaurantMapper.insertReviewMenus(request.getReviewNo(), request.getReviewMenus());
            if (res2 != request.getReviewMenus().size()) {
                throw new RuntimeException("메뉴 저장 실패");
            }
        }

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            int res3 = restaurantMapper.insertReviewTags(request.getReviewNo(), request.getTags());
            if (res3 != request.getTags().size()) {
                throw new RuntimeException("태그 저장 실패");
            }
        }

        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            List<String> imageUrls = new ArrayList<>();

            for (MultipartFile file : request.getFiles()) {
                if (file.isEmpty()) continue;

                // [수정] 로컬 경로 대신 S3 폴더명("restaurant")을 전달
                //        upload() 반환값이 S3 퍼블릭 URL 전체로 변경됨
                //        예: "https://bucket.s3.region.amazonaws.com/restaurant/uuid.jpg"
                String s3Url = fileUtil.upload("restaurant", file);
                imageUrls.add(s3Url);
            }

            if (!imageUrls.isEmpty()) {
                int res4 = restaurantMapper.insertReviewImages(request.getReviewNo(), imageUrls);
                if (res4 != imageUrls.size()) {
                    throw new RuntimeException("이미지 저장 실패");
                }
            }
        }

        // 레이팅, 리뷰수 증가
        int res5 = restaurantMapper.increaseRatingAvg(request.getRestNo(), request.getRating());
        if (res5 != 1) {
            throw new RuntimeException("레이팅, 리뷰수 증가 실패");
        }

        return true;
    }//

    public ReviewViewResponse getReviewView(Long reviewNo, String memberId) {
        ReviewViewResponse res = restaurantMapper.getReviewView(reviewNo, memberId);
        List<String> images = restaurantMapper.getReviewImages(reviewNo);
        List<String> menu = restaurantMapper.getReviewMenu(reviewNo);
        List<String> tags = restaurantMapper.getReviewTags(reviewNo);

        if (res == null) {
            return null;
        }

        res.setImages(images);
        res.setReviewMenu(menu);
        res.setTags(tags);

        return res;
    }//

    // 댓글/대댓글 목록 조회
    // depth=0(댓글), depth=1(대댓글) 를 flat list 로 반환
    public List<ReviewCommentResponse> commentList(Long reviewNo) {
        return restaurantMapper.selectCommentList(reviewNo);
    }//

    // 댓글/대댓글 등록
    // 등록 후 생성된 댓글을 단건 조회해서 반환 (프론트 로컬 상태에 바로 추가)
    @Transactional
    public ReviewCommentResponse commentRegist(Long reviewNo, ReviewCommentRequest request) {
        int result = restaurantMapper.insertComment(reviewNo, request);

        if (result != 1) {
            throw new RuntimeException("댓글 저장 실패");
        }

        return restaurantMapper.selectComment(request.getCommentNo());
    }//

    // 댓글/대댓글 내용 수정
    @Transactional
    public void commentUpdate(Long commentNo, String content) {
        int result = restaurantMapper.updateComment(commentNo, content);

        if (result != 1) {
            throw new RuntimeException("댓글 수정 실패");
        }
    }//

    // 댓글/대댓글 삭제
    @Transactional
    public void commentDelete(Long commentNo) {
        int result = restaurantMapper.deleteComment(commentNo);

        if (result < 1) {
            throw new RuntimeException("댓글 삭제 실패");
        }
    }//

    public List<Recommand> getPopular(String memberId) {
        return restaurantMapper.getPopular(memberId);
    }//

    public List<Recommand> getLike(String memberId) {
        return restaurantMapper.getLike(memberId);
    }//

    public List<Recommand> getRegion(String memberId, Coords coords) {
        return restaurantMapper.getRegion(memberId, coords);
    }//

    public List<Recommand> getMainList(MainListRequest req, String memberId) {
        return restaurantMapper.getMainList(req, memberId);
    }//

    public int getMainListCount(MainListRequest req, String memberId) {
        return restaurantMapper.getMainListCount(req, memberId);
    }//

    public CheckDuplicationResponse isDup(CheckDuplicationRequest chk) {
        Long restNo = restaurantMapper.getSame(chk);

        return CheckDuplicationResponse.builder()
                .duplicate(restNo != null)
                .restNo(restNo)
                .build();
    }//

    @Transactional
    public int report(ReportRequest report) {
        if (Objects.equals(report.getType(), "rest")) {
            return restaurantMapper.restReport(report);
        } else if (Objects.equals(report.getType(), "review")){
            return restaurantMapper.reviewReport(report);
        } else {
            return restaurantMapper.commentReport(report);
        }
    }//

    @Transactional
    public int reviewLike(Long reviewNo, String memberId) {
        return restaurantMapper.reviewLike(reviewNo, memberId);
    }//

    @Transactional
    public int reviewUnlike(Long reviewNo, String memberId) {
        return restaurantMapper.reviewUnlike(reviewNo, memberId);
    }//

    @Transactional
    public int restLike(Long restNo, String memberId) {
        return restaurantMapper.restLike(restNo, memberId);
    }//

    @Transactional
    public int restUnlike(Long restNo, String memberId) {
        return restaurantMapper.restUnlike(restNo, memberId);
    }//


    @Transactional
    public int reviewModify(ReviewCreateRequest req) {

        // 1. content, rating 수정
        int res1 = restaurantMapper.reviewModifyContent(req);
        if (res1 < 1) throw new RuntimeException("리뷰 내용 수정 실패");

        // 2. rating_sum 수정
        int res2 = restaurantMapper.restModifyRating(req);
        if (res2 < 1) throw new RuntimeException("평점 합산 수정 실패");

        // 3. 태그 삭제
        restaurantMapper.reviewDeleteTags(req.getReviewNo());

        // 4. 태그 삽입
        if (req.getTags() != null && !req.getTags().isEmpty()) {
            int res4 = restaurantMapper.insertReviewTags(req.getReviewNo(), req.getTags());
            if (res4 < 1) throw new RuntimeException("태그 삽입 실패");
        }

        // 5. 이미지 삭제
        if(req.getDeleteFileList() != null && !req.getDeleteFileList().isEmpty()){
            for (String url : req.getDeleteFileList()) {
                fileUtil.deleteFile(url);
            }
            restaurantMapper.reviewDeleteImages(req);
        }

        // 6. 이미지 삽입
        if (req.getFiles() != null && !req.getFiles().isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : req.getFiles()) {
                if (file.isEmpty()) continue;

                // 로컬 경로 대신 S3 폴더명("restaurant") 전달
                //        upload() 반환값: S3 퍼블릭 URL 전체
                String s3Url = fileUtil.upload("restaurant", file);
                if (s3Url == null || s3Url.isBlank()) {
                    throw new RuntimeException("S3 파일 업로드 실패: " + file.getOriginalFilename());
                }
                imageUrls.add(s3Url);
            }

            if (!imageUrls.isEmpty()) {
                int res6 = restaurantMapper.insertReviewImages(req.getReviewNo(), imageUrls);
                if (res6 < 1) throw new RuntimeException("이미지 삽입 실패");
            }
        }

        return 1; // 모든 단계 성공 시 반환
    }//

    public List<Recommand> getRestSearch(SearchRequest req, String memberId) {
        return restaurantMapper.getRestSearch(req, memberId);
    }//

    public int getRestSearchCount(SearchRequest req, String memberId) {
        return restaurantMapper.getRestSearchCount(req, memberId);
    }//


    @Transactional
    public int deleteReview(Long reviewNo) {
        List<String> urls = restaurantMapper.findUrlByReviewNo(reviewNo);
        for (String url : urls) {
            fileUtil.deleteFile(url);
        }

        return restaurantMapper.deleteReview(reviewNo);
    }//

    @Transactional
    public int deleteRest(Long restNo) {
        List<String> urls = restaurantMapper.findUrlByRestNo(restNo);
        for (String url : urls) {
            fileUtil.deleteFile(url);
        }

        return restaurantMapper.deleteRest(restNo);
    }//

}
