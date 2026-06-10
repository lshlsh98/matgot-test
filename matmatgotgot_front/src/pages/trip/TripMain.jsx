import ListFrame from "../../components/trip/ListFrame";
import styles from "./TripMain.module.css";
import MapSharpIcon from "@mui/icons-material/MapSharp";
import FavoriteSharpIcon from "@mui/icons-material/FavoriteSharp";
import LocalFireDepartmentSharpIcon from "@mui/icons-material/LocalFireDepartmentSharp";
import CourseCollect from "../../components/trip/CourseCollect";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";

const TripMain = () => {
  const [myPlans, setMyPlans] = useState([]);
  const [favoritePlans, setFavoritePlans] = useState([]);
  const [top10Plans, setTop10Plans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { memberNo, isReady } = useAuthStore();

  useEffect(() => {
    if (isReady) {
      if (!memberNo) {
        alert("로그인이 필요한 서비스입니다. 메인 페이지로 이동합니다.");
        navigate("/");
      }
    }
  }, [isReady, memberNo, navigate]);

  useEffect(() => {
    if (!memberNo) return;

    const fetchTripData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/main`,
          {
            params: { memberNo: memberNo },
          },
        );

        const {
          myPlans = [],
          favoritePlans = [],
          top10Plans = [],
          allPlans = [],
        } = response.data ?? {};

        const defaultImg = "default_thumbnail.png";
        const mapDefaultImage = (list) =>
          list.map((item) => ({
            ...item,
            imgName: item.imgName ? item.imgName : defaultImg,
            desc: item.desc ? item.desc : "등록된 설명이 없습니다.",
          }));

        setMyPlans(mapDefaultImage(myPlans));
        setFavoritePlans(mapDefaultImage(favoritePlans));
        setTop10Plans(mapDefaultImage(top10Plans));
        setAllPlans(mapDefaultImage(allPlans));
      } catch (error) {
        console.error("여행 코스 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [memberNo]);

  const iconTexts = [
    { icon: <MapSharpIcon />, title: "내가 만든 코스" },
    { icon: <FavoriteSharpIcon />, title: "내가 찜한 코스" },
    {
      icon: <LocalFireDepartmentSharpIcon />,
      title: "맛곳러들의 추천 코스 TOP10",
    },
  ];

  if (!isReady || !memberNo || loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.tripMainWrap}>
      <ListFrame order={0} iconText={iconTexts[0]} items={myPlans} />
      <ListFrame order={1} iconText={iconTexts[1]} items={favoritePlans} />
      <ListFrame order={2} iconText={iconTexts[2]} items={top10Plans} />
      <CourseCollect items={allPlans} />
    </div>
  );
};

export default TripMain;
