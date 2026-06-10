package com.twotwo.matmatgotgot.domain.main.mapper;

import com.twotwo.matmatgotgot.domain.main.dto.response.MainBestReviewDTO;
import com.twotwo.matmatgotgot.domain.main.dto.response.MainBestTourDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MainMapper {
    List<MainBestReviewDTO> findBestReviews();
    List<MainBestTourDTO> findBestTours();
}
