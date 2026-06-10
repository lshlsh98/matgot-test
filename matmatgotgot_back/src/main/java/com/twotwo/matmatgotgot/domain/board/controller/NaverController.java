package com.twotwo.matmatgotgot.domain.board.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twotwo.matmatgotgot.domain.board.entity.Board;
import com.twotwo.matmatgotgot.domain.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api/naver")
@CrossOrigin("*")
@RequiredArgsConstructor
public class NaverController {

    private final BoardService boardService;

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.secret}")
    private String secret;

    @GetMapping("/{query}")
    public ResponseEntity<?> search(
            @PathVariable String query
    ) {

        return ResponseEntity.ok(
                getPlace(query)
        );
    }

    private List<Map<String, Object>> getPlace(
            String query
    ) {

        List<Map<String, Object>> list =
                new ArrayList<>();

        try {

            URI uri = UriComponentsBuilder
                    .fromUriString(
                            "https://openapi.naver.com"
                    )
                    .path("/v1/search/local.json")
                    .queryParam("query", query)
                    .queryParam("display", 8)
                    .build()
                    .encode()
                    .toUri();

            RestTemplate rt =
                    new RestTemplate();

            RequestEntity<Void> req =
                    RequestEntity.get(uri)
                            .header(
                                    "X-Naver-Client-Id",
                                    clientId
                            )
                            .header(
                                    "X-Naver-Client-Secret",
                                    secret
                            )
                            .build();

            ResponseEntity<String> res =
                    rt.exchange(
                            req,
                            String.class
                    );

            ObjectMapper om =
                    new ObjectMapper();

            JsonNode root =
                    om.readTree(
                            res.getBody()
                    );

            for (JsonNode item :
                    root.path("items")) {

                String title =
                        item.path("title")
                                .asText()
                                .replaceAll(
                                        "<[^>]*>",
                                        ""
                                );

                String address =
                        item.path("address")
                                .asText();

                String latitude =
                        item.path("mapy")
                                .asText();

                String longitude =
                        item.path("mapx")
                                .asText();

                // 장소 조회용 Board 객체
                Board board =
                        new Board();

                board.setPlaceName(
                        title
                );

                board.setAddressName(
                        address
                );

                // 네이버 좌표 변환
                board.setPlaceLat(
                        Double.parseDouble(
                                latitude
                        ) / 10000000
                );

                board.setPlaceLng(
                        Double.parseDouble(
                                longitude
                        ) / 10000000
                );

                // 장소 조회 or 생성
                Integer placeNo =
                        boardService
                                .getOrCreatePlaceNo(
                                        board
                                );

                Map<String, Object> map =
                        new HashMap<>();

                map.put("title", title);
                map.put("address", address);
                map.put("latitude", latitude);
                map.put("longitude", longitude);

                // 핵심
                map.put(
                        "placeNo",
                        placeNo
                );

                list.add(map);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}