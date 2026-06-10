package com.twotwo.matmatgotgot.global.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Component
public class FileUtil {

    public static String upload(String savepath, MultipartFile file) {
        //사용자가 올린 원본 파일 이름
        String filename = file.getOriginalFilename();
        int dotIndex = filename.lastIndexOf(".");
        String extension = "";

        if(dotIndex != -1) {//-1이면 빈 문자열, 아니면 확장자 찾아오기
            extension = filename.substring(dotIndex);
        }
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String filepath = uuid + extension;

        File savefile = new File(savepath+filepath);

        try {
            file.transferTo(savefile);
        } catch (IllegalStateException | IOException e) {
            e.printStackTrace();
        }

        return filepath;
    }

    public void deleteFile(String savepath, String memberThumb) {
        if (memberThumb == null || memberThumb.isEmpty()) {
            return; // 파일명 없으면 종료
        }

        // 실제 파일이 저장된 전체 경로 객체 생성
        File file = new File(savepath + memberThumb);

        // 파일이 실제로 존재하는지 확인 후 삭제
        if (file.exists()) {
            if (file.delete()) {
                System.out.println("파일 삭제 성공: " + memberThumb);
            } else {
                System.out.println("파일 삭제 실패: " + memberThumb);
            }
        }
    }
}
