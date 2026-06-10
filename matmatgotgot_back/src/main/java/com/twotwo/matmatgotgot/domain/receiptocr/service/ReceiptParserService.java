package com.twotwo.matmatgotgot.domain.receiptocr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.twotwo.matmatgotgot.domain.receiptocr.dto.MenuItem;
import com.twotwo.matmatgotgot.domain.receiptocr.dto.ReceiptData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * CLOVA Document OCR(영수증) 응답 노드를 OcrDto.ReceiptData로 변환하는 서비스.
 *
 * ▶ Document OCR 영수증 응답 구조 (receipt.result 하위)
 *   storeInfo
 *     └ name.text          → 가게명
 *     └ subName.text       → 가게 부제목 (브랜드명 등)
 *     └ addresses[0].text  → 주소
 *     └ bizNum.text        → 사업자번호
 *   paymentInfo
 *     └ date.text          → 날짜 (예: "20260317")
 *     └ date.formatted     → { year, month, day }
 *     └ time.text          → 시간
 *     └ totalPrice.price.text → 총액
 *   subResults[0].items[]
 *     └ name.text          → 메뉴명
 *     └ count.text         → 수량
 *     └ unitPrice.text     → 단가
 *     └ price.text         → 항목 합계
 */
@Slf4j
@Service
public class ReceiptParserService {

    public ReceiptData parse(JsonNode receiptResult) {
        String storeName = readStoreName(receiptResult);
        String address = readAddress(receiptResult);
        String date = readDate(receiptResult);
        List<MenuItem> menuItems = readMenuItems(receiptResult);
        String rawText = buildRawText(storeName, address, date, menuItems);

        log.debug("파싱 결과 — 가게명:{} 주소:{} 날짜:{} 메뉴수:{}",
                storeName, address, date, menuItems.size());

        return ReceiptData.builder()
                .storeName(storeName)
                .address(address)
                .date(date)
                .menuItems(menuItems)
                .build();
    }//

    private String readStoreName(JsonNode result) {
        // 1순위: storeInfo.name.text
        String name = readText(result, "storeInfo", "name");
        if (name != null && !name.isBlank()) return name;

        // 2순위: storeInfo.subName.text (브랜드명·지점명이 subName에 있는 경우)
        String subName = readText(result, "storeInfo", "subName");
        if (subName != null && !subName.isBlank()) return subName;

        return null;
    }//

    private String readAddress(JsonNode result) {
        JsonNode addresses = result.path("storeInfo").path("addresses");
        if (addresses.isArray() && !addresses.isEmpty()) {
            // 배열의 첫 번째 주소 반환
            String addr = addresses.get(0).path("text").asText("").trim();
            return addr.isEmpty() ? null : addr;
        }
        return null;
    }//

    private String readDate(JsonNode result) {
        JsonNode dateNode = result.path("paymentInfo").path("date");
        if (dateNode.isMissingNode()) return null;

        // formatted 객체에 year/month/day가 있으면 YYYY-MM-DD 형식으로 조합
        JsonNode formatted = dateNode.path("formatted");
        if (!formatted.isMissingNode()) {
            String year  = formatted.path("year").asText("");
            String month = formatted.path("month").asText("");
            String day   = formatted.path("day").asText("");
            if (!year.isEmpty() && !month.isEmpty() && !day.isEmpty()) {
                // 월/일을 2자리로 패딩 (예: "3" → "03")
                return year + "-"
                        + String.format("%02d", Integer.parseInt(month)) + "-"
                        + String.format("%02d", Integer.parseInt(day));
            }
        }

        // formatted가 없거나 불완전한 경우 date.text 그대로 반환
        String raw = dateNode.path("text").asText("").trim();

        return raw.isEmpty() ? null : raw;
    }//

    private List<MenuItem> readMenuItems(JsonNode result) {
        List<MenuItem> items = new ArrayList<>();

        // subResults 배열 순회 (영수증에 복수의 결제 그룹이 있을 수 있음)
        // subResults란? 영수증이 항상 하나의 구조가 아닐 수 있음 -> (음식 주문 영역 / 추가 메뉴 영역/ 할인 영역)
        // 이런 걸 그룹으로 나눠놓은 게 subResults
        JsonNode subResults = result.path("subResults");
        if (!subResults.isArray()) return items;

        for (JsonNode subResult : subResults) {
            JsonNode itemsNode = subResult.path("items");
            if (!itemsNode.isArray()) continue;

            for (JsonNode item : itemsNode) {
                // 메뉴명: name.text
                String name = item.path("name").path("text").asText("").trim();
                if (name.isEmpty()) continue;

                // 항목 합계 금액: price.text 우선, 없으면 unitPrice.text
                String price = readItemPrice(item);

                log.debug("  메뉴 인식: {} / {}원", name, price);
                items.add(MenuItem.builder()
                        .name(name)
                        .price(price)
                        .build());
            }
        }

        return items;
    }//

    // 메뉴 항목에서 금액 추출 (price → unitPrice → null 순서로 폴백)
    private String readItemPrice(JsonNode item) {
        // 1순위: price.formatted.value (항목 합계, 이미 정제된 숫자)
        String fmtPrice = item.path("price").path("formatted").path("value").asText("").trim();
        if (!fmtPrice.isEmpty()) return fmtPrice.replace(",", "");

        // 2순위: price.text (항목 합계, 콤마 포함 가능)
        String txtPrice = item.path("price").path("text").asText("").trim();
        if (!txtPrice.isEmpty()) return txtPrice.replace(",", "");

        // 3순위: unitPrice.text (단가 — price가 없을 때 폴백)
        String unitPrice = item.path("unitPrice").path("text").asText("").trim();
        if (!unitPrice.isEmpty()) return unitPrice.replace(",", "");

        return null;
    }

    private String readText(JsonNode node, String... keys) {
        JsonNode current = node;
        for (String key : keys) {
            if (current == null || current.isMissingNode()) return null;
            current = current.path(key);
        }

        if (current == null || current.isMissingNode()) return null;

        // 마지막 노드의 "text" 필드 읽기
        String text = current.path("text").asText("").trim();

        return text.isEmpty() ? null : text;
    }//

    // rawText 조립 (디버그·프론트 원본 표시용)
    private String buildRawText(String storeName, String address, String date, List<MenuItem> menuItems) {
        StringBuilder sb = new StringBuilder();
        if (storeName  != null) sb.append("가게명: ").append(storeName).append("\n");
        if (address    != null) sb.append("주소: ").append(address).append("\n");
        if (date       != null) sb.append("날짜: ").append(date).append("\n");
        menuItems.forEach(m -> sb.append("  ").append(m.getName())
                .append(" / ").append(m.getPrice()).append("원\n"));

        return sb.toString().trim();
    }//
}