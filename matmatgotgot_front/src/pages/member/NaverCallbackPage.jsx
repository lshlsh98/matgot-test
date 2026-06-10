import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";

const NaverCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // 💡 리액트 StrictMode로 인해 API가 두 번 연속 호출되는 것을 방지하는 안전장치
  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;

    // 1. 주소창에서 동기 방식으로 code와 state를 순수 텍스트로 안전하게 뽑아냅니다.
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("🎯 [콜백페이지] 추출된 네이버 인가 코드:", code);
    console.log("🎯 [콜백페이지] 추출된 네이버 상태 값:", state);

    if (code && state) {
      isProcessed.current = true;

      // 2. 백엔드로 순수한 문자열 값을 명확하게 객체에 실어 보냅니다.
      axios.post("http://localhost:9999/members/login/naver", {
        code: code,
        state: state
      })
      .then((res) => {
        console.log("✅ 백엔드 네이버 로그인 성공:", res.data);
        
        // TODO: 가연님의 Zustand 스토어 로그인 처리 로직을 여기에 넣어주세요!
        useAuthStore.getState().login({
          memberId: res.data.memberId,
          memberNickname: res.data.memberNickname || "네이버유저",
          memberThumb: res.data.memberThumb || null,
          admin: false,
          token: res.data.token,
          endTime: new Date().getTime() + 3600000 // 1시간 타이머
        });

        navigate("/"); // 메인 화면으로 이동
      })
      .catch((err) => {
        console.error("🚨 백엔드 전송 실패:", err);
        alert("로그인 처리 중 오류가 발생했습니다.");
        navigate("/login");
      });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>네이버 로그인 처리 중입니다...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
};

export default NaverCallbackPage;