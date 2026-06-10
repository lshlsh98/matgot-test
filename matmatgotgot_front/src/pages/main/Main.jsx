import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Main.module.css";
import mainFoodImg from "../../assets/main/main-food.png";
import mainTripImg from "../../assets/main/main-img-1.png";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Slide from "../../components/main/Slide";

const Main = () => {
  const [bestReviews, setBestReviews] = useState([]);
  const [bestTours, setBestTours] = useState([]);

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const serverUrl = import.meta.env.VITE_BACKSERVER;

        const [reviewRes, tourRes] = await Promise.all([
          axios.get(`${serverUrl}/main/best-reviews`),
          axios.get(`${serverUrl}/main/best-tours`),
        ]);

        setBestReviews(reviewRes.data);
        setBestTours(tourRes.data);
      } catch (error) {
        console.error("메인 슬라이드 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchMainData();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.mainFoodImg}>
        <img src={mainFoodImg} alt="메인 음식 이미지" />
        <div className={styles.mainFoodImgCover}></div>
        <div className={styles.foodTitleWrapper}>
          <h1>맛있는 여행의 시작, 맛맛곳곳</h1>
          <p>금강산도 식후경, 완벽한 여행은 한 끼의 미식으로부터</p>
          <div className={styles.scrollNotice}>
            <span>아래로 스크롤하여 코스 짜기</span>
            <ArrowDownwardIcon className={styles.arrowIcon} />
          </div>
        </div>
      </div>

      <div className={styles.mainTripImg}>
        <img src={mainTripImg} alt="메인 여행 이미지" />
      </div>

      <div className={styles.tripTextDev}>
        <div className={styles.emptyLogoSpace}></div>
        <div className={styles.tripText2}>내 동선에 맛집을 더하다</div>
      </div>

      <div className={styles.descContainer}>
        <div className={styles.desc}>
          <div className={styles.descLeft}>
            <div className={styles.descTitle}>
              <div className={styles.titleEmoji}>
                <RestaurantIcon />
              </div>
              <div className={styles.titleText}>스마트 맛집 탐방</div>
            </div>
            <div className={styles.descContent}>
              <h4>유저들이 검증한 진짜 맛집 목록</h4>
              <p>
                광고에 지친 당신을 위한 실시간 별점 리뷰 및 현지인 추천 식당
                리스트를 자유롭게 탐색해 보세요.
              </p>
            </div>
          </div>

          <div className={styles.descRight}>
            <div className={styles.descTitle}>
              <div className={styles.titleEmoji}>
                <ModeOfTravelIcon />
              </div>
              <div className={styles.titleText}>커스텀 식도락 코스</div>
            </div>
            <div className={styles.descContent}>
              <h4>동선을 고려한 원클릭 일정 설계</h4>
              <p>
                가고 싶은 식당들을 지도상에서 순서대로 매칭하여 최적의 이동
                거리와 시간을 자동으로 계산해 줍니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainTripDev}></div>

      <div className={styles.mainReviewDev}>
        <div className={styles.slideSection}>
          <Slide
            text="🔥 지금 떠오르는 베스트 리뷰"
            list={bestReviews}
            type="review"
          />
        </div>
        <div className={styles.slideSection}>
          <Slide
            text="🗺️ 유저들이 추천하는 인기 코스"
            list={bestTours}
            type="tour"
          />
        </div>
      </div>
    </div>
  );
};

export default Main;
