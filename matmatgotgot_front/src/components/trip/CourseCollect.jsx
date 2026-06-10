import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CourseCollect.module.css";
import SearchIcon from "@mui/icons-material/Search";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentsIcon from "@mui/icons-material/Payments";
import axios from "axios";

const getChosung = (str) => {
  const cho = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11172) {
      result += cho[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
};

const CourseCollect = ({ items = [] }) => {
  const navigate = useNavigate();
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [showRegionPopup, setShowRegionPopup] = useState(false);
  const [isInfinite, setIsInfinite] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [tags, setTags] = useState([]);
  const [regions, setRegions] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");

  const [searchQuery, setSearchQuery] = useState("");

  const [filteredAndSortedItems, setFilteredAndSortedItems] = useState([]);

  const observerRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/create/tags`,
        );
        const initializedTags = response.data.map((tag) => ({
          id: tag.tagNo || tag.id,
          text: tag.tagName || tag.text,
          active: false,
        }));
        setTags(initializedTags);
      } catch (error) {
        console.error("DB 태그 데이터를 가져오는 중 실패했습니다:", error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) {
      setRegions([]);
      return;
    }

    const regionSet = new Set();
    items.forEach((item) => {
      const regionStr = item.tplanRegion || item.region;
      if (regionStr && regionStr.trim() !== "") {
        regionStr.split(",").forEach((r) => {
          const trimmed = r.trim();
          if (trimmed) regionSet.add(trimmed);
        });
      }
    });

    const parsedRegions = Array.from(regionSet).map((regionName) => ({
      name: regionName,
      active: false,
    }));

    setRegions(parsedRegions);
  }, [items]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const result = getFilteredAndSortedItems();
      setFilteredAndSortedItems(result);
      setVisibleCount(8);
      setIsInfinite(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, tags, regions, sortOrder, items]);

  const getFilteredAndSortedItems = () => {
    const activeTagTexts = tags
      .filter((t) => t.active)
      .map((t) => (t.text ? t.text.replace(/#/g, "").trim() : ""));
    const activeRegionNames = regions
      .filter((r) => r.active)
      .map((r) => r.name);

    const searchLower = searchQuery.toLowerCase().trim();
    const searchChosung = getChosung(searchLower);
    const isChosungOnly = /^[ㄱ-ㅎ\s]+$/.test(searchLower);

    const filtered = items.filter((item) => {
      const titleText = (item.tplanTitle || item.title || "")
        .toLowerCase()
        .trim();
      let matchesSearch = false;

      if (!searchLower) {
        matchesSearch = true;
      } else if (isChosungOnly) {
        const titleChosung = getChosung(titleText);
        matchesSearch = titleChosung.startsWith(searchChosung);
      } else {
        matchesSearch = titleText.includes(searchLower);
      }

      const itemTagsStr = item.tplanTags || "";
      const itemTagsArr = itemTagsStr
        .split(",")
        .map((t) => t.replace(/#/g, "").trim());
      const matchesTags = activeTagTexts.every((tag) =>
        itemTagsArr.includes(tag),
      );

      const itemRegionStr = item.tplanRegion || item.region || "";
      const itemRegionsArr = itemRegionStr.split(",").map((r) => r.trim());
      const matchesRegions =
        activeRegionNames.length === 0 ||
        activeRegionNames.some((activeRegion) =>
          itemRegionsArr.includes(activeRegion),
        );

      return matchesSearch && matchesTags && matchesRegions;
    });

    if (sortOrder === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "priceAsc") {
      filtered.sort(
        (a, b) => (a.tplanTotalPrice || 0) - (b.tplanTotalPrice || 0),
      );
    } else if (sortOrder === "priceDesc") {
      filtered.sort(
        (a, b) => (b.tplanTotalPrice || 0) - (a.tplanTotalPrice || 0),
      );
    }

    return filtered;
  };

  const currentItems = filteredAndSortedItems.slice(0, visibleCount);

  const toggleTag = (id) => {
    setTags((prev) => {
      const targetTag = prev.find((tag) => tag.id === id);
      if (!targetTag) return prev;

      if (targetTag.active) {
        return prev.map((tag) =>
          tag.id === id ? { ...tag, active: false } : tag,
        );
      }

      const activeCount = prev.filter((tag) => tag.active).length;
      if (activeCount >= 5) {
        alert("카테고리 태그는 최대 5개까지만 선택할 수 있습니다.");
        return prev;
      }

      return prev.map((tag) =>
        tag.id === id ? { ...tag, active: true } : tag,
      );
    });
  };

  const toggleRegion = (name) => {
    setRegions((prev) =>
      prev.map((reg) =>
        reg.name === name ? { ...reg, active: !reg.active } : reg,
      ),
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMoreClick = () => {
    setVisibleCount((prev) => prev + 8);
    setIsInfinite(true);
  };

  const handleCardClick = (tplanNo) => {
    if (!tplanNo) return;
    navigate(`/trip/detail/${tplanNo}`);
  };

  useEffect(() => {
    if (!isInfinite || visibleCount >= filteredAndSortedItems.length) return;

    const handleIntersect = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setTimeout(() => {
          setVisibleCount((prev) => prev + 8);
        }, 300);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
    });
    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [isInfinite, visibleCount, filteredAndSortedItems.length]);

  return (
    <div className={styles.collectPageContainer}>
      <div className={styles.pageHeaderTitle}>
        <OutlinedFlagIcon className={styles.flagIcon} />
        <div>코스 모아보기</div>
      </div>

      <div className={styles.mainBoard}>
        <div className={styles.controllerRow}>
          <div className={styles.searchBarWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="코스 제목 검색 (초성 가능)..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <SearchIcon className={styles.searchIcon} />
          </div>

          <div className={styles.filterBtnGroup}>
            <button
              className={`${styles.filterBtn} ${showTagPopup ? styles.activeFilter : ""}`}
              onClick={() => {
                setShowTagPopup(!showTagPopup);
                setShowRegionPopup(false);
              }}
            >
              태그
            </button>

            <button
              className={`${styles.filterBtn} ${showRegionPopup ? styles.activeFilter : ""}`}
              onClick={() => {
                setShowRegionPopup(!showRegionPopup);
                setShowTagPopup(false);
              }}
            >
              지역
            </button>

            <select
              className={styles.sortSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">최신 등록순</option>
              <option value="priceAsc">예상 비용 낮은순</option>
              <option value="priceDesc">예상 비용 높은순</option>
            </select>

            {showTagPopup && (
              <div
                className={`${styles.tagPopup} ${tags.length === 0 ? styles.tagPopup_n : ""}`}
              >
                {tags.length === 0 ? (
                  <span className={styles.emptyRegionText}>
                    등록된 태그가 없습니다.
                  </span>
                ) : (
                  tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`${styles.tagBadge} ${tag.active ? styles.tagActive : ""}`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.text}
                    </span>
                  ))
                )}
              </div>
            )}

            {showRegionPopup && (
              <div
                className={`${styles.tagPopup} ${regions.length === 0 ? styles.tagPopup_n : ""}`}
              >
                {regions.length === 0 ? (
                  <span className={styles.emptyRegionText}>
                    등록된 지역이 없습니다.
                  </span>
                ) : (
                  regions.map((reg) => (
                    <span
                      key={reg.name}
                      className={`${styles.tagBadge} ${reg.active ? styles.tagActive : ""}`}
                      onClick={() => toggleRegion(reg.name)}
                    >
                      {reg.name}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className={styles.collectEmptyWrap}>
            <p className={styles.collectEmptyText}>
              검색되거나 선택하신 조건에 맞는 여행 코스가 없습니다.
            </p>
            <p className={styles.collectEmptySubText}>
              상단의 검색 필터를 조정하거나 다른 키워드를 입력해 보세요!
            </p>
          </div>
        ) : (
          <div className={styles.cardGridContainer}>
            {currentItems.map((item) => {
              const defaultImg = "default_thumbnail.png";
              const imgSrc = item.imgName || item.tplanThumb || defaultImg;

              return (
                <div
                  key={item.tplanNo}
                  className={styles.courseCard}
                  onClick={() => handleCardClick(item.tplanNo)}
                >
                  <div className={styles.thumbnailBox}>
                    <img
                      src={imgSrc}
                      alt={item.tplanTitle || item.title}
                      className={styles.cardImage}
                    />
                    <span className={styles.dayBadge}>{item.tplanDays}Day</span>
                  </div>

                  <div className={styles.cardContent}>
                    <h4 className={styles.cardTitle}>
                      {item.tplanTitle || item.title}
                    </h4>
                    <p className={styles.cardDesc}>
                      {(item.tplanDesc || item.desc) &&
                      (item.tplanDesc || item.desc).trim() !== ""
                        ? item.tplanDesc || item.desc
                        : "등록된 설명이 없습니다."}
                    </p>

                    <div className={styles.cardPriceRow}>
                      <PaymentsIcon className={styles.priceIcon} />
                      <span>
                        {item.tplanTotalPrice
                          ? `약 ${item.tplanTotalPrice.toLocaleString()}원`
                          : "비용 정보 없음"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <FavoriteIcon className={styles.likeIcon} />
                      <span>{item.tplanLike}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <VisibilityIcon className={styles.viewIcon} />
                      <span>{item.tplanView}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentItems.length > 0 &&
          !isInfinite &&
          visibleCount < filteredAndSortedItems.length && (
            <div className={styles.moreButtonContainer}>
              <button className={styles.moreButton} onClick={handleMoreClick}>
                더보기
              </button>
            </div>
          )}

        {currentItems.length > 0 &&
          isInfinite &&
          visibleCount < filteredAndSortedItems.length && (
            <div ref={observerRef} className={styles.loadingTrigger}>
              <div className={styles.spinner}></div>
              <p>코스를 더 불러오는 중입니다...</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default CourseCollect;
