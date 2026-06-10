import { useState, useEffect } from "react";
import styles from "./ReviewViewInfo.module.css";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ReviewViewInfo = ({ review }) => {
  // review 데이터가 아직 없을 때 렌더링 생략
  if (!review) return null;

  const imgBaseUrl = import.meta.env.VITE_BACKSERVER;

  // 이미지 배열 (없으면 빈 배열)
  const images = review.images ?? [];

  // 별점 렌더링 헬퍼
  const renderStars = (rating = 0) =>
    [1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={n <= rating ? styles.star_filled : styles.star_empty}
      >
        ★
      </span>
    ));

  return (
    <>
      {/* ── 작성자 정보 ── */}
      <div className={styles.writer_info}>
        <div className={styles.review_writer}>
          {/* 프로필 이미지 / 기본 아이콘 */}
          <div
            className={`${styles.member_thumb} ${
              review.memberThumb ? styles.thumb_exists : styles.thumb_default
            }`}
          >
            {review.memberThumb ? (
              <img src={`${review.memberThumb}`} alt="프로필 이미지" />
            ) : (
              ""
            )}
          </div>

          {/* 이름 + 현지인 뱃지 */}
          <div className={styles.name_badge_row}>
            <span className={styles.member_name}>{review.memberName}</span>
            {review.isLocal && (
              <span className={styles.member_badge}>현지인</span>
            )}
          </div>
        </div>
        <div className={styles.rest_info}>
          <div className={styles.rest_name}>{review.restName}</div>
          <div className={styles.rest_addr}>{review.restAddr}</div>
        </div>
      </div>

      {/* ── 사진 Swiper 캐러셀 ── */}
      {review.images.length > 0 && (
        <div className={styles.photo_swiper}>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={review.images.length > 1} /* 좌우 화살표 버튼 */
            pagination={{ clickable: true }} /* 하단 도트 */
            spaceBetween={0}
            slidesPerView={1}
          >
            {review.images.map((image, idx) => (
              <SwiperSlide key={idx}>
                <img
                  className={styles.swiper_img}
                  src={`${image}`}
                  alt="리뷰 이미지"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* ── 리뷰 내용 ── */}
      <div className={styles.content}>{review.reviewContent}</div>

      {/* ── 태그 ── */}
      {review.tags && review.tags.length > 0 && (
        <div className={styles.tags}>
          {review.tags.map((tag, i) => (
            <span key={i} className={styles.tag_item}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── 방문 정보 (방문일 / 메뉴 / 별점) ── */}
      <div className={styles.review_meta}>
        {/* 방문일 */}
        <div className={styles.meta_item}>
          <p className={styles.meta_label}>방문일</p>
          <p className={styles.meta_value}>{review.reviewVisit}</p>
        </div>

        {/* 메뉴 */}
        <div className={styles.meta_item}>
          <p className={styles.meta_label}>메뉴</p>
          <p className={styles.meta_value}>{review.reviewMenu?.join(", ")}</p>
        </div>

        {/* 별점 — grid에서 full-width 배치 (meta_full 클래스) */}
        <div className={`${styles.meta_item} ${styles.meta_full}`}>
          <p className={styles.meta_label}>별점</p>
          <p className={styles.meta_value}>{renderStars(review.rating)}</p>
        </div>
      </div>
    </>
  );
};

export default ReviewViewInfo;
