package com.twotwo.matmatgotgot.domain.receiptocr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twotwo.matmatgotgot.domain.receiptocr.config.ClovaOcrProperties;
import com.twotwo.matmatgotgot.global.exception.OcrExceptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClovaOcrApiService {

    private final ClovaOcrProperties properties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OkHttpClient httpClient = new OkHttpClient();

    public JsonNode callReceiptApi(MultipartFile imageFile) {
        String requestJson = buildRequestJson(imageFile.getOriginalFilename());

        RequestBody requestBody;    // OkHttp의 RequestBody이다, 컨트롤러용 어노테이션이랑 이름만 같지 다른놈
        try {
            // CLOVA OCR 서버에 보내는 것: 설명서(JSON), 영수증 사진 파일
            requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)    // form-data 방식으로 보내겠다
                    .addFormDataPart(               // message 라는 이름표 붙인 데이터 넣기
                            "message", null,
                            RequestBody.create(requestJson, MediaType.parse("application/json"))
                    )
                    .addFormDataPart(               // file 이라는 이름표 붙인 파일 넣기
                            "file",
                            imageFile.getOriginalFilename(),    // ex) receipt.jpg
                            RequestBody.create(imageFile.getBytes(), MediaType.parse(imageFile.getContentType()))
                            // imageFile.getBytes(): 파일 내용을 이진수로 변환
                            // imageFile.getContentType(): 파일 종류 알려주기
                    )
                    .build();
        } catch (IOException e) {
            throw new OcrExceptions.ClovaApiException("이미지 파일 읽기 실패", e);
        }

        // HTTP 요청 생성
        Request request = new Request.Builder()
                .url(properties.getApiUrl())
                .addHeader("X-OCR-SECRET", properties.getSecretKey())   // CLOVA가 허가된 사용자 맞는지 확인용
                .post(requestBody)  // 위에서 만든 json(message) + 파일(영수증 사진) 데이터를 post 방식으로 보내기
                .build();

        // API 호출
        try (Response response = httpClient.newCall(request).execute()) {   // CLOVA에 요청을 보내고 그 응답을 response 에 담기, response (성공 여부, 결과 JSON, 상태 코드 등)
            if (!response.isSuccessful()) {
                throw new OcrExceptions.ClovaApiException(
                        "CLOVA OCR API 응답 오류 (HTTP " + response.code() + ")",
                        response.code()
                );
            }

            String responseBody = response.body().string();
            log.debug("CLOVA OCR 응답 전문:\n{}", responseBody);

            return parseReceiptNode(responseBody);  // 구조화된 영수증 노드를 그대로 반환
        } catch (IOException e) {
            throw new OcrExceptions.ClovaApiException("CLOVA OCR API 네트워크 오류", e);
        }
    }//

    // CLOVA에 보낼 JSON 설명서 생성
    private String buildRequestJson(String filename) {
        String format = "jpg";  // 기본 파일 형식은 jpg로 설정 (혹시 파일 확장자 확인 실패해도 최소한 jpg라도 사용하려고)
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".png"))       format = "png";
            else if (lower.endsWith(".gif"))  format = "gif";
            else if (lower.endsWith(".bmp"))  format = "bmp";
            else if (lower.endsWith(".tiff") || lower.endsWith(".tif")) format = "tiff";
        }

        // name 필드는 식별자 역할 — 실제 OCR 유형은 콘솔에서 생성한 도메인(URL)으로 결정됨
        return String.format(
                "{\"version\":\"V2\",\"requestId\":\"%s\",\"timestamp\":%d," +
                        "\"images\":[{\"format\":\"%s\",\"name\":\"receipt\"}]}",
                UUID.randomUUID(), System.currentTimeMillis(), format
        );

        /*
        최종 생성 결과 예시 (CLOVA 서버에 보내는 신청서)
        {
            "version":"V2",
            "requestId":"550e8400-e29b", // UUID - OCR 요청 구분하려고
            "timestamp":1717000000000,   // 현재 시간 숫자로 가져오기
            "images":[
                {
                    "format":"png",
                    "name":"receipt"
                }
            ]
        }
        */
    }//

    /*
     * Document OCR 응답 구조:
     * {
     *   "images": [{
     *     "inferResult": "SUCCESS",
     *     "receipt": {
     *       "result": {               ← 이 노드를 반환
     *         "storeInfo":   { ... },
     *         "paymentInfo": { ... },
     *         "subResults":  [ ... ]
     *       }
     *     }
     *   }]
     * }
     *
     * Document OCR(영수증)은 images[0].receipt.result 노드에 구조화 데이터가 담긴다.
     */

    // 필요한 영수증 데이터만 꺼내는 역할
    private JsonNode parseReceiptNode(String responseJson) {
        try {
            JsonNode root   = objectMapper.readTree(responseJson);  // JSON을 컴퓨터가 일기 쉬운 트리 구조로 변환
            JsonNode images = root.path("images");         // 트리 구조에서 images 찾기 (images 배열)

            if (!images.isArray() || images.isEmpty()) {
                log.warn("CLOVA OCR 응답에 images 배열이 없습니다.");
                return objectMapper.createObjectNode(); // 빈 JSON 객체 반환 (NPE 방지)
            }

            JsonNode firstImage = images.get(0);

            // inferResult 확인 (SUCCESS 체크)
            String inferResult = firstImage.path("inferResult").asText();
            if (!"SUCCESS".equalsIgnoreCase(inferResult)) {
                log.warn("CLOVA OCR 인식 결과: {} — 빈 노드 반환", inferResult);
                return objectMapper.createObjectNode();
            }

            // Document OCR: firstImage.path("receipt").path("result") 사용
            // receipt 안의 result 찾기
            JsonNode receiptResult = firstImage.path("receipt").path("result");

            if (receiptResult.isMissingNode() || receiptResult.isNull()) {
                log.warn("receipt.result 노드가 없습니다. 영수증 Document OCR 도메인 URL인지 확인하세요.");
                return objectMapper.createObjectNode();
            }

            log.debug("Document OCR 영수증 노드 추출 완료");
            return receiptResult;

        } catch (Exception e) {
            log.error("CLOVA OCR 응답 파싱 실패", e);
            throw new OcrExceptions.ClovaApiException("OCR 응답 파싱 중 오류 발생", e);
        }
    }//
}