package com.twotwo.matmatgotgot.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//이미지를 브라우저에 보여주기 위한 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${file.root}")
    private String root;


    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String finalLocation = "file:" + root + "member/";

        //에디터 이미지
        registry
                .addResourceHandler("/editor/**")
                .addResourceLocations("file:///" + root + "editor/");    //실제경로

        //회원 프로필 이미지
        registry.addResourceHandler("/upload/**")
                .addResourceLocations(finalLocation);

        registry
                .addResourceHandler("/restaurants/**")	// 요청 패턴
                .addResourceLocations("file:///" + root + "restaurant/");	// 실제 경로


        registry.addResourceHandler("/menu/**")
                .addResourceLocations("file:///" + root + "menu/");

    }
}