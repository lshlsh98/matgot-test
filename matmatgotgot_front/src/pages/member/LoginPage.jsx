import axios from "axios";
import styles from "./LoginPage.module.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../store/useAuthStore";
import googlelogo from "../../assets/logo/google.svg";
import kakaologo from "../../assets/logo/kakao.svg";
import naverlogo from "../../assets/logo/naver.svg";
import { Input } from "../../components/ui/Form.jsx";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const [members, setMembers] = useState({ memberId: "", memberPw: "" });
  const inputMember = (e) => {
    setMembers({ ...members, [e.target.name]: e.target.value });
  };

  // 일반로그인
  const login = useAuthStore((state) => state.login);
  const memberId = useAuthStore((state) => state.memberId);
  const token = useAuthStore((state) => state.token);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/members/login`,
        {
          memberId: members.memberId,
          memberPw: members.memberPw,
        },
      );

      console.log("백엔드가 보내준 로그인 응답 데이터:", response.data);

      // 백엔드에서 준 응답 데이터(memberId, token, memberNickname 등)
      if (response.data) {
        // 🔥 여기서 스토어의 login을 실행해야 localStorage에 "auth-key"가 생성됩니다!
        login(response.data);
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
          title: "로그인 성공",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
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
        title: "로그인 실패",
        text: "아이디 또는 비밀번호를 확인하세요.",
        icon: "error",
      });
    }
  };

  // 구글 로그인
  const googleLogin = useGoogleLogin({
    // 구글로부터 '인가 코드(code)'를 받아오는 방식 설정
    flow: "auth-code",
    // ux_mode: "redirect",
    // redirect_uri: `${import.meta.env.VITE_FRONTSERVER}/login`,
    onSuccess: async (codeResponse) => {
      console.log("구글 인가 코드:", codeResponse.code);

      // 백엔드 서버로 인가 코드 전송
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKSERVER}/members/login/google`,
          { code: codeResponse.code },
          { withCredentials: true }, // 아까 설정한 쿠키 공유 옵션!
        );

        console.log("로그인 성공:", res.data);
        const googleUser = res.data;

        useAuthStore.getState().login({
          memberId: googleUser.id, // 구글 이메일을 아이디로 활용
          memberNickname: googleUser.name, // '김가연'
          memberThumb: googleUser.picture, // 구글 프로필 이미지 URL
          admin: false, // 일반 유저
          token: token, // 임시 세션 토큰 (백엔드 토큰 없을 시)
          endTime: new Date().getTime() + 3600000, // 타이머용 만료 시간 (지금으로부터 1시간 뒤 예시)
        });

        if (res.status === 200) {
          navigate("/");
        }
      } catch (err) {
        console.error("백엔드 전송 실패:", err);
      }
    },
    onError: () => console.log("구글 로그인 실패"),
  });

  // 카카오톡 로그인
  const KakaoLogin = () => {
    const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

    if (!REST_API_KEY || !REDIRECT_URI) {
      throw new Error(".env 파일에서 환경변수를 불러오지 못했습니다.");
    }

    // 카카오 인증 페이지 URL
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${import.meta.env.VITE_KAKAO_REST_API_KEY}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}`;

    window.location.href = kakaoAuthUrl;
  };

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const isCallbackMode = Boolean(code);

  const getKakaoUserInfo = async (accessToken) => {
    try {
      const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      console.log("🎉 카카오 사용자 정보 획득:", response.data);

      const kakaoEmail = response.data.kakao_account?.email;
      const kakaoNickname = response.data.properties?.nickname;
      const kakaoThumb = response.data.properties?.thumbnail_image;

      if (kakaoEmail) {
        console.log("사용자 이메일:", kakaoEmail);
        console.log("사용자 닉네임:", kakaoNickname);
        console.log("사용자 프로필:", kakaoThumb);

        console.log("🚀 백엔드로 보낼 준비 완료!");

        // 우리 스프링 백엔드 서버로 POST 요청
        const res = await axios.post(
          `${import.meta.env.VITE_BACKSERVER}/members/login/kakao`,
          {
            memberEmail: kakaoEmail,
            memberNickname: kakaoNickname,
            memberThumb: kakaoThumb,
          },
        );

        console.log("✅ 백엔드 응답 성공:", res.data);

        useAuthStore.getState().login({
          memberId: res.data.memberId,
          memberNickname: res.data.memberNickname || "카카오유저",
          memberThumb: res.data.memberThumb || null,
          admin: false,
          token: res.data.token,
          endTime: new Date().getTime() + 3600000, // 1시간 타이머
        });

        // 백엔드 데이터베이스 저장까지 정상 완료된 것을 확인하고 메인 홈으로 이동!
        navigate("/");
      } else {
        console.log(
          "이메일 정보가 없습니다. (카카오 로그인 시 이메일 동의 안 함)",
        );
        alert("이메일 제공 동의가 필요합니다.");
      }
    } catch (error) {
      console.error(
        "사용자 정보 요청 또는 백엔드 전송 실패:",
        error.response ? error.response.data : error.message,
      );
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  const getKakaoToken = async (authorizeCode) => {
    try {
      console.log("🔑 인가 코드로 토큰 요청 시작. 코드:", authorizeCode);

      const body = new URLSearchParams();
      body.append("grant_type", "authorization_code");
      body.append("client_id", import.meta.env.VITE_KAKAO_REST_API_KEY);
      body.append("redirect_uri", import.meta.env.VITE_KAKAO_REDIRECT_URI);

      if (import.meta.env.VITE_KAKAO_CLIENT_SECRET) {
        body.append("client_secret", import.meta.env.VITE_KAKAO_CLIENT_SECRET);
      }
      body.append("code", authorizeCode);

      const response = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        body,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        },
      );

      console.log("🎉 카카오 토큰 발급 성공:", response.data);

      // 토큰을 정상적으로 받았으므로 다음 단계인 이메일/백엔드 전송 실행
      getKakaoUserInfo(response.data.access_token);
    } catch (error) {
      console.error(
        "토큰 요청 실패:",
        error.response ? error.response.data : error.message,
      );
      alert("카카오 로그인 인증에 실패했습니다.");
    }
  };

  useEffect(() => {
    // 2. useEffect 안에서는 setState를 호출하지 않고, 오직 '외부 API 호출(Side Effect)'만 수행합니다.
    if (code) {
      console.log("카카오 인가 코드 획득 성공:", code);
      getKakaoToken(code); // 토큰 요청 실행
    }
  }, []); // 의존성 배열을 비워두거나 [code]를 넣어 최초 1회만 실행되도록 격리

  // 네이버 로그인
  // 💡 1. 함수 앞에 반드시 async를 붙여줍니다!
  const naverLogin = async () => {
    const CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const REDIRECT_URI = encodeURIComponent(
      "http://localhost:5173/login/oauth2/code/naver",
    );

    try {
      // 💡 2. 앞에 await을 붙이고, 뒤에 .data를 붙여서 '진짜 데이터(문자열)'만 쏙 꺼냅니다.
      const response = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/members/ranchar`,
      );
      const STATE = response.data; // 백엔드가 준 랜덤 문자열 (예: "test")

      console.log("🎯 백엔드에서 받아온 안전한 STATE 값:", STATE);

      // 3. 이제 완벽한 문자열이 된 STATE를 주소창에 조립합니다.
      const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;

      // 4. 주소 이동
      window.location.assign(NAVER_AUTH_URL);
    } catch (error) {
      console.error(
        "🚨 백엔드에서 랜덤 문자열(state)을 가져오는데 실패했습니다:",
        error,
      );
      alert("로그인 세션 생성 실패. 다시 시도해주세요.");
    }
  };

  // 애플 로그인(상황에 따라 생략 가능성 높음)

  console.log("아이디: ", memberId, "\n토큰: ", token);

  return (
    <>
      <div>
        {isCallbackMode ? (
          // 주소창에 code가 있을 때 (토큰 요청 중인 빈 화면 상태)
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <h3>카카오 로그인 처리 중입니다...</h3>
            <p>잠시만 기다려주세요.</p>
          </div>
        ) : (
          <div className={styles.wrap}>
            <h1>로그인</h1>
            <div className={styles.login_wrap}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                autoComplete="off"
              >
                <div>
                  <div className={styles.inputLabel}>
                    <label htmlFor="memberId">아이디</label>
                  </div>
                  <Input
                    type="text"
                    id="memberId"
                    name="memberId"
                    value={members.memberId}
                    onChange={inputMember}
                  />
                </div>

                <div>
                  <div className={styles.inputLabel}>
                    <label htmlFor="memberPw">비밀번호</label>
                  </div>
                  <Input
                    type="password"
                    id="memberPw"
                    name="memberPw"
                    value={members.memberPw}
                    onChange={inputMember}
                  />
                </div>
                <Link to={"/finding"}>
                  <div className={styles.idpw}>아이디/비밀번호 찾기</div>
                </Link>
                <button type="submit" className={styles.submit}>
                  로그인
                </button>
              </form>
              <div className={styles.social_wrap}>
                <p>소셜 로그인</p>
                <div className={styles.social}>
                  <button onClick={googleLogin}>
                    <img src={googlelogo} alt="google login" />
                  </button>
                  <button onClick={KakaoLogin}>
                    <img src={kakaologo} alt="kakaotalk login" />
                  </button>
                  <button onClick={naverLogin}>
                    <img src={naverlogo} alt="naver login" />
                  </button>
                </div>
              </div>
              <div className={styles.horizon}>
                <hr />
              </div>
              <div className={styles.signup}>
                <Link to={"/signup"}>
                  <p>아직 회원이 아니신가요?</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
