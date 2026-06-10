import styles from "./Main_login.module.css";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import CasinoSharpIcon from "@mui/icons-material/CasinoSharp";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore.js";
import MyCourse from "../../components/main/MyCourse";
import HorizontalFadeScroll from "../../components/main/HorizontalFadeScroll";
import CardTemp from "../../components/main/CardTemp";
import { useNavigate } from "react-router-dom";

const Main_login = () => {
  const [mapTitleStatus, setMapTitleStatus] = useState(0); // 0: 가고 싶은, 1: 다녀왔던
  const [isExpanded, setIsExpanded] = useState(false);

  const { memberId, isReady } = useAuthStore();
  const [myWishList, setMyWishList] = useState([]);
  const [tasteList, setTasteList] = useState([]);
  const [randomRecommendList, setRandomRecommendList] = useState([]);

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  const handleRestaurantClick = (restNo) => {
    if (!restNo) return;
    navigate(`/rest/view/${restNo}`);
  };

  const clickMapTitle = (status) => {
    setMapTitleStatus(status);
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    if (!isReady) return;

    const fetchMainData = async () => {
      try {
        const BACK_URL = import.meta.env.VITE_BACKSERVER;

        if (memberId) {
          const wishRes = await axios.get(`${BACK_URL}/restaurants/my-wish`, {
            params: { memberId },
          });
          const wishData = Array.isArray(wishRes.data) ? wishRes.data : [];
          const mappedWish = wishData.map((item) => ({
            imgName: item.restThumb,
            title: item.restName,
            desc: item.restContent || "등록된 설명이 없습니다.",
            ...item,
          }));
          setMyWishList(mappedWish);
        }

        const tasteRes = await axios.get(
          `${BACK_URL}/restaurants/popular-list`,
        );
        const tasteData = Array.isArray(tasteRes.data) ? tasteRes.data : [];
        const mappedTaste = tasteData.map((item) => ({
          imgName: item.restThumb,
          title: item.restName,
          desc: item.restContent || "등록된 설명이 없습니다.",
          ...item,
        }));
        setTasteList(mappedTaste);

        const allRes = await axios.get(`${BACK_URL}/restaurants/all`);
        const allData = Array.isArray(allRes.data) ? allRes.data : [];
        const mappedAll = allData.map((item) => ({
          imgName: item.restThumb,
          title: item.restName,
          desc: item.restContent || "등록된 설명이 없습니다.",
          ...item,
        }));
        setRandomRecommendList(shuffleArray(mappedAll));
      } catch (error) {
        console.error("메인 페이지 데이터를 불러오는 데 실패했습니다:", error);
      }
    };

    fetchMainData();
  }, [memberId, isReady]);

  useEffect(() => {
    if (!isReady || !memberId) return;

    if (!mapRef.current && window.Tmapv2) {
      mapRef.current = new window.Tmapv2.Map("tmap_container", {
        center: new window.Tmapv2.LatLng(37.5665, 126.978),
        width: "100%",
        height: "100%",
        zoom: 11,
      });
    }

    const fetchMapMarkers = async () => {
      try {
        const BACK_URL = import.meta.env.VITE_BACKSERVER;

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const endpoint =
          mapTitleStatus === 0
            ? `${BACK_URL}/restaurants/my-wish-map`
            : `${BACK_URL}/restaurants/my-visited-map`;

        const res = await axios.get(endpoint, { params: { memberId } });
        const mapData = res.data;

        if (mapData.length === 0) return;

        const bounds = new window.Tmapv2.LatLngBounds();

        mapData.forEach((item) => {
          const markerPosition = new window.Tmapv2.LatLng(
            item.restLat,
            item.restLng,
          );

          const iconUrl =
            mapTitleStatus === 0
              ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
              : "https://pages.daumcdn.net/map_icon/marker_red.png";

          const marker = new window.Tmapv2.Marker({
            position: markerPosition,
            icon: iconUrl,
            iconSize: new window.Tmapv2.Size(24, 35),
            map: mapRef.current,
            title: item.restName,
          });

          const infoWindow = new window.Tmapv2.InfoWindow({
            position: markerPosition,
            content: `
              <div style="
                padding: 6px 10px; 
                font-size: 12px; 
                font-weight: 600; 
                color: #222; 
                background: #fff; 
                border-radius: 6px; 
                border: 1px solid #ff5a5f;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                white-space: normal; 
                word-break: break-all;
                max-width: 150px;
                text-align: center;
              ">
                ${item.restName}
              </div>
            `,
            type: 2,
            align: 7,
            map: null,
          });

          marker.addListener("mouseover", () => {
            infoWindow.setMap(mapRef.current);
          });

          marker.addListener("mouseout", () => {
            infoWindow.setMap(null);
          });

          marker.addListener("click", () => {
            handleRestaurantClick(item.restNo);
          });

          markersRef.current.push(marker);
          bounds.extend(markerPosition);
        });

        mapRef.current.fitBounds(bounds);

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.resize();
            mapRef.current.fitBounds(bounds);
          }
        }, 100);
      } catch (err) {
        console.error("지도 데이터를 가져오는 중 오류 발생:", err);
      }
    };

    fetchMapMarkers();
  }, [mapTitleStatus, memberId, isReady]);

  const visibleRestaurants = isExpanded
    ? randomRecommendList
    : randomRecommendList.slice(0, 8);

  return (
    <div className={styles.tripMainWrap}>
      <div className={styles.topSection}>
        <div className={styles.leftSection}>
          <div className={styles.myCourseSection}>
            <div className={styles.title}>
              <div className={styles.titleIcon}>
                <AddLocationAltIcon />
              </div>
              <div className={styles.titleText}>
                이어서 완성해보세요, 나의 맛집 코스!
              </div>
            </div>
            <div className={styles.myCourseContent}>
              <MyCourse />
            </div>
          </div>

          <div className={styles.myListSection}>
            <div className={styles.title}>
              <div className={styles.titleIcon}>
                <FormatListBulletedIcon />
              </div>
              <div className={styles.titleText}>
                놓칠 수 없는 나의 먹킷리스트
              </div>
            </div>
            <div className={styles.myListContent}>
              {myWishList.length === 0 ? (
                <div className={styles.emptyListText}>
                  아직 찜한 식당이 없습니다. 마음에 드는 식당을 추가해 보세요!
                </div>
              ) : (
                <HorizontalFadeScroll
                  items={myWishList}
                  onCardClick={(id) => handleRestaurantClick(id)}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.mapSection}>
          <div className={styles.mapTitle}>
            <div
              className={`${styles.mapTitleWish} ${mapTitleStatus === 0 ? "" : styles.nonActiveMapTitle}`}
              onClick={() => clickMapTitle(0)}
            >
              가고 싶은
            </div>
            <div className={styles.mapTitleDivider}>|</div>
            <div
              className={`${styles.mapTitleVisited} ${mapTitleStatus === 1 ? "" : styles.nonActiveMapTitle}`}
              onClick={() => clickMapTitle(1)}
            >
              다녀왔던
            </div>
          </div>
          <div className={styles.mapContainer}>
            <div id="tmap_container" className={styles.map}></div>
          </div>
        </div>
      </div>

      <div className={styles.tasteRestaurantSection}>
        <div className={styles.title}>
          <div className={styles.titleIcon}>
            <AdsClickIcon />
          </div>
          <div className={styles.titleText}>
            유저들이 검증한 취향저격 인기 맛집
          </div>
        </div>
        <div className={styles.tasteRestaurantContent}>
          <HorizontalFadeScroll
            items={tasteList}
            onCardClick={(id) => handleRestaurantClick(id)}
          />
        </div>
      </div>

      <div className={styles.howAboutHereSection}>
        <div className={styles.title}>
          <div className={styles.titleIcon}>
            <CasinoSharpIcon />
          </div>
          <div className={styles.titleText}>오늘은 이 식당 어떠세요?</div>
        </div>

        <div
          className={`${styles.howAboutHereContent} ${!isExpanded ? styles.isCollapsed : ""}`}
        >
          <div className={styles.howAboutHereList}>
            {visibleRestaurants.map((item, index) => (
              <div
                key={`howAbout-${index}`}
                onClick={() => handleRestaurantClick(item.restNo)}
                style={{ cursor: "pointer" }}
              >
                <CardTemp item={item} />
              </div>
            ))}
          </div>

          {randomRecommendList.length > 8 && !isExpanded && (
            <div className={styles.fadeOverlayBottom}></div>
          )}

          {randomRecommendList.length > 8 && (
            <div className={styles.buttonContainer}>
              <button
                className={styles.moreButton}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    접기 <span className={styles.arrowIcon}>▲</span>
                  </>
                ) : (
                  <>
                    더보기 <span className={styles.arrowIcon}>▼</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main_login;
