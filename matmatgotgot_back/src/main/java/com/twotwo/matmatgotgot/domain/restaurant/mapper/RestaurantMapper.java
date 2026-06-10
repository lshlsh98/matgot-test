package com.twotwo.matmatgotgot.domain.restaurant.mapper;

import com.twotwo.matmatgotgot.domain.restaurant.dto.request.*;
import com.twotwo.matmatgotgot.domain.restaurant.dto.response.*;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Coords;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Recommand;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Restaurant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.HashMap;
import java.util.List;

@Mapper
public interface RestaurantMapper {

    int restaurantCreate(Restaurant restaurant);

    RestViewResponse restaurantViewInfo(@Param("memberId") String memberId,
                                        @Param("restNo") Long restNo);

    List<String> getTags(Long restNo);

    List<String> getMenus(Long restNo);

    List<RestReviewsResponse> restaurantViewReviews(RestViewReviewsRequest request);

    List<String> getMenusByReviewNo(Long reviewNo);

    int restaurantViewReviewsCnt(RestViewReviewsRequest request);

    int reviewInsert(ReviewCreateRequest request);

    int insertReviewMenus(@Param("reviewNo") Long reviewNo,
                           @Param("menuList") List<String> menuList);

    int insertReviewTags(@Param("reviewNo") Long reviewNo,
                          @Param("tagList") List<String> tagList);

    int insertReviewImages(@Param("reviewNo") Long reviewNo,
                           @Param("imageUrls") List<String> imageUrls);

    ReviewViewResponse getReviewView(@Param("reviewNo") Long reviewNo,
                                     @Param("memberId") String memberId);

    List<String> getReviewImages(Long reviewNo);

    List<String> getReviewMenu(Long reviewNo);

    List<String> getReviewTags(Long reviewNo);

    List<ReviewCommentResponse> selectCommentList(Long reviewNo);

    int insertComment(@Param("reviewNo") Long reviewNo,
                      @Param("req") ReviewCommentRequest request);

    ReviewCommentResponse selectComment(Long commentNo);

    int updateComment(@Param("commentNo") Long commentNo,
                      @Param("content") String content);

    int deleteComment(Long commentNo);

    List<Recommand> getPopular(String memberId);

    List<Recommand> getLike(String memberId);

    List<Recommand> getRegion(@Param("memberId") String memberId,
                              @Param("coords") Coords coords);

    // Main
    List<Restaurant> selectMyWishList(@Param("memberId") String memberId);
    List<Restaurant> selectPopularList();
    List<Restaurant> selectAllList();
    List<RestaurantMapMarkerDTO> selectWishMapMarkers(@Param("memberId") String memberId);
    List<RestaurantMapMarkerDTO> selectVisitedMapMarkers(@Param("memberId") String memberId);
    List<Recommand> getMainList(@Param("req") MainListRequest req,
                                @Param("memberId") String memberId);

    int getMainListCount(@Param("req") MainListRequest req,
                             @Param("String") String memberId);

    Long getSame(CheckDuplicationRequest chk);

    int increaseRatingAvg(@Param("restNo") Long restNo,
                          @Param("rating") int rating);


    int restReport(ReportRequest report);

    int reviewReport(ReportRequest report);

    int reviewLike(@Param("reviewNo") Long reviewNo,
                   @Param("memberId") String memberId);

    int reviewUnlike(@Param("reviewNo") Long reviewNo,
                     @Param("memberId") String memberId);

    int restLike(@Param("restNo") Long restNo,
                 @Param("memberId") String memberId);

    int restUnlike(@Param("restNo") Long restNo,
                   @Param("memberId") String memberId);

    int restaurantModify(Restaurant restaurant);

    int reviewModifyContent(ReviewCreateRequest req);


    int reviewDeleteTags(Long reviewNo);

    int reviewDeleteImages(ReviewCreateRequest req);

    int restModifyRating(ReviewCreateRequest req);

    List<Recommand> getRestSearch(@Param("req") SearchRequest req,
                                  @Param("memberId") String memberId);

    int getRestSearchCount(SearchRequest req, String memberId);

    int commentReport(ReportRequest report);

    int deleteReview(Long reviewNo);

    int deleteRest(Long restNo);

    List<String> findUrlByReviewNo(Long reviewNo);

    List<String> findUrlByRestNo(Long restNo);
}
