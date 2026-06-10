import { useEffect, useState } from "react";
import styles from "./RestaurantDetailSearch.module.css";
import axios from "axios";
import RestaurantItem from "../../components/restaurant/RestaurantItem";
import Pagination from "../../components/ui/Pagination";
import RestaurantMain from "./RestaurantMain";
import { useNavigate } from "react-router-dom";

const RestaurantDetailSearch = () => {
  const [region, setRegion] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [categories, setCategories] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);
  const [order, setOrder] = useState("latest");
  const [filterOrder, setFilterOrder] = useState("latest");
  const [restList, setRestList] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPage, setTotalPage] = useState(null);
  const [restName, setRestName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/main?page=${page}&size=${size}&region=${filterRegion}&order=${filterOrder}&categories=${categories}`,
      )
      .then((res) => {
        console.log(res.data);
        setRestList(res.data.list);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [filterRegion, filterOrder, filterCategories, page]);

  // 카테고리 체크박스 핸들러 (다중 선택 가능)
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCategories([...categories, value]);
    } else {
      setCategories(categories.filter((item) => item !== value));
    }
  };

  // 맛집 이름 검색 핸들러
  // restName을 쿼리 파라미터로 전달하고, 검색 시 첫 페이지(0)로 초기화
  const handleSearch = () => {
    setPage(0);
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/restaurants/search`, {
        params: { restName, page: 0, size },
      })
      .then((res) => {
        setRestList(res.data.list);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const doFilter = () => {
    setFilterRegion(region);
    setFilterOrder(order);
    setFilterCategories(categories);
    setPage(0);
  };

  return (
    <section className={styles.recommand_filter}>
      <div className={styles.reccomand}>
        <RestaurantMain />
      </div>

      {/* 전체 레이아웃: 좌측 필터 사이드바 + 우측 목록 (2컬럼 flex) */}
      <div className={styles.page_wrap}>
        {/* ===== 좌측: 필터 사이드바 ===== */}
        <section className={styles.filter_section}>
          {/* 필터 제목 */}
          <div className={styles.filter_title}>필터</div>

          {/* 지역 검색 입력 */}
          <div className={styles.region}>
            <div className={styles.filter_label}>지역</div>
            <input
              type="text"
              name="region"
              id="region"
              placeholder="지역 입력"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          {/* 카테고리 다중 선택
            실제 checkbox는 숨기고, label을 pill 버튼처럼 스타일링
            선택 시 :has(input:checked) 로 노란색 배경 적용 */}
          <div className={styles.category}>
            <div className={styles.filter_label}>카테고리</div>
            <div className={styles.ckbox}>
              <label>
                <input
                  type="checkbox"
                  value="한식"
                  checked={categories.includes("한식")}
                  onChange={handleCategoryChange}
                />
                한식
              </label>
              <label>
                <input
                  type="checkbox"
                  value="양식"
                  checked={categories.includes("양식")}
                  onChange={handleCategoryChange}
                />
                양식
              </label>
              <label>
                <input
                  type="checkbox"
                  value="중식"
                  checked={categories.includes("중식")}
                  onChange={handleCategoryChange}
                />
                중식
              </label>
              <label>
                <input
                  type="checkbox"
                  value="일식"
                  checked={categories.includes("일식")}
                  onChange={handleCategoryChange}
                />
                일식
              </label>
            </div>
          </div>

          <div className={styles.sort}>
            <div className={styles.filter_label}>정렬</div>
            <div className={styles.order}>
              <label>
                <input
                  type="radio"
                  name="order"
                  value="latest"
                  checked={order === "latest"}
                  onChange={(e) => setOrder(e.target.value)}
                />
                최신순
              </label>
              <label>
                <input
                  type="radio"
                  name="order"
                  value="star"
                  checked={order === "star"}
                  onChange={(e) => setOrder(e.target.value)}
                />
                별점순
              </label>
              <label>
                <input
                  type="radio"
                  name="order"
                  value="oldest"
                  checked={order === "oldest"}
                  onChange={(e) => setOrder(e.target.value)}
                />
                등록순
              </label>
              <label>
                <input
                  type="radio"
                  name="order"
                  value="reviews"
                  checked={order === "reviews"}
                  onChange={(e) => setOrder(e.target.value)}
                />
                리뷰수순
              </label>
            </div>
          </div>

          {/* 필터 적용 버튼 (margin-top: auto 로 사이드바 최하단 고정) */}
          <div className={styles.filter_btn}>
            <button type="button" onClick={doFilter}>
              필터 적용
            </button>
          </div>
        </section>

        {/* ===== 우측: 식당 목록 영역 ===== */}
        <section className={styles.list_section}>
          {/* 상단 검색 바: 맛집 이름으로 검색
            - input + button을 하나의 바처럼 묶어 pill 형태로 표시
            - Enter 키 입력 시에도 검색 실행 */}
          <div className={styles.list_top}>
            <div className={styles.search_bar}>
              <input
                className={styles.search_input}
                type="text"
                name="restName"
                id="restName"
                placeholder="맛집 이름을 검색하세요"
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className={styles.search_btn}
                type="button"
                onClick={handleSearch}
              >
                검색
              </button>
            </div>
          </div>

          {/* 식당 카드 그리드 (4열 × 3행 = 12개 / 페이지) */}
          <div className={styles.rest_list}>
            {restList.map((rest) => (
              <RestaurantItem key={`${rest.restNo}`} rest={rest} />
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className={styles.pagination}>
            <Pagination
              totalPage={totalPage}
              page={page}
              setPage={setPage}
              naviSize={5}
            />
          </div>

          {/* 맛집 등록 버튼 (화면 우하단 고정) */}
          <div className={styles.regist_btn}>
            <button
              type="button"
              onClick={() => {
                navigate(`/receipt/rest`);
              }}
            >
              맛집 등록
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};

export default RestaurantDetailSearch;
