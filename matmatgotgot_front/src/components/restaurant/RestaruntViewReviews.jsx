import styles from "./RestaruntViewReviews.module.css";
import Pagination from "../../components/ui/Pagination";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RestaruntViewReviews = ({ restNo }) => {
  const [reviewList, setRivewList] = useState([]);
  const [reviewsCnt, setReviewsCnt] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(4); // 한 페이지에 보여줄 리뷰 수
  const [totalPage, setTotalPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 리뷰 목록 조회
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/reviews?page=${page}&size=${size}&restNo=${restNo}`,
      )
      .then((res) => {
        console.log(res.data.list);
        setRivewList(res.data.list);
        setReviewsCnt(res.data.reviewsCnt);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page]);

  return (
    <>
      {/* 리뷰 수 헤더 */}
      <div className={styles.review_top}>
        <div className={styles.review_count}>리뷰 수 {reviewsCnt}개</div>
        <div className={styles.btn_zone_reviews}>
          <button
            type="button"
            onClick={() => {
              navigate(`/receipt/review/${restNo}`);
            }}
          >
            리뷰 작성하기
          </button>
        </div>
      </div>

      {/* 리뷰 카드 그리드 (2열) */}
      <div className={styles.review_wrap}>
        {reviewList.map((review) => (
          <ReviewItem key={review.reviewNo} review={review} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination_wrap}>
        <Pagination
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          naviSize={5}
        />
      </div>
    </>
  );
};

const ReviewItem = ({ review }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.review_item}
      onClick={() => {
        navigate(`/rest/review/view/${review.reviewNo}`);
      }}
    >
      {/* 작성자 정보: 아바타 + 이름 + 현지인 뱃지 + 별점 */}
      <div className={styles.review_writer}>
        {/* 프로필 이미지: 없으면 기본 회색 원 표시 */}
        <div
          className={`${styles.member_thumb} ${review.writerThumb ? styles.thumb_exists : styles.thumb_default}`}
        >
          {review.writerThumb && (
            <img
              src={`${import.meta.env.VITE_BACKSERVER}/member/thumb/${review.writerThumb}`}
              alt="프로필 이미지"
            />
          )}
        </div>

        <div className={styles.writer_info}>
          {/* 이름 + 현지인 뱃지 행 — 현지인 뱃지 추가 */}
          <div className={styles.name_badge_row}>
            <span className={styles.member_name}>{review.writer}</span>
            {/* 현지인 여부에 따라 뱃지 표시 (memberType 등 실제 필드명에 맞게 조정) */}
            {review.isLocal && (
              <span className={styles.member_badge}>현지인</span>
            )}
          </div>
          <div className={styles.review_rating}>
            {"★".repeat(Math.round(review.rating) || 5)}
          </div>
        </div>
      </div>

      {/* 리뷰 본문 */}
      <div className={styles.review_content}>{review.reviewContent}</div>
      <div className={styles.review_meta}>
        <span className={styles.review_date}>
          {review.visitDate ? review.visitDate : " - "}
        </span>
        <span className={styles.review_menu}>
          메뉴:{" "}
          {Array.isArray(review.menus)
            ? review.menus.join(" · ")
            : review.menus}
        </span>
      </div>
    </div>
  );
};

export default RestaruntViewReviews;
