package com.twotwo.matmatgotgot.domain.member.mapper;

import com.twotwo.matmatgotgot.domain.member.entity.Member;
import com.twotwo.matmatgotgot.domain.restaurant.entity.Coords;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MemberMapper {

	List<Member> selectAll();

    Integer insertMember(Member member);

    Member selectOneMember(String memberId);

    Member selectOneMemberByEmail(String email);

    int googleInsertMember(Member newMember);

    int loginLog(Long memberNo);

    int logoutLog(Long memberNo);

    int kakaoInsertMember(Member newMember);

    int updateLocation(@Param("memberId") String memberId,
                       @Param("coords") Coords coords);

    int naverInsertMember(Member newMember);

    Member searchId(String memberId);

    Integer updateMemberPw(@Param("memberId") String memberId, @Param("encPw") String encPw);

    int updateThumbnail(Member m);

    int updateEmail(Member member);
}
