package com.twotwo.matmatgotgot.domain.receiptocr.controller;

import com.twotwo.matmatgotgot.domain.receiptocr.dto.OCRApiResponse;
import com.twotwo.matmatgotgot.domain.receiptocr.dto.ReceiptData;
import com.twotwo.matmatgotgot.domain.receiptocr.service.OcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final OcrService ocrService;

    @PostMapping(value = "/receipt")
    public ResponseEntity<OCRApiResponse> analyzeReceipt(
            @RequestPart("image") MultipartFile image
            //  @RequestPart("image"): front에서 formData.append("image", file); 보내면 "image" 를 받겠다라는 뜻
    ) {
        ReceiptData data = ocrService.analyze(image);

        return ResponseEntity.ok(OCRApiResponse.ok(data));
    }//
}
