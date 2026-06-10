package com.twotwo.matmatgotgot.domain.trip.mapper;

import com.twotwo.matmatgotgot.domain.trip.dto.request.FavoriteRequest;
import com.twotwo.matmatgotgot.domain.trip.dto.request.MenuInsertRequest;
import com.twotwo.matmatgotgot.domain.trip.dto.request.TripUpdateDTO;
import com.twotwo.matmatgotgot.domain.trip.dto.response.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface TripMapper {
    List<RestaurantDTO> findByChosung(String keyword);
    List<RestaurantDTO> findByKeyword(String keyword);
    List<Map<String, Object>> selectTags();
    List<MenuDTO> selectMenus(@Param("restNo") Long restNo);
    int insertMenu(MenuInsertRequest request);
    void insertTravelPlan(Map<String, Object> planMap);

    void insertPlanTag(@Param("tplanNo") Long tplanNo, @Param("tagNo") Integer tagNo);

    void insertTravelSchedule(Map<String, Object> scheMap);

    void insertRecommendMenu(@Param("tscheNo") Long tscheNo, @Param("menuNo") Long menuNo);

    void createTripCourse(@Param("fromTscheNo") Long fromTscheNo,
                           @Param("toTscheNo") Long toTscheNo,
                           @Param("transitType") String transitType);

    List<TripCourseResponse> selectAllPlans();
    List<TripCourseResponse> selectFavoritePlans(@Param("memberNo") Long memberNo);

    void updateViewCount(Long tplanNo);
    CourseDetailResponse selectTravelPlan(Long tplanNo);
    List<String> selectPlanTags(Long tplanNo);
    List<RawSchedule> selectRawSchedulesWithDay(Long tplanNo);
    List<MenuDTO> selectRecommendMenus(Long tscheNo);
    String selectTransitType(@Param("fromNo") Long fromNo, @Param("toNo") Long toNo);

    int checkFavorite(FavoriteRequest req);
    void deleteFavorite(FavoriteRequest req);
    void insertFavorite(FavoriteRequest req);

    void incrementFavoriteCount(@Param("tplanNo") Long tplanNo);
    void decrementFavoriteCount(@Param("tplanNo") Long tplanNo);
    int selectFavoriteCount(@Param("tplanNo") Long tplanNo);

    void updateTravelPlan(TripUpdateDTO updateDto);

    void deletePlanTags(@Param("tplanNo") Long tplanNo);

    void deleteTravelSchedules(@Param("tplanNo") Long tplanNo);

    List<MyUnfinishedCourseDTO> selectUnfinishedCoursesByMemberNo(Long memberNo);

    Long selectMemberNoByTplanNo(Long tplanNo);

    int deleteTravelPlan(Long tplanNo);
}
