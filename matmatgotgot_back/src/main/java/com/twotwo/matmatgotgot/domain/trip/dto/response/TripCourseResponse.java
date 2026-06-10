package com.twotwo.matmatgotgot.domain.trip.dto.response;

import lombok.*;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Alias(value="tripCourseResponse")
public class TripCourseResponse {
    private Long memberNo;       // 작성자 회원 번호
    private Long tplanNo;        // 여행 계획 번호
    private String title;        // 코스 제목 (tplan_title 매핑)
    private String desc;         // 코스 설명 (tplan_desc 매핑)
    private Integer tplanDays;   // 여행 일수 (당일치기, 1박2일 등)
    private Integer tplanLike;   // 좋아요 수
    private Integer tplanView;   // 조회수
    private String imgName;      // 대표 썸네일 이미지 경로/이름
    private String tplanRegion;       // 지역 데이터 (ex: "서울특별시, 부산광역시" -> 프론트 필터 바인딩용)
    private Integer tplanTotalPrice;  // 총 예상 비용 (약 OOO원 표기 및 가격 정렬용)
    private Integer tplanStatus;      // 0:비공개, 1:공개 상태 값
    private LocalDateTime createdAt;  // 작성일 (최신순 정렬 및 날짜 표기용)
    private String tplanTags;
}