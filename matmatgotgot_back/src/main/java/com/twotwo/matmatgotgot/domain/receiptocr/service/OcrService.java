package com.twotwo.matmatgotgot.domain.receiptocr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.twotwo.matmatgotgot.domain.receiptocr.dto.ReceiptData;
import com.twotwo.matmatgotgot.global.exception.OcrExceptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OcrService {

    private final ClovaOcrApiService clovaOcrApiService;
    private final ReceiptParserService receiptParserService;

    // 허용되는 이미지 MIME 타입
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff", "image/webp"
    );

    public ReceiptData analyze(MultipartFile imageFile) {
        validateImage(imageFile);   // 파일 유효성 검사

        JsonNode receiptResult = clovaOcrApiService.callReceiptApi(imageFile);  // 사진을 이용해서 JsonNode 생성

        if (receiptResult.isMissingNode() || receiptResult.isNull()
                || (receiptResult.path("storeInfo").isMissingNode())) {
            throw new OcrExceptions.ParseFailedException(
                    "영수증 정보를 인식할 수 없습니다. 선명한 영수증 이미지를 업로드하거나 " +
                            "영수증 Document OCR 도메인 URL이 올바른지 확인해주세요."
            );
        }

        // 정규식 파싱 대신 JSON 필드 직접 매핑
        ReceiptData receiptData = receiptParserService.parse(receiptResult);

        return receiptData;
    }//

    // 파일 유효성 검사 (null, 빈 파일, MIME 타입)
    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new OcrExceptions.InvalidImageException("이미지 파일이 비어 있습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new OcrExceptions.InvalidImageException(
                    "지원하지 않는 파일 형식입니다. JPG, PNG, GIF, BMP, TIFF, WEBP 파일을 업로드해주세요."
            );
        }

        // 20MB 크기 제한 (spring 설정과 이중 방어)
        if (file.getSize() > 20L * 1024 * 1024) {
            throw new OcrExceptions.InvalidImageException("파일 크기는 20MB 이하여야 합니다.");
        }
    }//
}
