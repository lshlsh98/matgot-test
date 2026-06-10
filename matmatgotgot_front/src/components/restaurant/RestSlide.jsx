import styles from "./RestSlide.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRef } from "react";
import RestaurantItem from "./RestaurantItem";

const RestSlide = ({ list }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div>
      <div className={styles.swiperContainer}>
        <button
          ref={prevRef}
          className={`${styles.customArrow} ${styles.prevArrow}`}
        >
          <ArrowBackIosNewIcon />
        </button>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16} /* 카드 간격 16px */
          slidesPerView={4} /* 한 번에 4장 표시 */
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          className={styles.mySwiper}
        >
          {list.map((rest) => (
            <SwiperSlide key={rest.restNo} className={styles.mySlide}>
              <RestaurantItem
                key={`${rest.restNo}`}
                rest={rest}
              ></RestaurantItem>
            </SwiperSlide>
          ))}
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

export default RestSlide;
