package com.twotwo.matmatgotgot.global.config;

// [새로 추가] AWS S3 클라이언트 빈 등록 설정 클래스
// application.properties 의 cloud.aws.* 값을 읽어 S3Client 객체를 생성하고 스프링 빈으로 등록
// → FileUtil 등에서 @Autowired / @RequiredArgsConstructor 로 주입받아 사용

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    

    /**
     * AWS S3Client 빈 생성
     * - StaticCredentialsProvider: access-key / secret-key 를 고정값으로 인증
     * - Region.of(region): ap-northeast-2(서울) 등 설정한 리전으로 연결
     * - 생성된 빈은 FileUtil 에서 이미지 업로드/삭제에 사용됨
     */
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        )
                )
                .build();
    }
}
