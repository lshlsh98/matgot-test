import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListFrame.module.css";
import ControlPointSharpIcon from "@mui/icons-material/ControlPointSharp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";

const ListFrame = ({ order, iconText, items = [] }) => {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const dragStatus = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  const onMouseDown = (e) => {
    dragStatus.current.isDown = true;
    dragStatus.current.startX = e.pageX - scrollRef.current.offsetLeft;
    dragStatus.current.scrollLeft = scrollRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    dragStatus.current.isDown = false;
  };

  const onMouseUp = () => {
    dragStatus.current.isDown = false;
  };

  const onMouseMove = (e) => {
    if (!dragStatus.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStatus.current.startX) * 1.5;
    scrollRef.current.scrollLeft = dragStatus.current.scrollLeft - walk;
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    const isAtLeft = scrollLeft <= 0;
    setShowLeftFade(!isAtLeft);

    const isAtRight = scrollLeft + clientWidth >= scrollWidth - 2;
    setShowRightFade(!isAtRight);
  };

  useEffect(() => {
    handleScroll();
  }, [items]);

  const handleCardClick = (tplanNo) => {
    if (!tplanNo) return;
    navigate(`/trip/detail/${tplanNo}`);
  };

  const handleCreateCourseClick = () => {
    navigate("/trip/create");
  };

  return (
    <div className={styles.frameContainer}>
      <div className={styles.titleSection}>
        <div className={styles.titleIcon}>{iconText.icon}</div>
        <div className={styles.titleText}>{iconText.title}</div>
      </div>

      <div className={styles.contentSection}>
        <div
          className={`${styles.fadeOverlayLeft} ${showLeftFade ? "" : styles.hide}`}
        />

        <div
          className={styles.myListItems}
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          style={{ cursor: "grab" }}
        >
          {order === 0 && (
            <div
              className={styles.createCourseBtn}
              onClick={handleCreateCourseClick}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.plusIcon}>
                <ControlPointSharpIcon />
              </div>
              <div className={styles.btnText}>새 코스 만들기</div>
            </div>
          )}

          {items.length === 0
            ? order !== 0 && (
                <div className={styles.emptyContainer}>
                  <p className={styles.emptyText}>
                    아직 {iconText.title}가 없습니다.
                  </p>
                  <button
                    className={styles.emptyLinkBtn}
                    onClick={() => {
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                  >
                    추천 코스 구경하러 가기
                  </button>
                </div>
              )
            : items.map((item, index) => {
                const isFullUrl = item.imgName?.startsWith("http");
                const imgSrc = isFullUrl
                  ? item.imgName
                  : `${import.meta.env.VITE_BACKSERVER}/menu/${item.imgName}`;

                return (
                  <div
                    key={`listFrame-${index}`}
                    className={styles.cardItem}
                    onClick={() => handleCardClick(item.tplanNo)}
                  >
                    <div className={styles.thumbnailBox}>
                      <img
                        src={imgSrc}
                        alt={item.title}
                        className={styles.image}
                        onError={(e) =>
                          console.log("이미지 로드 실패", e.target.src)
                        }
                      />
                      {item.tplanDays && (
                        <span className={styles.dayBadge}>
                          {item.tplanDays}Day
                        </span>
                      )}
                    </div>

                    <div className={styles.descBox}>
                      <div className={styles.title}>{item.title}</div>
                      <div className={styles.description}>
                        {item.desc && item.desc.trim() !== ""
                          ? item.desc
                          : "등록된 설명이 없습니다."}
                      </div>
                    </div>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <FavoriteIcon className={styles.likeIcon} />
                        <span>{item.tplanLike || 0}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <VisibilityIcon className={styles.viewIcon} />
                        <span>{item.tplanView || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <div
          className={`${styles.fadeOverlayRight} ${showRightFade ? "" : styles.hide}`}
        />
      </div>
    </div>
  );
};

export default ListFrame;
