package com.twotwo.matmatgotgot.global.exception;

// OCR 도메인 전용 예외 클래스 모음
public class OcrExceptions {

    // CLOVA OCR API 호출 실패 시 던지는 예외
    public static class ClovaApiException extends RuntimeException {
        private final int statusCode;

        public ClovaApiException(String message, int statusCode) {
            super(message);
            this.statusCode = statusCode;
        }

        public ClovaApiException(String message, Throwable cause) {
            super(message, cause);
            this.statusCode = 500;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }

    // 업로드된 파일이 유효하지 않을 때 던지는 예외
    public static class InvalidImageException extends RuntimeException {
        public InvalidImageException(String message) {
            super(message);
        }
    }

    // OCR 결과에서 파싱할 수 있는 데이터가 없을 때 던지는 예외
    public static class ParseFailedException extends RuntimeException {
        public ParseFailedException(String message) {
            super(message);
        }
    }
}
