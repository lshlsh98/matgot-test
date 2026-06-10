import axios from "axios";
import styles from "./JoinPage.module.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Form.jsx";
import check from "../../assets/check.svg";
import Swal from "sweetalert2";
import { useKakaoPostcode } from "@clroot/react-kakao-postcode";

const Join = () => {
  const navigate = useNavigate();
  const detailRef = useRef();
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberNickname: "",
    memberEmail: "",
    memberAddress: "",
    adContent: 0,
  });
  const [checkId, setCheckId] = useState(0);
  const [checkPw, setCheckPw] = useState(0);
  const [checkPwRe, setCheckPwRe] = useState(0);
  const [memberPwRe, setMemberPwRe] = useState("");
  const inputMember = (e) => {
    const { name, value } = e.target;
    setMember((prev) => ({ ...prev, [name]: value }));
  };
  const [mailAuth, setMailAuth] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");
  const idDupCheck = () => {
    console.log(member);
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/members/exists?memberId=${member.memberId}`,
      )
      .then((res) => {
        console.log(res);
        if (res.data.length === 0) {
          setCheckId(0);
        }
        if (res.data) {
          if (member.memberId === "" || member.memberId == "") {
            return setCheckId(0);
          }
          setCheckId(3);
        } else {
          setCheckId(2);
        }
        const idReg = /^[a-zA-Z0-9]{6,20}$/;
        if (idReg.test(member.memberId)) {
          setCheckId(1);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const pwDupCheck = () => {
    if (member.memberPw === memberPwRe) {
      return setCheckPwRe(1);
    } else {
      return setCheckPwRe(2);
    }
  };
  const pwReg = () => {
    const idReg = /^[a-zA-Z0-9]{8,50}$/;
    if (idReg.test(member.memberPw)) {
      setCheckPw(2);
    } else {
      setCheckPw(1);
    }
  };
  const { open } = useKakaoPostcode({
    onComplete: (data) => {
      setMember((prev) => ({ ...prev, ["memberAddress"]: data.roadAddress }));
      detailRef.current.focus();
    },
  });
  const [time, setTime] = useState(180);
  const [timeout, setTimeout] = useState(null);
  const sendMail = () => {
    if (!member.memberEmail) {
      Swal.mixin({
        toast: true,
        color: "#2b1b17",
        borderRadius: "15px",
        fontWeight: "800",
        padding: "20px 10px",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      }).fire({
        title: "인증 메일전송 실패",
        text: "이메일을 입력해주세요.",
        icon: "error",
      });
    }
    setTime(180);
    if (timeout) {
      window.clearInterval(timeout);
    }
    setMailAuth(1);
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members/email-verification`, {
        memberEmail: member.memberEmail,
      })
      .then((res) => {
        console.log(res);
        setMailAuthCode(res.data.data);
        setMailAuth(2);
        const intervalId = window.setInterval(() => {
          setTime((prev) => {
            return prev - 1;
          });
        }, 1000);
        setTimeout(intervalId);
      })
      .catch((err) => {
        console.error(err);
        Swal.mixin({
          toast: true,
          color: "#2b1b17",
          borderRadius: "15px",
          fontWeight: "800",
          padding: "20px 10px",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        }).fire({
          title: "인증 메일전송 실패",
          text: "올바른 이메일을 입력해주세요.",
          icon: "error",
        });
        setMailAuth(0);
        return;
      });
  };
  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeout);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMailAuthCode(null);
      setTimeout(null);
    }
  }, [time]);
  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };
  const joinMember = () => {
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/members`, member)
      .then((res) => {
        console.log(res);
        if (res.data === 1) {
          Swal.mixin({
            toast: true,
            position: "top-end",
            topLayer: true,
            background: "#ffd95a",
            color: "#2b1b17",
            fontWeight: "600",
            iconColor: "#fff",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          }).fire({
            icon: "success",
            title: "회원가입 성공",
          });
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const [isCheckedAll, setCheckedAll] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    location: false,
    marketing: false,
    email: false,
    sms: false,
  });
  const toggleCheck = (key) => {
    setCheckedAll((prev) => ({
      ...prev,
      [key]: !prev[key], // 클릭된 key(예: 'privacy')의 상태만 반전
    }));
    if (isCheckedAll["marketing"] === true) {
      setMember((prev) => ({
        ...prev,
        ["marketing"]: 3,
      }));
    } else if (isCheckedAll["email"] === true) {
      setMember((prev) => ({
        ...prev,
        ["email"]: 1,
      }));
    } else if (isCheckedAll["sms"] === true) {
      setMember((prev) => ({
        ...prev,
        ["sms"]: 2,
      }));
    }
  };
  const handleToggleAll = () => {
    // 현재 모든 항목이 true인지 확인
    const isAllChecked = Object.values(isCheckedAll).every(
      (val) => val === true,
    );

    // 전부 다 켜져있었다면 전부 false로, 하나라도 꺼져있었다면 전부 true로 세팅
    const nextState = !isAllChecked;

    setCheckedAll({
      all: nextState,
      age: nextState,
      terms: nextState,
      privacy: nextState,
      location: nextState,
      marketing: nextState,
      email: nextState,
      sms: nextState,
    });
  };
  const handleJoin = (e) => {
    e.preventDefault();
    if (
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberName ||
      !member.memberNickname ||
      !member.memberEmail
    ) {
      Swal.mixin({
        toast: true,
        color: "#2b1b17",
        borderRadius: "15px",
        fontWeight: "800",
        padding: "20px 10px",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      }).fire({
        title: "회원가입 실패",
        text: `${member.memberId ? (member.memberPw ? (memberPwRe ? (member.memberName ? (member.memberNickname ? (member.memberEmail ? null : "이메일을 입력하세요.") : "닉네임을 입력하세요") : "이름을 입력하세요.") : "비밀번호를 다시 입력하세요") : "비밀번호를 입력하세요") : "아이디를 입력하세요."}`,
        icon: "error",
      });
      return;
    }

    if (!isCheckedAll.age || !isCheckedAll.terms || !isCheckedAll.privacy) {
      Swal.mixin({
        toast: true,
        color: "#2b1b17",
        borderRadius: "15px",
        fontWeight: "800",
        padding: "20px 10px",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      }).fire({
        title: "회원가입 실패",
        text: "필수약관에 동의해주세요.",
        icon: "error",
      });
      return;
    }

    return joinMember();
  };

  const STIPULATION_TEXT = `1. [필수] 서비스 이용약관
제 1 조 (목적)
본 약관은 "맛집 투어 커뮤니티(이하 '서비스')"가 제공하는 지역별 맛집 리뷰, 맛집 투어 여행 계획 작성 및 커뮤니티 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제 2 조 (회원의 의무 및 게시물 관리)
회원은 본 서비스가 제공하는 맛집 리뷰, 여행 계획 등의 게시물을 작성할 때 타인의 저작권을 침해하거나 허위 사실을 유포해서는 안 됩니다.

서비스 운영진은 광고성 도배글, 욕설, 타인을 비방하는 모욕적인 게시물에 대해 사전 통보 없이 삭제하거나 서비스 이용을 제한할 수 있습니다.

제 3 조 (서비스의 변경 및 중단)
본 서비스는 무료로 제공되는 포트폴리오 및 커뮤니티 서비스로서, 운영진의 사정이나 기술적 필요에 따라 서비스의 전부 또는 일부를 수정하거나 중단할 수 있습니다.

제 4 조 (면책조항)
본 서비스는 회원이 게재한 맛집 리뷰, 평점, 여행 계획 등 정보의 정확성이나 신뢰도에 대해 보증하지 않습니다.

회원이 서비스를 이용하는 과정에서 발생한 회원 간의 분쟁에 대해 운영진은 개입하거나 책임지지 않습니다.

2. [필수] 개인정보 수집 및 이용 동의
1. 개인정보의 수집 및 이용 목적
회원 관리: 회원제 서비스 이용에 따른 본인 식별, 가입 의사 확인, 불량 회원의 부정 이용 방지, 고지사항 전달

서비스 제공: 커뮤니티 게시글(맛집 리뷰, 투어 계획 등) 작성 및 관리, 맞춤형 콘텐츠 제공

2. 수집하는 개인정보 항목
필수 항목: 아이디, 비밀번호, 이메일, 닉네임

3. 개인정보의 보유 및 이용 기간
회원 탈퇴 시 즉시 파기하는 것을 원칙으로 합니다.

단, 서비스 부정 이용 기록(징계 기록 등)은 부정 가입 및 재가입 방지를 위해 탈퇴 후 6개월간 보관 후 파기합니다.

4. 동의를 거부할 권리 및 거부 시 불이익
귀하는 본 개인정보 수집 및 이용에 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부하실 경우 회원가입 및 서비스 이용이 불가능합니다.

3. [선택] 위치기반서비스 이용약관 동의
제 1 조 (목적)
본 약관은 회원이 서비스가 제공하는 지도 API 및 위치기반서비스를 이용함에 있어, 서비스와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제 2 조 (위치정보 이용서비스의 내용)
본 서비스는 사용자의 위치정보(현재 위치, 선택한 지역의 좌표 등)를 활용하여 다음과 같은 서비스를 제공합니다.

지도 위에 지역별 맛집 마커 표시 및 맛집 리뷰 조회

사용자 위치 또는 지정 경로 기반의 맛집 투어 여행 계획 작성 및 시각화

제 3 조 (개인위치정보의 보유 기간 및 파기)
서비스는 사용자의 일회성 현재 위치 확인 기능을 활용할 뿐, 사용자의 실시간 위치 경로를 서버에 지속적으로 저장하거나 축적하지 않습니다.

특정 게시물(맛집 위치 등)에 결합된 위치 정보는 해당 게시물이 삭제될 때 함께 파기됩니다.

제 4 조 (회원의 권리)
회원은 위치정보 이용 동의의 전부 또는 일부를 언제든지 철회할 수 있습니다. 동의를 거부하거나 철회하더라도 지도 기반의 특정 기능을 제외한 일반 커뮤니티 서비스는 정상적으로 이용하실 수 있습니다.

4. [선택] 마케팅 목적 개인정보 수집 및 이용 동의
1. 수집 및 이용 목적
맛집 투어 커뮤니티 내 신규 기능 출시 알림, 이벤트/프로모션 정보 제공, 회원 맞춤형 맛집 큐레이션 및 추천 서비스 제공

2. 수집하는 개인정보 항목
이메일, 닉네임, 서비스 이용 기록

3. 보유 및 이용 기간
회원 탈퇴 시 또는 동의 철회 시까지

4. 동의를 거부할 권리 및 거부 시 불이익
귀하는 마케팅 목적의 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 동의하지 않으셔도 회원가입 및 커뮤니티 이용은 가능하나, 이벤트 안내나 맞춤형 맛집 추천 알림 서비스 등의 이용이 제한될 수 있습니다.`;

  return (
    <div className={styles.wrap}>
      <h1>회원가입</h1>
      <div className={styles.join_wrap}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinMember();
          }}
        >
          <div>
            <div className={styles.inputLabel}>
              <label htmlFor="memberId">아이디</label>
            </div>
            <Input
              type="text"
              id="memberId"
              name="memberId"
              value={member.memberId}
              onChange={inputMember}
              onBlur={idDupCheck}
              required
            />
            {checkId > 0 ? (
              checkId === 1 ? (
                checkId === 2 ? (
                  checkId === 3 && (
                    <div className={styles.idcheckf}>
                      이미 사용 중인 아이디입니다.
                    </div>
                  )
                ) : (
                  <div className={styles.idcheckt}>
                    사용 가능한 아이디입니다.
                  </div>
                )
              ) : (
                <div className={styles.idcheckf}>
                  아이디는 최소 6자 이상 영문과 숫자를 혼합하여주십시오.
                </div>
              )
            ) : null}
          </div>
          <div>
            <div className={styles.inputLabel}>
              <label htmlFor="memberPw">비밀번호</label>
            </div>
            <Input
              type="password"
              id="memberPw"
              name="memberPw"
              value={member.memberPw}
              onChange={inputMember}
              onBlur={pwReg}
              required
            />
            {checkPw > 0 ? (
              checkPw === 1 ? (
                <div className={styles.pwcheckf}>
                  최소 8자 이상 영문과 숫자를 혼합하여주십시오.
                </div>
              ) : null
            ) : null}
          </div>
          <div>
            <div className={styles.inputLabel}>
              <label htmlFor="memberPwRe">비밀번호 확인</label>
            </div>
            <Input
              type="password"
              id="memberPwRe"
              name="memberPwRe"
              value={memberPwRe}
              onChange={(e) => {
                setMemberPwRe(e.target.value);
              }}
              onBlur={pwDupCheck}
              required
            />
            {checkPwRe > 0 &&
              (checkPwRe.length > 0 ? (
                checkPwRe === 1 ? (
                  <div className={styles.pwcheckt}>비밀번호가 일치합니다.</div>
                ) : (
                  <div className={styles.pwcheckf}>
                    비밀번호가 일치하지 않습니다.
                  </div>
                )
              ) : checkPwRe === 2 ? (
                <div className={styles.pwcheckf}>
                  비밀번호가 일치하지 않습니다.
                </div>
              ) : (
                <div className={styles.pwcheckt}>비밀번호가 일치합니다.</div>
              ))}
          </div>
          <div>
            <div className={styles.inputLabel}>
              <label htmlFor="memberName">이름</label>
            </div>
            <Input
              type="text"
              id="memberName"
              name="memberName"
              value={member.memberName}
              onChange={inputMember}
              required
            />
          </div>
          <div>
            <div className={styles.inputLabel}>
              <label htmlFor="memberName">닉네임</label>
            </div>
            <Input
              type="text"
              id="memberNickname"
              name="memberNickname"
              value={member.memberNickname}
              onChange={inputMember}
              required
            />
          </div>
          <div className={styles.input_address}>
            <div className={styles.inputLabel}>
              <label htmlFor="memberAddress">주소</label>
            </div>
            <div>
              <Input
                ref={detailRef}
                type="text"
                id="memberAddress"
                name="memberAddress"
                value={member.memberAddress}
                onChange={inputMember}
                required
              />
              <button type="button" className={styles.submit_s} onClick={open}>
                주소찾기
              </button>
            </div>
          </div>
          <div>
            <div className={styles.inputLabel}>
              <label htmlFor="memberEmail">이메일</label>
            </div>
            <div>
              <Input
                type="text"
                name="memberEmail"
                id="memberEmail"
                value={member.memberEmail}
                onChange={inputMember}
                required
                readOnly={mailAuth === 1 || mailAuth === 3}
              />
            </div>
            <button
              type="button"
              className="btn primary sm"
              onClick={sendMail}
              disabled={mailAuth === 1 || mailAuth === 3}
              className={styles.submit}
            >
              메일전송
            </button>
            {mailAuth > 1 && (
              <div>
                <div className={styles.inputLabel}>
                  <label htmlFor="mailAuthInput">이메일 확인</label>
                </div>
                <div>
                  <Input
                    type="text"
                    name="mailAuthInput"
                    id="mailAuthInput"
                    value={mailAuthInput}
                    onChange={(e) => {
                      setMailAuthInput(e.target.value);
                    }}
                    disabled={mailAuth === 3}
                  />
                  <button
                    className={styles.submit}
                    type="button"
                    onClick={() => {
                      if (mailAuthCode === mailAuthInput) {
                        setMailAuth(3);
                        window.clearInterval(timeout);
                        setTimeout(null);
                      } else {
                        alert("인증코드가 올바르지 않습니다.");
                      }
                    }}
                    disabled={mailAuth === 3}
                  >
                    인증하기
                  </button>
                </div>
                <p className={styles.check_msg}>
                  {mailAuth === 3 ? "인증되었습니다." : showTime()}
                </p>
              </div>
            )}
          </div>
          <div className={styles.horizon}>
            <hr />
          </div>
          <div>
            <div className={styles.stipulation}>
              <div>회원가입 약관 및 동의 항목 안내</div>
              <div className={styles.stipulationbox}>
                <p>{STIPULATION_TEXT}</p>
              </div>
            </div>
            <div className={styles.stipulationcheck}>
              <ul>
                <li>
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className={`${isCheckedAll.all ? `${styles.on}` : `${styles.off}`}`}
                  >
                    <img src={check} alt="체크여부" />
                  </button>
                  <div>전체동의</div>
                </li>
                <li>
                  <button
                    id="age"
                    type="button"
                    onClick={() => toggleCheck("age")}
                    className={`${isCheckedAll.age ? `${styles.on}` : `${styles.off}`}`}
                  >
                    <img src={check} alt="체크여부" />
                  </button>
                  <label htmlFor="age">[필수] 만 14세 이상</label>
                </li>
                <li>
                  <button
                    id="terms"
                    type="button"
                    onClick={() => toggleCheck("terms")}
                    className={`${isCheckedAll.terms ? `${styles.on}` : `${styles.off}`}`}
                  >
                    <img src={check} alt="체크여부" />
                  </button>
                  <label htmlFor="terms">[필수] 서비스 이용약관 동의</label>
                </li>
                <li>
                  <button
                    id="privacy"
                    type="button"
                    onClick={() => toggleCheck("privacy")}
                    className={`${isCheckedAll.privacy ? `${styles.on}` : `${styles.off}`}`}
                  >
                    <img src={check} alt="체크여부" />
                  </button>
                  <label htmlFor="privacy">[필수] 개인정보 처리 동의</label>
                </li>
                <li>
                  <button
                    id="location"
                    type="button"
                    onClick={() => toggleCheck("location")}
                    className={`${isCheckedAll.location ? `${styles.on}` : `${styles.off}`}`}
                  >
                    <img src={check} alt="체크여부" />
                  </button>
                  <label htmlFor="location">[선택] 위치기반 서비스 동의</label>
                </li>
                <li>
                  <button
                    id="marketing"
                    type="button"
                    onClick={() => toggleCheck("marketing")}
                    className={`${isCheckedAll.marketing ? `${styles.on}` : `${styles.off}`}`}
                  >
                    <img src={check} alt="체크여부" />
                  </button>
                  <label htmlFor="marketing">[선택] 마케팅 활용 동의</label>
                </li>
                <ul>
                  <li>
                    <button
                      id="email"
                      type="button"
                      onClick={() => toggleCheck("email")}
                      className={`${isCheckedAll.email ? `${styles.on}` : `${styles.off}`}`}
                    >
                      <img src={check} alt="체크여부" />
                    </button>
                    <label htmlFor="email">[선택] 이메일 수신 동의</label>
                  </li>
                  <li>
                    <button
                      id="sms"
                      type="button"
                      onClick={() => toggleCheck("sms")}
                      className={`${isCheckedAll.sms ? `${styles.on}` : `${styles.off}`}`}
                    >
                      <img src={check} alt="체크여부" />
                    </button>
                    <label htmlFor="sms">[선택] SMS 수신 동의</label>
                  </li>
                </ul>
              </ul>
            </div>
          </div>
          <button type="submit" className={styles.submit} onClick={handleJoin}>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default Join;
