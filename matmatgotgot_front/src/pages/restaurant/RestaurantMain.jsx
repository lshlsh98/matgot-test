import { useEffect, useState } from "react";
import styles from "./RestaurantMain.module.css";
import axios from "axios";
import RestaurantItem from "../../components/restaurant/RestaurantItem";
import SpecifyCurLocationModal from "../../components/restaurant/SpecifyCurLocationModal";
import RestSlide from "../../components/restaurant/RestSlide";
import { useAuthStore } from "../../store/useAuthStore";

const RestaurantMain = () => {
  const [popularList, setPopularList] = useState([]);
  const [likeList, setLikeList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("popular");

  const lat = useAuthStore((state) => state.lat);
  const lng = useAuthStore((state) => state.lng);

  useEffect(() => {
    if (tab === "popular") {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/restaurants/popular`)
        .then((res) => {
          console.log(res.data);
          setPopularList(res.data);
        })
        .catch((err) => console.log(err));
    } else if (tab === "like") {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/restaurants/like`)
        .then((res) => {
          console.log(res.data);
          setLikeList(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "region") return;

    if (lat == null || lng == null) {
      console.log("위치정보X");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/restaurants/region`, {
        params: { lat, lng },
      })
      .then((res) => {
        console.log(res.data);
        setRegionList(res.data);
      })
      .catch((err) => console.log(err));
  }, [tab, lat, lng]);

  return (
    <>
      <section className={styles.radio_zone}>
        <div className={styles.tab}>
          <label>
            <input
              type="radio"
              name="tab"
              value="popular"
              checked={tab === "popular"}
              onChange={(e) => setTab(e.target.value)}
            />
            인기 맛집
          </label>
          <label>
            <input
              type="radio"
              name="tab"
              value="like"
              checked={tab === "like"}
              onChange={(e) => setTab(e.target.value)}
            />
            찜한 맛집
          </label>
          <label>
            <input
              type="radio"
              name="tab"
              value="region"
              checked={tab === "region"}
              onChange={(e) => setTab(e.target.value)}
            />
            근처 맛집
          </label>
          {/* 근처 맛집 탭일 때만 주소변경 버튼 표시 */}
          {tab === "region" && (
            <button onClick={() => setModalOpen(true)}>주소변경</button>
          )}
        </div>
      </section>

      <section className={styles.card_wrap}>
        {/* 선택된 탭에 따라 섹션 제목 동적 표시 */}
        <div>
          {tab === "popular"
            ? "인기 맛집"
            : tab === "like"
              ? "찜한 맛집"
              : "근처 맛집"}
        </div>
        <div className={styles.restaurant_card}>
          {tab === "popular" ? (
            <RestSlide list={popularList} />
          ) : tab === "like" ? (
            <RestSlide list={likeList} />
          ) : (
            <RestSlide list={regionList} />
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className={styles.modal_overlay}
          onClick={(e) => {
            e.stopPropagation();
            setModalOpen(false);
          }}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <SpecifyCurLocationModal setModalOpen={setModalOpen} />
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantMain;
