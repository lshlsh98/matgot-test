package com.twotwo.matmatgotgot.domain.main.controller;

import com.twotwo.matmatgotgot.domain.main.dto.response.MainBestReviewDTO;
import com.twotwo.matmatgotgot.domain.main.dto.response.MainBestTourDTO;
import com.twotwo.matmatgotgot.domain.main.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor // 💡 final이 붙은 필드를 모아 생성자를 자동 생성합니다.
@RequestMapping("/main")
public class MainController {

    // 💡 1. 여기에 final 키워드를 꼭 붙여주세요!
    private final MainService mainService;

    // 💡 2. 수동으로 작성했던 public MainController(...) 생성자는 과감히 삭제합니다!
    // @RequiredArgsConstructor가 눈에 보이지 않는 완벽한 생성자를 대신 만들어줍니다.

    @GetMapping("/best-reviews")
    public ResponseEntity<List<MainBestReviewDTO>> getBestReviews() {
        List<MainBestReviewDTO> reviews = mainService.getBestReviews();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/best-tours")
    public ResponseEntity<List<MainBestTourDTO>> getBestTours() {
        List<MainBestTourDTO> tours = mainService.getBestTours();
        return ResponseEntity.ok(tours);
    }
}