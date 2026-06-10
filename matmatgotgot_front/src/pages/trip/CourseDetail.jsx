import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./CourseDetail.module.css";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CourseRouteMap from "../../components/trip/CourseRouteMap";
import { fetchOdsayDuration, fetchTmapDuration } from "../../api/routeApi";
import { useAuthStore } from "../../store/useAuthStore.js";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { tplan_no } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [transitDurations, setTransitDurations] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const { memberNo, isReady } = useAuthStore();

  useEffect(() => {
    if (!isReady) return;

    const fetchDetailData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/detail/${tplan_no}`,
        );
        console.log(response.data);
        setCourseData(response.data);
        setLikeCount(response.data.tplanLike || 0);

        setIsOwner(!!memberNo && response.data.memberNo === memberNo);

        if (response.data.dayRoutes) {
          calculateAllDurations(response.data.dayRoutes);
        }
      } catch (error) {
        console.error("상세 코스 정보를 불러오지 못했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    if (tplan_no) fetchDetailData();
  }, [tplan_no, isReady, memberNo]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/favorite/check`,
          {
            params: { memberNo, tplanNo: tplan_no },
          },
        );
        setIsLiked(res.data.isFavorite);
      } catch (err) {
        console.error("찜 상태를 가져오지 못했습니다.");
      }
    };

    if (tplan_no && memberNo) {
      fetchFavoriteStatus();
    } else {
      setIsLiked(false);
    }
  }, [tplan_no, memberNo]);

  const handleDeleteCourse = async () => {
    if (
      !window.confirm(
        "정말로 이 여행 코스를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKSERVER}/trips/${tplan_no}`,
        {
          params: { memberNo },
        },
      );
      alert("여행 코스가 성공적으로 삭제되었습니다.");
      navigate("/trip");
    } catch (error) {
      console.error("코스 삭제 중 오류 발생:", error);
      alert(error.response?.data || "삭제 권한이 없거나 처리에 실패했습니다.");
    }
  };

  const calculateAllDurations = async (dayRoutes) => {
    const durationsMap = {};
    for (const day of Object.keys(dayRoutes)) {
      const routes = dayRoutes[day] || [];
      for (let i = 0; i < routes.length - 1; i++) {
        const startNode = routes[i];
        const endNode = routes[i + 1];
        const type = startNode.transitType || "WALK";

        const startPos = {
          lat: startNode.lat,
          lng: startNode.lng,
          name: startNode.restName,
        };
        const endPos = {
          lat: endNode.lat,
          lng: endNode.lng,
          name: endNode.restName,
        };
        const mapKey = `${startNode.tscheNo}_${endNode.tscheNo}`;

        let duration = null;
        if (type === "WALK" || type === "CAR") {
          duration = await fetchTmapDuration(startPos, endPos, type);
        } else if (type === "PUB") {
          duration = await fetchOdsayDuration(startPos, endPos);
        }

        if (duration !== null) {
          durationsMap[mapKey] = { duration, type };
        }
      }
    }
    setTransitDurations(durationsMap);
  };

  const handleLikeToggle = async () => {
    if (!memberNo) {
      alert("로그인이 필요한 서비스입니다. 메인 페이지로 이동합니다.");
      navigate("/");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/trips/favorite/toggle`,
        { memberNo, tplanNo: tplan_no },
      );

      const isNowLiked = response.data;
      const countResponse = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/trips/favorite/count`,
        { tplanNo: tplan_no, action: isNowLiked ? "INCREMENT" : "DECREMENT" },
      );

      setIsLiked(isNowLiked);
      setLikeCount(countResponse.data);
    } catch (error) {
      console.error("찜하기 및 카운트 연동 오류:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("코스 링크가 클립보드에 복사되었습니다! 🔗");
    setShowSharePopup(false);
  };

  const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return "0분";
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const result = [];
    if (days > 0) result.push(`${days}일`);
    if (hours > 0) result.push(`${hours}시간`);
    if (minutes > 0) result.push(`${minutes}분`);
    return result.join(" ");
  };

  const renderTransitText = (currentNode, nextNode) => {
    const mapKey = `${currentNode.tscheNo}_${nextNode.tscheNo}`;
    const info = transitDurations[mapKey];
    const typeText =
      currentNode.transitType === "WALK"
        ? "🚶 도보"
        : currentNode.transitType === "PUB"
          ? "🚌 대중교통"
          : "🚗 자차";

    if (!info) return `${typeText} 계산 중...`;
    return `${typeText} 약 ${formatDuration(info.duration)}`;
  };

  if (!isReady || loading)
    return (
      <div className={styles.loading}>코스 상세 정보를 로딩 중입니다...</div>
    );
  if (!courseData)
    return <div className={styles.loading}>존재하지 않는 코스입니다.</div>;

  const dayRoutesSource = courseData.dayRoutes || {};
  const currentDayRoutes =
    dayRoutesSource[activeDay] || dayRoutesSource[String(activeDay)] || [];

  return (
    <div className={styles.detailPageContainer}>
      <div className={styles.detailHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.courseTitle}>{courseData.title}</h1>
          <p className={styles.courseDesc}>
            {courseData.desc || "등록된 설명이 없습니다."}
          </p>
          <div className={styles.metaRow}>
            <span className={styles.likeBadge}>
              ❤️ {likeCount.toLocaleString()}명이 찜함 (조회수{" "}
              {courseData.tplanView})
            </span>
            {courseData.tags?.map((tag, idx) => (
              <span key={idx} className={styles.tagItem}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.headerActions}>
          {isOwner && (
            <>
              <button
                className={styles.actionBtn}
                title="코스 수정"
                onClick={() => navigate(`/trip/edit/${tplan_no}`)}
              >
                <EditIcon />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                title="코스 삭제"
                onClick={handleDeleteCourse}
              >
                <DeleteIcon />
              </button>
            </>
          )}
          <button
            className={styles.actionBtn}
            title="링크 공유"
            onClick={() => setShowSharePopup(!showSharePopup)}
          >
            <ShareIcon />
          </button>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.likedBtn : ""}`}
            onClick={handleLikeToggle}
            title={isLiked ? "찜 해제" : "코스 찜하기"}
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </button>

          {showSharePopup && (
            <div className={styles.sharePopupLayer}>
              <div className={styles.popupHeader}>
                <span>코스 공유하기</span>
                <CloseIcon
                  onClick={() => setShowSharePopup(false)}
                  className={styles.popupClose}
                />
              </div>
              <p className={styles.popupDesc}>
                친구들에게 이 재미있는 코스를 공유해 보세요!
              </p>
              <button className={styles.copyLinkBtn} onClick={handleCopyLink}>
                현재 페이지 링크 복사하기
              </button>
            </div>
          )}
        </div>
      </div>

      {courseData.tplanDays > 1 && (
        <div className={styles.dayTabContainer}>
          {Array.from({ length: courseData.tplanDays }, (_, i) => i + 1).map(
            (day) => (
              <button
                key={day}
                className={`${styles.dayTabBtn} ${activeDay === day ? styles.activeDayTab : ""}`}
                onClick={() => setActiveDay(day)}
              >
                Day {day}
              </button>
            ),
          )}
        </div>
      )}

      <div className={styles.contentBg}>
        <div className={styles.ticketDashboard}>
          <div className={styles.ticketLeft}>
            <CourseRouteMap routes={currentDayRoutes} />
          </div>
          <div className={styles.ticketDivider}>
            <div className={styles.notchTop}></div>
            <div className={styles.dashedLine}></div>
            <div className={styles.notchBottom}></div>
          </div>
          <div className={styles.ticketRight}>
            <div className={styles.infoSummaryGroup}>
              <div className={styles.infoSummaryLine}>
                <span className={styles.summaryLabel}>전체 일정</span>
                <span className={styles.summaryValue}>
                  : {courseData.tplanDays} Days
                </span>
              </div>
              <div className={styles.infoSummaryLine}>
                <span className={styles.summaryLabel}>여행 지역</span>
                <span className={styles.summaryValue}>
                  : {courseData.region || "전체 지역"}
                </span>
              </div>
              <div className={styles.infoSummaryLine}>
                <span className={styles.summaryLabel}>총 예상비용</span>
                <span className={styles.summaryValue}>
                  : {courseData.tplanTotalPrice?.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.timelineContainer}>
          {currentDayRoutes.length === 0 ? (
            <div className={styles.noRoute}>
              이 날은 등록된 일정이 없습니다.
            </div>
          ) : (
            currentDayRoutes.map((route, index) => (
              <div key={route.tscheNo} style={{ display: "contents" }}>
                <div className={styles.routeItemNode}>
                  <div className={styles.routeNodeHeader}>
                    <div className={styles.nodeTitleBox}>
                      <span className={styles.nodeBadge}>{index + 1}</span>
                      <h3
                        className={styles.nodeResName}
                        onClick={() => navigate(`/rest/view/${route.restNo}`)}
                        title={`${route.restName} 상세 보기`}
                      >
                        {route.restName}
                      </h3>
                    </div>
                  </div>

                  <div className={styles.menuPhotoGrid}>
                    {route.selectedMenus && route.selectedMenus.length > 0 ? (
                      route.selectedMenus.map((menu, mIdx) => {
                        const isFullUrl = menu.imagePreview?.startsWith("http");
                        const imgSrc = isFullUrl
                          ? menu.imagePreview
                          : `${import.meta.env.VITE_BACKSERVER}/menu/${menu.imagePreview}`;
                        return (
                          <div key={mIdx} className={styles.detailPhotoCard}>
                            {menu.imagePreview ? (
                              <img
                                src={imgSrc}
                                alt={menu.name}
                                className={styles.photoBoxImg}
                              />
                            ) : (
                              <div className={styles.photoBoxPlaceholder}>
                                사진 없음
                              </div>
                            )}
                            <div className={styles.photoMenuName}>
                              {menu.name}
                            </div>
                            <div className={styles.photoMenuPrice}>
                              {menu.price?.toLocaleString()}원
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.emptyMenuPlaceholder}>
                        <span className={styles.emptyIcon}>🍽️</span>
                        <p className={styles.emptyText}>
                          등록된 추천 메뉴가 없습니다.
                        </p>
                        <p className={styles.emptySubText}>
                          나만의 맛있는 조합을 찾아보세요!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {index < currentDayRoutes.length - 1 && (
                  <div className={styles.verticalTransitInfo}>
                    <div className={styles.verticalDotsLine}></div>
                    <div className={styles.transitDurationText}>
                      {renderTransitText(route, currentDayRoutes[index + 1])}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
