package com.twotwo.matmatgotgot.domain.main.service;

import com.twotwo.matmatgotgot.domain.main.dto.response.MainBestReviewDTO;
import com.twotwo.matmatgotgot.domain.main.dto.response.MainBestTourDTO;
import com.twotwo.matmatgotgot.domain.main.mapper.MainMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MainService {
    private final MainMapper mainMapper;

    public MainService(MainMapper mainMapper) {
        this.mainMapper = mainMapper;
    }

    public List<MainBestReviewDTO> getBestReviews() {
        return mainMapper.findBestReviews();
    }

    public List<MainBestTourDTO> getBestTours() {
        return mainMapper.findBestTours();
    }
}
