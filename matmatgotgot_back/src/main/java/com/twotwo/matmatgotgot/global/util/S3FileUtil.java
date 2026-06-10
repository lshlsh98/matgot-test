package com.twotwo.matmatgotgot.global.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3FileUtil {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * [수정] 이미지를 AWS S3에 업로드하고 퍼블릭 URL을 반환
     *
     * @param folder S3 버킷 내 저장 폴더 경로 (예: "restaurant", "member")
     * @param file   업로드할 MultipartFile
     * @return 업로드된 이미지의 S3 퍼블릭 접근 URL
     *         예: "https://matmatgotgot.s3.ap-northeast-2.amazonaws.com/restaurant/abc123.jpg"
     *
     * ■ 동작 흐름
     *   1) 원본 파일명에서 확장자 추출
     *   2) UUID + 확장자로 고유한 S3 오브젝트 키 생성 (folder/UUID.ext)
     *   3) PutObjectRequest 로 S3에 업로드 (ContentType 지정 → 브라우저에서 직접 이미지 렌더링 가능)
     *   4) 업로드 완료 후 퍼블릭 URL 반환
     */
    public String upload(String folder, MultipartFile file) {
        // 원본 파일명에서 확장자 추출 (없으면 빈 문자열)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // UUID 기반 고유 파일명 생성 → S3 오브젝트 키 (폴더/파일명)
        String s3Key = "Temp/upload/web/matgot/" + folder + "/" + UUID.randomUUID() + extension;

        try {
            // S3 업로드 요청 객체 생성
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)          // 대상 버킷
                    .key(s3Key)                  // 버킷 내 경로 + 파일명
                    .contentType(file.getContentType()) // MIME 타입 (image/jpeg 등) 지정
                    .build();

            // S3에 파일 업로드 (InputStream → RequestBody 변환)
            s3Client.putObject(putRequest, RequestBody.fromInputStream(
                    file.getInputStream(), file.getSize()
            ));

        } catch (IOException e) {
            throw new RuntimeException("S3 파일 업로드 실패: " + originalFilename, e);
        }

        // S3 퍼블릭 접근 URL 조합 후 반환
        // 형식: https://{bucketName}.s3.{region}.amazonaws.com/{s3Key}
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + s3Key;
    }

    /**
     * [수정] S3에 저장된 파일을 URL 기준으로 삭제
     *
     * @param fileUrl 삭제할 파일의 S3 퍼블릭 URL
     *                예: "https://matmatgotgot.s3.ap-northeast-2.amazonaws.com/restaurant/abc123.jpg"
     *
     * ■ 동작 흐름
     *   1) S3 URL에서 오브젝트 키(bucket 이후 경로) 추출
     *   2) DeleteObjectRequest 로 S3에서 파일 삭제
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return; // URL 없으면 삭제 건너뜀
        }

        // S3 URL에서 오브젝트 키만 추출
        // URL 예시: "https://bucket.s3.region.amazonaws.com/restaurant/abc123.jpg"
        // 추출 결과: "restaurant/abc123.jpg"
        String baseUrl = "https://" + bucketName + ".s3." + region + ".amazonaws.com/";
        String s3Key = fileUrl.replace(baseUrl, "");

        // S3 삭제 요청
        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        s3Client.deleteObject(deleteRequest);
    }
}