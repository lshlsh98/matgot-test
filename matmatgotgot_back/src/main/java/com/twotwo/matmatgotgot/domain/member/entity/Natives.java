package com.twotwo.matmatgotgot.domain.member.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.sql.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Alias(value="natives")
public class Natives {
    private Integer nativeNo;
    private Integer memberNo;
    private String region;
    private Date nativeDeadline;
}
