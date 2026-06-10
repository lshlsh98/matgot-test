package com.twotwo.matmatgotgot.domain.member.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twotwo.matmatgotgot.domain.member.dto.LoginResponseDto;
import com.twotwo.matmatgotgot.domain.member.dto.MemberLoginDto;
import com.twotwo.matmatgotgot.domain.member.dto.tokenDto;
import com.twotwo.matmatgotgot.domain.member.entity.LoginMember;
import com.twotwo.matmatgotgot.domain.member.entity.Member;
import com.twotwo.matmatgotgot.domain.member.entity.Natives;
import com.twotwo.matmatgotgot.domain.member.service.MemberService;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Coords;
import com.twotwo.matmatgotgot.global.response.ApiResponse;
import com.twotwo.matmatgotgot.global.util.EmailSender;
import com.twotwo.matmatgotgot.global.util.S3FileUtil;
import com.twotwo.matmatgotgot.security.GoogleOAuthService;
import com.twotwo.matmatgotgot.security.GoogleUserProfile;
import com.twotwo.matmatgotgot.security.JwtTokenProvider;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.annotation.Native;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.ZoneId;
import java.util.Map;
import java.util.Random;

@RestController
@RequiredArgsConstructor
@RequestMapping(value="/members")
public class MemberController {
	
	private final EmailSender emailSender;
    private final MemberService memberService;
	private final GoogleOAuthService googleOAuthService;
	private final JwtTokenProvider jwtTokenProvider;
	private final S3FileUtil fileUtil;

	@Value("${file.root}")
	private String root;
	
	@GetMapping
	public ResponseEntity<?> selectAll() {
		return ResponseEntity.ok(ApiResponse.success(memberService.selectAll()));
	}

	@GetMapping(value = "/{memberId}")
	public ResponseEntity<?> selectOne(@PathVariable String memberId) {
		Member member = memberService.selectOne(memberId);
		return ResponseEntity.ok(member);
	}

	@PostMapping
	public ResponseEntity<?> insertMember(@RequestBody Member member) {
		Integer result = memberService.insertMember(member);
		return ResponseEntity.ok(result);
	}

	@PostMapping(value = "/exists")
	public ResponseEntity<?> dupCheckId(@RequestParam String memberId) {
		Member m = memberService.selectOneMember(memberId);
		return ResponseEntity.ok(m==null);
	}

	@PatchMapping(value="/{memberId}/thumbnail")
	public ResponseEntity<?> updateThumbnail(@PathVariable String memberId, @ModelAttribute MultipartFile file) {
		String savepath = root + "member/";
		String memberThumb = fileUtil.upload(savepath, file);
		Member m = new Member();
		m.setMemberThumb(memberThumb);
		m.setMemberId(memberId);
		int result = memberService.updateThumbnail(m);
		return ResponseEntity.ok(memberThumb);
	}



	@PostMapping(value="/login")
	public ResponseEntity<?> login(@RequestBody MemberLoginDto dto) {
		Member loginInput = new Member();
		loginInput.setMemberId(dto.getMemberId());
		loginInput.setMemberPw(dto.getMemberPw());

		LoginMember loginLog = memberService.login(loginInput);

		if (loginLog == null) {
			return ResponseEntity.status(401).body("로그인 정보가 올바르지 않습니다.");
		}

		Member member = memberService.findMember(dto.getMemberId());
		LoginMember loginMember = jwtTokenProvider.createToken(member.getMemberId(), member.getMemberNickname(),   member.getAdmin());//false);지연

		LoginResponseDto response = new LoginResponseDto();
		//response.setMemberNo(loginMember.getMemberNo());
		response.setMemberNo(member.getMemberNo()); //임시 DB에서 memberNo 가져옴
		response.setMemberId(loginMember.getMemberId());
		response.setMemberNickname(loginMember.getMemberNickname());
		response.setMemberThumb(member.getMemberThumb());
		//response.setAdmin(loginMember.isAdmin());
		response.setAdmin(member.getAdmin()); //지연 관리자 파트 수정해둠
		response.setMemberStatus(member.getMemberStatus()); // 지연 - 게시글 회원 차단
		response.setToken(loginMember.getToken());
		response.setLat(member.getLat());
		response.setLng(member.getLng());

		long validityMilli = loginMember.getValidity().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
		response.setValidity(validityMilli);

		return ResponseEntity.ok(response);
	}

