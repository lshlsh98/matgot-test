package com.twotwo.matmatgotgot.domain.main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="mainBestTourDTO")
public class MainBestTourDTO {
    private Long tplanNo;
    private Long memberNo;
    private String tplanTitle;
    private String tplanDesc;
    private String tplanRegion;
    private Integer tplanLike;
    private String menuImg;
}
