package com.twotwo.matmatgotgot.domain.member.service;

import com.twotwo.matmatgotgot.domain.member.dto.response.MemberResponse;
import com.twotwo.matmatgotgot.domain.member.entity.LoginMember;
import com.twotwo.matmatgotgot.domain.member.entity.Member;
import com.twotwo.matmatgotgot.domain.member.mapper.MemberMapper;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Coords;
import com.twotwo.matmatgotgot.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {
	private final MemberMapper memberMapper;
    private final BCryptPasswordEncoder bcrypt;
    private final JwtTokenProvider jwtTokenProvider;
    private final ResourceLoader resourceLoader;
    private final TemplateEngine templateEngine;

    public List<MemberResponse> selectAll() {
        List<Member> memberList = memberMapper.selectAll();
        return memberList.stream().map(MemberResponse::from).toList();
    }

    public Member selectOneMember(String memberId) {
        Member member = memberMapper.selectOneMember(memberId);
        return member;
    }

    @Transactional
    public Integer insertMember(Member member) {
        String memberPw = member.getMemberPw();
        String encPw = bcrypt.encode(memberPw);
        member.setMemberPw(encPw);
        Integer result = memberMapper.insertMember(member);
        return result;
    }

    public Member member(String email) {
        Member member = memberMapper.selectOneMemberByEmail(email);
        return member;
    }

    public LoginMember login(Member member) {
        Member loginmember  = memberMapper.selectOneMember(member.getMemberId());
        if(loginmember != null && bcrypt.matches(member.getMemberPw(), loginmember.getMemberPw())) {
            LoginMember login = jwtTokenProvider.createToken(loginmember.getMemberId(),loginmember.getMemberNickname(), loginmember.getAdmin()
            );
            if(login != null) {
                int result = memberMapper.loginLog(loginmember.getMemberNo());
                if(result > 0) {
                    return login;
                }
            } else {
                return null;
            }
        }
        return null;
    }

    @Transactional
    public int insertMemberG(Member newMember) {
        String memberPw = newMember.getMemberPw();
        String encPw = bcrypt.encode(memberPw);
        newMember.setMemberPw(encPw);
        int result = memberMapper.insertMember(newMember);
        if(result > 0) {
            int socialResult = memberMapper.googleInsertMember(newMember);
            memberMapper.loginLog(newMember.getMemberNo());
            return socialResult;
        }
        return -1;
    }

    public Member findMember(String memberId) {
        Member member = memberMapper.selectOneMember(memberId);
        return member;
    }

    @Transactional
    public boolean logout(String memberId) {
        Member loginMember = memberMapper.selectOneMember(memberId);
        if (loginMember != null) {
            int result = memberMapper.logoutLog(loginMember.getMemberNo());
            return result > 0; 
        }
        
        return false;
    }

    @Transactional
    public int insertMemberK(Member newMember) {
        String memberPw = newMember.getMemberPw();
        String encPw = bcrypt.encode(memberPw);
        newMember.setMemberPw(encPw);
        int result = memberMapper.insertMember(newMember);
        if(result > 0) {
            int socialResult = memberMapper.kakaoInsertMember(newMember);
            memberMapper.loginLog(newMember.getMemberNo());
            return socialResult;
        }
        return -1;
    }

    @Transactional
    public int updateLocation(String memberId, Coords coords) {
        return memberMapper.updateLocation(memberId, coords);
    }//

    @Transactional
    public int insertMemberN(Member newMember) {
        String memberPw = newMember.getMemberPw();
        String encPw = bcrypt.encode(memberPw);
        newMember.setMemberPw(encPw);
        int result = memberMapper.insertMember(newMember);
        if(result > 0) {
            int socialResult = memberMapper.naverInsertMember(newMember);
            memberMapper.loginLog(newMember.getMemberNo());
            return socialResult;
        }
        return -1;
    }


    public String joinEmail(String authCode) {
        // 1. 타임리프 컨텍스트 생성 (데이터 담는 바구니)
        Context context = new Context();
        context.setVariable("authCode", authCode);

        // 2. templates/email.html 파일을 읽어와 변수를 채운 뒤 String으로 반환
        String htmlContent = templateEngine.process("joinEmail", context);

        return htmlContent;
    }

    public String updateEmail(String mailauthCode) {
        // 1. 타임리프 컨텍스트 생성 (데이터 담는 바구니)
        Context context = new Context();
        context.setVariable("authCode", mailauthCode);

        // 2. templates/email.html 파일을 읽어와 변수를 채운 뒤 String으로 반환
        String htmlContent = templateEngine.process("joinEmail", context);

        return htmlContent;
    }

    public Member selectOne(String memberId) {
        Member member = memberMapper.selectOneMember(memberId);
        return member;
    }

    public Boolean selectPw(Member member) {
        Member loginmember = memberMapper.selectOneMember(member.getMemberId());
        boolean result = bcrypt.matches(member.getMemberPw(), loginmember.getMemberPw());
        return result;
    }

    @Transactional
    public Integer updateMemberPw(Member member) {
        String memberPw = member.getNewMemberPw();
        String encPw = bcrypt.encode(memberPw);
        Integer result = memberMapper.updateMemberPw(member.getMemberId(), encPw);
        return result;
    }

    @Transactional
    public int updateThumbnail(Member m) {
        int result = memberMapper.updateThumbnail(m);
        return result;
    }

    public String changePwEmail(String authCode) {
        Context context = new Context();
        context.setVariable("authCode", authCode);

        String htmlContent = templateEngine.process("changePwEmail", context);

        return htmlContent;
    }

    public int updateEmail(Member member) {
        int result = memberMapper.updateEmail(member);
        return result;
    }
}