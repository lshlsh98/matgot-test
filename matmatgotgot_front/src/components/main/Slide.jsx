import styles from "./Slide.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";

const Slide = ({ text, list = [], type }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const navigate = useNavigate();
  const [swiperNav, setSwiperNav] = useState(false);
  const { memberId } = useAuthStore();

  useEffect(() => {
    if (prevRef.current && nextRef.current) {
      setSwiperNav(true);
    }
  }, [list]);

  const handleCardClick = (id) => {
    if (!memberId) {
      alert("로그인 후 이용해 주세요.");
      return;
    }

    if (type === "review") {
      navigate(`/board/detail/${id}`);
    } else if (type === "tour") {
      navigate(`/trip/detail/${id}`);
    }
  };

  if (list.length === 0) {
    return (
      <div>
        <div className={styles.swiperTitle}>{text}</div>
        <div className={styles.swiperContainer}>
          <div className={styles.emptyContainer}>
            <div className={styles.emptyText}>
              등록된 {type === "tour" ? "투어 코스가" : "리뷰 게시글이"}{" "}
              없습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.swiperTitle}>{text}</div>
      <div className={styles.swiperContainer}>
        <button
          ref={prevRef}
          className={`${styles.customArrow} ${styles.prevArrow}`}
        >
          <ArrowBackIosNewIcon />
        </button>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={list.length < 4 ? list.length : 4}
          navigation={
            swiperNav
              ? {
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }
              : false
          }
          className={styles.mySwiper}
        >
          {list.map((item) => {
            const id = item.boardNo || item.tplanNo;
            const title = item.boardTitle || item.tplanTitle;
            const BACK_URL = import.meta.env.VITE_BACKSERVER;

            let thumb = null;

            if (type === "review") {
              if (item.boardThumb) {
                thumb = item.boardThumb.startsWith("http")
                  ? item.boardThumb
                  : `${BACK_URL}/editor/${item.boardThumb}`;
              } else {
                thumb = `${BACK_URL}/menu/basic.jpeg`;
              }
            } else if (type === "tour") {
              if (item.menuImg) {
                thumb = item.menuImg.startsWith("http")
                  ? item.menuImg
                  : `${BACK_URL}/menu/${item.menuImg}`;
              } else {
                thumb = `${BACK_URL}/menu/basic.jpeg`;
              }
            }

            const subText =
              type === "tour" ? item.tplanRegion : `❤️ ${item.likeCount || 0}`;

            return (
              <SwiperSlide
                key={id}
                className={styles.mySlide}
                onClick={() => handleCardClick(id)}
                style={
                  thumb
                    ? {
                        backgroundImage: `url(${thumb})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              >
                <div className={styles.cardOverlay}>
                  <div className={styles.cardTitle}>{title}</div>
                  <div className={styles.cardSub}>{subText}</div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          ref={nextRef}
          className={`${styles.customArrow} ${styles.nextArrow}`}
        >
          <ArrowForwardIosIcon />
        </button>
      </div>
    </div>
  );
};

export default Slide;
