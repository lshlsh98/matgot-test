package com.twotwo.matmatgotgot.domain.trip.service;

import com.twotwo.matmatgotgot.domain.trip.dto.request.FavoriteRequest;
import com.twotwo.matmatgotgot.domain.trip.dto.request.MenuInsertRequest;
import com.twotwo.matmatgotgot.domain.trip.dto.request.TripCreateRequestDTO;
import com.twotwo.matmatgotgot.domain.trip.dto.request.TripUpdateDTO;
import com.twotwo.matmatgotgot.domain.trip.dto.response.*;
import com.twotwo.matmatgotgot.domain.trip.mapper.TripMapper;
import com.twotwo.matmatgotgot.global.util.S3FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripMapper tripMapper;
    private final S3FileUtil s3FileUtil;

    @Value("${file.root}")
    private String uploadPath;

    public List<RestaurantDTO> searchRestaurants(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        if (keyword.matches("^[ㄱ-ㅎ]+$")) {
            return tripMapper.findByChosung(keyword);
        } else {
            return tripMapper.findByKeyword(keyword);
        }
    }

    public List<TagDTO> selectTags() {
        List<Map<String, Object>> rawTags = tripMapper.selectTags();
        List<TagDTO> processedTags = new ArrayList<>();

        for (Map<String, Object> row : rawTags) {
            int tagNo = (int) row.get("tag_no");
            String tagName = (String) row.get("tag_name");

            processedTags.add(new TagDTO(tagNo, "#" + tagName, false));
        }

        return processedTags;
    }

    public List<MenuDTO> selectMenus(Long restNo) {
        return tripMapper.selectMenus(restNo);
    }

    @Transactional
    public void insertMenu(
            Long restNo,
            String menuName,
            Integer menuPrice,
            MultipartFile image
    ) throws Exception {

        String savedFileName = "basic.jpeg";

        if (image != null && !image.isEmpty()) {

            savedFileName = s3FileUtil.upload("menu", image);
        }

        MenuInsertRequest request =
                new MenuInsertRequest(
                        restNo,
                        menuName,
                        menuPrice,
                        savedFileName
                );

        tripMapper.insertMenu(request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void createTripCourse(TripCreateRequestDTO dto) {

        Map<String, Object> planMap = new HashMap<>();
        planMap.put("memberNo", dto.getMemberNo());
        planMap.put("tplanTitle", dto.getTplanTitle());
        planMap.put("tplanDesc", dto.getTplanDesc());
        planMap.put("tplanRegion", dto.getTplanRegion());
        planMap.put("tplanDays", dto.getTplanDays());
        planMap.put("tplanTotalPrice", dto.getTplanTotalPrice());

        tripMapper.insertTravelPlan(planMap);
        Long tplanNo = (Long) planMap.get("tplan_no");

        if (dto.getTagNos() != null && !dto.getTagNos().isEmpty()) {
            for (Integer tagNo : dto.getTagNos()) {
                tripMapper.insertPlanTag(tplanNo, tagNo);
            }
        }

        if (dto.getDays() != null) {
            for (TripCreateRequestDTO.DayData dayData : dto.getDays()) {

                for (TripCreateRequestDTO.ScheduleData scheData : dayData.getSchedules()) {
                    Map<String, Object> scheMap = new HashMap<>();
                    scheMap.put("tplanNo", tplanNo);
                    scheMap.put("tscheDayNo", scheData.getTscheDayNo());
                    scheMap.put("tscheOrderNo", scheData.getTscheOrderNo());
                    scheMap.put("restNo", scheData.getRestNo());

                    tripMapper.insertTravelSchedule(scheMap);
                    Long tscheNo = (Long) scheMap.get("tscheNo");
                    scheData.setGeneratedTscheNo(tscheNo);

                    if (scheData.getSelectedMenuNos() != null && !scheData.getSelectedMenuNos().isEmpty()) {
                        for (Long menuNo : scheData.getSelectedMenuNos()) {
                            tripMapper.insertRecommendMenu(tscheNo, menuNo);
                        }
                    }
                }

                for (int i = 0; i < dayData.getSchedules().size() - 1; i++) {
                    TripCreateRequestDTO.ScheduleData currentSche = dayData.getSchedules().get(i);
                    TripCreateRequestDTO.ScheduleData nextSche = dayData.getSchedules().get(i + 1);

                    if (currentSche.getRoute() != null && currentSche.getRoute().getTransitType() != null) {
                        Long fromTscheNo = currentSche.getGeneratedTscheNo();
                        Long toTscheNo = nextSche.getGeneratedTscheNo();
                        String transitType = currentSche.getRoute().getTransitType();

                        System.out.println(fromTscheNo);
                        System.out.println(toTscheNo);
                        System.out.println(transitType);
                        tripMapper.createTripCourse(fromTscheNo, toTscheNo, transitType);
                    }
                }
            }
        }
    }

    public Map<String, List<TripCourseResponse>> getTripMainData(Long memberNo) {

        Map<String, List<TripCourseResponse>> resultMap = new HashMap<>();

        List<TripCourseResponse> allPlans =
                tripMapper.selectAllPlans();

        List<TripCourseResponse> myPlans =
                allPlans.stream()
                        .filter(plan ->
                                memberNo != null &&
                                        memberNo.equals(plan.getMemberNo()))
                        .toList();

        List<TripCourseResponse> top10Plans =
                allPlans.stream()
                        .sorted(
                                Comparator.comparing(
                                        TripCourseResponse::getTplanView
                                ).reversed()
                        )
                        .limit(10)
                        .toList();

        resultMap.put("allPlans", allPlans);
        resultMap.put("myPlans", myPlans);
        resultMap.put("top10Plans", top10Plans);

        if(memberNo != null) {
            resultMap.put(
                    "favoritePlans",
                    tripMapper.selectFavoritePlans(memberNo)
            );
        } else {
            resultMap.put(
                    "favoritePlans",
                    new ArrayList<>()
            );
        }

        return resultMap;
    }

    @Transactional
    public CourseDetailResponse getCourseDetail(Long tplanNo) {
        tripMapper.updateViewCount(tplanNo);

        CourseDetailResponse response = tripMapper.selectTravelPlan(tplanNo);
        if (response == null) return null;

        response.setTags(tripMapper.selectPlanTags(tplanNo));

        List<RawSchedule> rawSchedules = tripMapper.selectRawSchedulesWithDay(tplanNo);

        Map<Integer, List<RouteNodeDTO>> dayRoutes = rawSchedules.stream()
                .collect(Collectors.groupingBy(
                        RawSchedule::getTscheDayNo,
                        LinkedHashMap::new,
                        Collectors.mapping(raw -> {
                            RouteNodeDTO node = new RouteNodeDTO();
                            node.setTscheNo(raw.getTscheNo());
                            node.setTscheOrderNo(raw.getTscheOrderNo());
                            node.setRestNo(raw.getRestNo());
                            node.setRestName(raw.getRestName());
                            node.setLat(raw.getLat());
                            node.setLng(raw.getLng());

                            node.setSelectedMenus(tripMapper.selectRecommendMenus(raw.getTscheNo()));
                            return node;
                        }, Collectors.toList())
                ));

        dayRoutes.forEach((day, nodes) -> {
            for (int i = 0; i < nodes.size() - 1; i++) {
                Long fromNo = nodes.get(i).getTscheNo();
                Long toNo = nodes.get(i + 1).getTscheNo();
                String transit = tripMapper.selectTransitType(fromNo, toNo);

                nodes.get(i).setTransitType(transit != null ? transit : "WALK");
            }
        });

        response.setDayRoutes(dayRoutes);
        return response;
    }

    @Transactional
    public boolean toggleFavorite(FavoriteRequest req) {
        int count = tripMapper.checkFavorite(req);
        if (count > 0) {
            tripMapper.deleteFavorite(req);
            return false;
        } else {
            tripMapper.insertFavorite(req);
            return true;
        }
    }

    public boolean isFavoritePlan(FavoriteRequest req) {
        int count = tripMapper.checkFavorite(req);
        return count > 0;
    }

    @Transactional
    public int updateFavoriteCount(Long tplanNo, String action) {
        if ("INCREMENT".equalsIgnoreCase(action)) {
            tripMapper.incrementFavoriteCount(tplanNo);
        } else if ("DECREMENT".equalsIgnoreCase(action)) {
            tripMapper.decrementFavoriteCount(tplanNo);
        }

        return tripMapper.selectFavoriteCount(tplanNo);
    }

    @Transactional
    public void updateCourse(TripUpdateDTO updateDto) {
        Long tplanNo = updateDto.getTplanNo();

        tripMapper.updateTravelPlan(updateDto);

        tripMapper.deletePlanTags(tplanNo);
        tripMapper.deleteTravelSchedules(tplanNo);

        if (updateDto.getTagNos() != null && !updateDto.getTagNos().isEmpty()) {
            for (Integer tagNo : updateDto.getTagNos()) {
                tripMapper.insertPlanTag(tplanNo, tagNo);
            }
        }

        if (updateDto.getDays() != null) {
            for (TripUpdateDTO.DayDataDto dayDto : updateDto.getDays()) {
                if (dayDto.getSchedules() == null) continue;

                Long prevTscheNo = null;
                String pendingTransitType = null;

                for (TripUpdateDTO.ScheduleDto scheDto : dayDto.getSchedules()) {

                    Map<String, Object> scheParam = new HashMap<>();
                    scheParam.put("tplanNo", tplanNo);
                    scheParam.put("tscheDayNo", scheDto.getTscheDayNo());
                    scheParam.put("tscheOrderNo", scheDto.getTscheOrderNo());
                    scheParam.put("restNo", scheDto.getRestNo());

                    tripMapper.insertTravelSchedule(scheParam);
                    Long currentTscheNo = (Long) scheParam.get("tscheNo");

                    if (scheDto.getSelectedMenuNos() != null && !scheDto.getSelectedMenuNos().isEmpty()) {
                        for (Long menuNo : scheDto.getSelectedMenuNos()) {
                            tripMapper.insertRecommendMenu(currentTscheNo, menuNo);
                        }
                    }

                    if (prevTscheNo != null && pendingTransitType != null) {
                        tripMapper.createTripCourse(prevTscheNo, currentTscheNo, pendingTransitType);
                    }

                    prevTscheNo = currentTscheNo;
                    pendingTransitType = (scheDto.getRoute() != null) ? scheDto.getRoute().getTransitType() : null;
                }
            }
        }
    }

    public List<MyUnfinishedCourseDTO> getMyUnfinishedCourses(Long memberNo) {
        return tripMapper.selectUnfinishedCoursesByMemberNo(memberNo);
    }

    @Transactional
    public boolean removeTripPlan(Long tplanNo, Long memberNo) {
        Long ownerNo = tripMapper.selectMemberNoByTplanNo(tplanNo);

        if (ownerNo == null) {
            throw new IllegalArgumentException("존재하지 않는 여행 코스입니다.");
        }

        if (!ownerNo.equals(memberNo)) {
            throw new SecurityException("본인이 작성한 코스만 삭제할 수 있습니다.");
        }

        return tripMapper.deleteTravelPlan(tplanNo) > 0;
    }
}
