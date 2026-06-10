package com.twotwo.matmatgotgot.global.util;

import java.io.UnsupportedEncodingException;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Component
public class EmailSender {
	@Autowired
    private JavaMailSender sender;
	
	public void sendMail(String emailTitle, String receiver, String emailContent) throws MessagingException {
		MimeMessage message = sender.createMimeMessage();
		
		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			//메일 전송 시간 설정
			helper.setSentDate(new Date());
			//보내는 사람 정보
			helper.setFrom(new InternetAddress("tkavkf30409@gmail.com","맛맛곳곳"));
			//받는사람 정보
			helper.setTo(receiver);
			//제목설정
			helper.setSubject(emailTitle);
			//내용설정
			helper.setText(emailContent,true);
			//이메일 발송
			sender.send(message);
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
