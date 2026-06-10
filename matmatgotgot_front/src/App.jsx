import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import "./App.css";
import axios from "axios";
import Header from "./components/commons/Header.jsx";
import Footer from "./components/commons/Footer.jsx";
import LoginPage from "./pages/member/LoginPage.jsx";
import JoinPage from "./pages/member/JoinPage.jsx";
import { MypagePage } from "./pages/member/MypagePage.jsx";
import RestaurantDetailSearch from "./pages/restaurant/RestaurantDetailSearch.jsx";
import RestaurantRegist from "./pages/restaurant/RestaurantRegist.jsx";
import RestaurantView from "./pages/restaurant/RestaurantView.jsx";
import ReviewRegist from "./pages/restaurant/ReviewRegist.jsx";
import ReviewView from "./pages/restaurant/ReviewView.jsx";
import TripMain from "./pages/trip/TripMain.jsx";
import ReceiptCheck from "./pages/restaurant/ReceiptCheck.jsx";
import NaverCallbackPage from "./pages/member/NaverCallbackPage.jsx";
import Finding from "./pages/member/Finding.jsx";
import BoardListPage from "./pages/board/BoardListPage";
import BoardWritePage from "./pages/board/BoardWritePage";
import BoardViewPage from "./pages/board/BoardViewPage.jsx";
import NaverSearch from "./pages/board/NaverSearch.jsx";
import BoardAddress from "./pages/board/BoardAddress.jsx";
import BoardModifyPage from "./pages/board/BoardModifyPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import Main from "./pages/main/Main.jsx";
import Main_login from "./pages/main/Main_login.jsx";
import CreateCourse from "./pages/trip/CreateCourse.jsx";
import CourseDetail from "./pages/trip/CourseDetail.jsx";
import EditCourse from "./pages/trip/EditCourse.jsx";
import ReportModal from "./components/ui/ReportModal.jsx";
import RestaurantModify from "./pages/restaurant/RestaurantModify.jsx";
import ReviewModify from "./pages/restaurant/ReviewModify.jsx";
import Notice from "./pages/else/Notice.jsx";
import Faq from "./pages/else/Faq.jsx";
import Inquiry from "./pages/else/Inquiry.jsx";
import Terms from "./pages/else/Terms.jsx";
import Privacy from "./pages/else/Privacy.jsx";
import LocationTerms from "./pages/else/LocationTerms.jsx";

function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // console.log("새로고침 후 Axios 헤더 세팅 완료", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      // console.log("Axios Authorization 헤더 제거 완료");
    }
  }, [token]);

  return (
    <div className="wrap">
      <Header />
      <div className="main">
        <Routes>
          <Route path="/" element={token ? <Main_login /> : <Main />} />
          <Route path="/test" element={<Main_login />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<JoinPage />} />
          <Route path="/finding" element={<Finding />} />
          <Route
            path="/login/oauth2/code/naver"
            element={<NaverCallbackPage />}
          />
          <Route path="/rest" element={<RestaurantDetailSearch />} />
          <Route path="/finding" element={<Finding />} />
          <Route path="/rest/regist" element={<RestaurantRegist />} />
          <Route path="/rest/view/:restNo" element={<RestaurantView />} />
          <Route
            path="/rest/review/regist/:restNo"
            element={<ReviewRegist />}
          />
          <Route path="/rest/review/view/:reviewNo" element={<ReviewView />} />
          <Route path="/receipt/:mode/:restNo?" element={<ReceiptCheck />} />
          <Route path="/rest/modify/:restNo" element={<RestaurantModify />} />
          <Route
            path="/review/modify/:reviewNo/:restNo"
            element={<ReviewModify />}
          />

          <Route path="/mypage/myinfo" element={<MypagePage />} />
          <Route path="/mypage/myreview" element={<MypagePage />} />
          <Route path="/mypage/zzim" element={<MypagePage />} />
          <Route path="/mypage/matzip" element={<MypagePage />} />
          <Route path="/mypage/likeposts" element={<MypagePage />} />
          <Route path="/mypage/myposts" element={<MypagePage />} />
          <Route path="/mypage/reportposts" element={<MypagePage />} />
          <Route path="/mypage/myask" element={<MypagePage />} />
          <Route path="/mypage/myinfo/changePw" element={<MypagePage />} />
          <Route path="/mypage/myinfo/changeEmail" element={<MypagePage />} />

          <Route path="/board/list" element={<BoardListPage />} />
          <Route path="/board/write" element={<BoardWritePage />} />
          <Route path="/board/view/:boardNo" element={<BoardViewPage />} />
          <Route path="/boardNavermap" element={<NaverSearch />} />
          <Route path="/boardAddress" element={<BoardAddress />} />
          <Route path="/board/modify/:boardNo" element={<BoardModifyPage />} />
          <Route path="/trip" element={<TripMain />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/trip/create" element={<CreateCourse />} />
          <Route path="/trip/edit/:tplan_no" element={<EditCourse />} />
          <Route path="/trip/detail/:tplan_no" element={<CourseDetail />} />

          <Route path="/notice" element={<Notice />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/qna" element={<Inquiry />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/location" element={<LocationTerms />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
