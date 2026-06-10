package com.twotwo.matmatgotgot.domain.restaurant.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ReviewCreateRequest {

    private Long reviewNo;
    private String memberId;
    private Long restNo;
    private String restName;
    private String restAddr;
    private String reviewVisit;
    private String reviewContent;
    private Integer rating;

    private List<String> reviewMenus;
    private List<String> tags;
    private List<MultipartFile> files;

    private List<String> deleteFileList;
    private Integer oldRating;
}