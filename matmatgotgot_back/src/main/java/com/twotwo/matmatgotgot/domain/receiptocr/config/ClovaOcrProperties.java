package com.twotwo.matmatgotgot.domain.receiptocr.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@ConfigurationProperties(prefix = "clova.ocr")
@Component
public class ClovaOcrProperties {

    private String secretKey;
    private String apiUrl;
}
