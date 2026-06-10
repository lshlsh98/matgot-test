package com.twotwo.matmatgotgot.global.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

// Mapper 인터페이스 자동 스캔
@Configuration
@MapperScan("com.company.project.mapper")
public class MyBatisConfig {
    
}