	// @PostMapping(value="/login")
	// public ResponseEntity<?> login(@RequestBody Member member) {
	// 	LoginMember loginMember = memberService.login(member);
	// 	if(loginMember == null) {
	// 		return ResponseEntity.status(404).build();
	// 	}else{
	// 		return ResponseEntity.ok(loginMember);
	// 	}
	// }

	@PostMapping("/logout/{currentId}")
	public ResponseEntity<?> logout(@PathVariable("currentId") String memberId) {
		
		boolean isSuccess = memberService.logout(memberId);
		
		if(isSuccess) {
			return ResponseEntity.ok("로그아웃 성공");
		} else {
			return ResponseEntity.status(404).body("존재하지 않는 회원입니다.");
		}
	}

	@PostMapping("/login/google")
	public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
		String code = request.get("code");
		
		if (code == null || code.isEmpty()) {
			return ResponseEntity.badRequest().body("인가 코드가 없습니다.");
		}

		// STEP 1: 인가 코드로 구글 Access Token 받아오기
		String accessToken = googleOAuthService.getGoogleAccessToken(code);
		
		// STEP 2: Access Token으로 구글 유저 프로필 가져오기
		GoogleUserProfile googleUser = googleOAuthService.getGoogleUserProfile(accessToken);
		
		// DB에서 이메일로 기존 회원 조회
		Member member = memberService.member(googleUser.getEmail());

		if (member == null) {
			// [회원가입] DB에 해당 이메일로 가입된 회원이 없으므로 자동으로 가입 진행
			String googleId = googleUser.getId();

			Member newMember = new Member();
			newMember.setMemberId(googleId);
			newMember.setMemberEmail(googleUser.getEmail());
			newMember.setMemberName(googleUser.getName());
			newMember.setMemberPw("google" + googleId); 
			newMember.setMemberNickname("google_" + googleId);

			int insertResult = memberService.insertMemberG(newMember);
			
			if (insertResult <= 0) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 처리 중 오류가 발생했습니다.");
			}
			
			// 가입 성공 후, 다음 토큰 생성을 위해 member에 새 회원 정보 주입
			// 이 때 데이터베이스에서 auto_increment 등으로 생성된 memberNo가 필요하다면 재조회가 필요할 수 있습니다.
			member = newMember;
			System.out.println("신규 회원 자동 가입 완료: " + member.getMemberEmail());
			
		} else {
			// // [기존 회원 로그인] 이미 가입된 회원이므로 서비스 로그인 로직 검증
			// LoginMember loginCheck = memberService.login(member);
			// if (loginCheck == null) {
			// 	return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 올바르지 않습니다.");
			// }
			System.out.println("기존 회원 로그인 처리 진행: " + member.getMemberEmail());
		}

		// STEP 3: 공통 처리 - 가입 혹은 로그인된 member 기반으로 JWT 토큰 생성
		LoginMember login = jwtTokenProvider.createToken(member.getMemberId(), member.getMemberNickname(), false);

		// STEP 4: 응답 DTO 생성 및 값 세팅
		LoginResponseDto response = new LoginResponseDto();
		response.setMemberNo(member.getMemberNo());
		response.setMemberId(member.getMemberId());
		response.setMemberNickname(member.getMemberNickname());
		response.setMemberThumb(member.getMemberThumb());
		response.setAdmin(false);
		response.setToken(login.getToken());
		
		long validityMilli = login.getValidity().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
		response.setValidity(validityMilli);

		// STEP 5: 콘솔창에 최종 response 값 출력
		System.out.println("================ [GOOGLE LOGIN RESPONSE] ================");
		System.out.println("Member No       : " + response.getMemberNo());
		System.out.println("Member ID       : " + response.getMemberId());
		System.out.println("Member Nickname : " + response.getMemberNickname());
		System.out.println("Generated Token : " + response.getToken());
		System.out.println("Validity (ms)   : " + response.getValidity());
		System.out.println("========================================================");

		return ResponseEntity.ok(response);
	}

	@PostMapping(value="/login/kakao")
	public ResponseEntity<?> kakaoLogin(@RequestBody LoginResponseDto request) {
		Member member = memberService.member(request.getMemberEmail());
		if(member == null) {
			Member newMember = new Member();
			newMember.setMemberEmail(request.getMemberEmail());
			newMember.setMemberNickname(request.getMemberNickname());
			newMember.setMemberThumb(request.getMemberThumb());
			newMember.setMemberName(request.getMemberNickname());
			Random r = new Random();
			StringBuffer sb1 = new StringBuffer();
			StringBuffer sb2 = new StringBuffer();
			for(int i=0; i<6; i++) {
				int num1 = r.nextInt(10);
				int num2 = r.nextInt(10);
				sb1.append(num1);
				sb2.append(num2);
			}
			newMember.setMemberId("kakao_" + sb1);
			newMember.setMemberPw("kakao_" + sb2);
			
			int insertResult = memberService.insertMemberK(newMember);

			if (insertResult <= 0) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 처리 중 오류가 발생했습니다.");
			}

			member = newMember;
        	System.out.println("신규 회원 자동 가입 완료: " + member.getMemberEmail());

		} else {
			// LoginMember loginCheck = memberService.login(member);
			// if (loginCheck == null) {
			// 	return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 올바르지 않습니다.");
			// }
			System.out.println("기존 회원 로그인 처리 진행: " + member.getMemberEmail());
		}


		// STEP 3: 공통 처리 - 가입 혹은 로그인된 member 기반으로 JWT 토큰 생성
		LoginMember login = jwtTokenProvider.createToken(member.getMemberId(), member.getMemberNickname(), false);

		// STEP 4: 응답 DTO 생성 및 값 세팅
		LoginResponseDto response = new LoginResponseDto();
		response.setMemberNo(member.getMemberNo());
		response.setMemberId(member.getMemberId());
		response.setMemberNickname(member.getMemberNickname());
		response.setMemberThumb(member.getMemberThumb());
		response.setAdmin(false);
		response.setToken(login.getToken());
		
		long validityMilli = login.getValidity().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
		response.setValidity(validityMilli);

		// STEP 5: 콘솔창에 최종 response 값 출력
		System.out.println("================ [KAKAO LOGIN RESPONSE] ================");
		System.out.println("Member No       : " + response.getMemberNo());
		System.out.println("Member ID       : " + response.getMemberId());
		System.out.println("Member Nickname : " + response.getMemberNickname());
		System.out.println("Generated Token : " + response.getToken());
		System.out.println("Validity (ms)   : " + response.getValidity());
		System.out.println("========================================================");

		return ResponseEntity.ok(response);
	}

	@GetMapping(value = "/ranchar")
	public String getMethodName() {
		Random r = new Random();
		StringBuffer sb = new StringBuffer();
		for(int i=0;i<10;i++) {
			char ranchar = (char)(r.nextInt(26)+65);
			sb.append(ranchar);
		}
		String ranchar = sb.toString();
		System.out.println(ranchar);
		return ranchar;
	}

	@Value("${naver.client.id.k}")
    private String clientId;

	@Value("${naver.client.secret.k}")
    private String clientSecret;

	@PostMapping(value = "/login/naver")
	public ResponseEntity<?> postMethodName(@RequestBody tokenDto request) {
		String code = request.getCode(); 
		String state = request.getState();

		try {
			// ==================== 1단계: 토큰 발급 ====================
			String apiURL = "https://nid.naver.com/oauth2.0/token"
					+ "?grant_type=authorization_code"
					+ "&client_id=" + clientId
					+ "&client_secret=" + clientSecret
					+ "&code=" + code
					+ "&state=" + state;

			URL url = new URL(apiURL);
			HttpURLConnection con = (HttpURLConnection) url.openConnection();
			con.setRequestMethod("GET");
			
			int responseCode = con.getResponseCode();
			BufferedReader br = new BufferedReader(new InputStreamReader(
					responseCode == 200 ? con.getInputStream() : con.getErrorStream()
			));
			
			String inputLine;
			StringBuffer tokenResponse = new StringBuffer();
			while ((inputLine = br.readLine()) != null) {
				tokenResponse.append(inputLine);
			}
			br.close();
			
			System.out.println("1️⃣ 네이버 토큰 수신 완료");

			// JSON 파싱
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(tokenResponse.toString());
			String accessToken = jsonNode.get("access_token").asText();

			// ==================== 2단계: 프로필 조회 ====================
			String profileURL = "https://openapi.naver.com/v1/nid/me";
			URL url2 = new URL(profileURL);
			HttpURLConnection con2 = (HttpURLConnection) url2.openConnection();
			con2.setRequestMethod("GET");
			con2.setRequestProperty("Authorization", "Bearer " + accessToken);
			
			int profileResponseCode = con2.getResponseCode();
			BufferedReader br2 = new BufferedReader(new InputStreamReader(
					profileResponseCode == 200 ? con2.getInputStream() : con2.getErrorStream()
			));
			
			StringBuffer profileResponse = new StringBuffer();
			while ((inputLine = br2.readLine()) != null) {
				profileResponse.append(inputLine);
			}
			br2.close();

			System.out.println("2️⃣ 네이버 프로필 수신 완료");

			ObjectMapper objectMapper1 = new ObjectMapper();
			JsonNode rootNode = objectMapper1.readTree(profileResponse.toString());
			JsonNode naverResponse = rootNode.get("response");

			if (naverResponse != null) {
				// 네이버 프로필 데이터 추출
				String naverId = naverResponse.get("id").asText();
				String email = naverResponse.get("email").asText();
				String nickname = naverResponse.get("nickname").asText();
				String thumb = naverResponse.get("profile_image").asText();
				String name = naverResponse.get("name").asText();

				// ==================== 3단계: 회원가입 분기 처리 ====================
				Member member = memberService.member(email);
				
				if(member == null) {
					Member newMember = new Member();
					newMember.setMemberEmail(email);
					newMember.setMemberNickname(nickname);
					newMember.setMemberThumb(thumb);
					newMember.setMemberName(name);
					
					Random r = new Random();
					StringBuffer sb = new StringBuffer();
					for(int i=0; i<6; i++) {
						int num1 = r.nextInt(10);
						sb.append(num1);
					}
					newMember.setMemberId(naverId);
					// 비밀번호 구분을 위한 초기값 세팅 (예: naver_ 랜덤값)
					newMember.setMemberPw("naver_" + sb); 
					
					int insertResult = memberService.insertMemberN(newMember);

					if (insertResult <= 0) {
						return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 처리 중 오류가 발생했습니다.");
					}

					member = newMember;
					System.out.println("🎉 신규 회원 자동 가입 완료: " + member.getMemberEmail());
				} else {
					System.out.println("🏠 기존 회원 로그인 처리 진행: " + member.getMemberEmail());
				}

				// ==================== 4단계: 서비스 전용 JWT 토큰 발급 및 가공 ====================
				LoginMember login = jwtTokenProvider.createToken(member.getMemberId(), member.getMemberNickname(), false);
				
				LoginResponseDto response = new LoginResponseDto();
				response.setMemberNo(member.getMemberNo());
				response.setMemberId(member.getMemberId());
				response.setMemberNickname(member.getMemberNickname());
				response.setMemberThumb(member.getMemberThumb());
				response.setAdmin(false);
				response.setToken(login.getToken());
				
				long validityMilli = login.getValidity().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
				response.setValidity(validityMilli);

				// 최종 로그 출력
				System.out.println("================ [NAVER LOGIN RESPONSE] ================");
				System.out.println("Member No       : " + response.getMemberNo());
				System.out.println("Member ID       : " + response.getMemberId());
				System.out.println("Member Nickname : " + response.getMemberNickname());
				System.out.println("Generated Token : " + response.getToken());
				System.out.println("Validity (ms)   : " + response.getValidity());
				System.out.println("========================================================");

				// ✨ 여기가 최종 출력(리액트로 데이터 전송) 역할을 수행합니다!
				return ResponseEntity.ok(response);
				
			} else {
				return ResponseEntity.status(400).body("네이버 프로필 정보를 가져오지 못했습니다.");
			}
			
			// ❌ [삭제됨] 기존의 이 위치에 있던 잘못된 return 코드를 제거했습니다.

		} catch (Exception e) {
			e.printStackTrace(); 
			return ResponseEntity.status(500).body("백엔드 에러 발생: " + e.getMessage());
		}
	}	
	
	@PostMapping(value = "/pwMember")
	public ResponseEntity<?> updateMemberPw(@RequestBody Member member) {
		Boolean memberOk = memberService.selectPw(member);
		if (memberOk) {
			Integer memberNewPw = memberService.updateMemberPw(member);
			return ResponseEntity.ok(memberNewPw);
		}
		return ResponseEntity.ok(null);
	}

	@GetMapping(value = "natives")
	public ResponseEntity<?> getNative(@RequestParam("memberId") String memberId) {
		System.out.println("=================================================");
		System.out.println("👉 [백엔드] natives 컨트롤러 진입 성공! 들어온 ID: " + memberId);
		System.out.println("=================================================");

		Natives nativeInfo = memberService.getNative(memberId);
		System.out.println("👉 [백엔드] 서비스에서 조회한 데이터 결과: " + nativeInfo);

		return ResponseEntity.ok(nativeInfo);
    }

	@PostMapping(value="/email-verification")
	public ResponseEntity<?> sendMail(@RequestBody Member member, Model model) throws MessagingException {
		String emailTitle = "[맛맛곳곳] 회원가입 인증 메일입니다.";
		Random r = new Random();
		StringBuffer sb = new StringBuffer();
		for(int i=0; i<6; i++) {
			int flag = r.nextInt(3);

			if (flag == 0) {
				int randomCode = r.nextInt(10);
				sb.append(randomCode);
			} else if (flag == 1) {
				char randomCode = (char)(r.nextInt(26) + 65);
				sb.append(randomCode);
			} else if (flag == 2) {
				char randomCode = (char)(r.nextInt(26) + 97);
				sb.append(randomCode);
			}
		}
		String authCode = sb.toString();
		model.addAttribute("authCode", authCode);
		String emailContent = memberService.joinEmail(authCode);
		try {
			// 1. 시도할 코드를 적습니다.
			emailSender.sendMail(emailTitle, member.getMemberEmail(), emailContent);

		} catch (MessagingException e) {
			// 2. try가 끝나면 '바로 이어서' catch 문이 와야 합니다.
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("에러 발생");
		}
		return ResponseEntity.ok(ApiResponse.success(authCode));
	}

	@PostMapping(value = "/email-emailchange")
	public ResponseEntity<?> sendChangeMail(@RequestBody Member member, Model model) throws MessagingException {
		String emailTitle = "[맛맛곳곳] 이메일 변경 인증 메일입니다.";
		Random r = new Random();
		StringBuffer sbm = new StringBuffer();
		for(int i=0; i<6; i++) {
			int flag = r.nextInt(3);

			if (flag == 0) {
				int randomCode = r.nextInt(10);
				sbm.append(randomCode);
			} else if (flag == 1) {
				char randomCode = (char)(r.nextInt(26) + 65);
				sbm.append(randomCode);
			} else if (flag == 2) {
				char randomCode = (char)(r.nextInt(26) + 97);
				sbm.append(randomCode);
			}
		}
		String mailauthCode = sbm.toString();
		model.addAttribute("authCode", mailauthCode);
		String emailContent = memberService.updateEmail(mailauthCode);
		try {
			// 1. 시도할 코드를 적습니다.
			emailSender.sendMail(emailTitle, member.getMemberEmail(), emailContent);

		} catch (MessagingException e) {
			// 2. try가 끝나면 '바로 이어서' catch 문이 와야 합니다.
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("에러 발생");
		}
		return ResponseEntity.ok(ApiResponse.success(mailauthCode));
	}

	@PostMapping(value = "/changeEmail")
	public ResponseEntity<?> changeEmail(@RequestBody Member member) {
		int result = memberService.updateEmail(member);
		return ResponseEntity.ok(result);
	}

	@PatchMapping("/location")
	public ResponseEntity<?> updateLocation (@ModelAttribute Coords coords, Authentication auth) {
		int result = memberService.updateLocation(auth.getName(), coords);
		return ResponseEntity.ok(result);
	}//

}
