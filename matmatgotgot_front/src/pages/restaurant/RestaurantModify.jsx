import { useState, useEffect, useRef } from "react";
import styles from "./RestaurantModify.module.css";
import TextEditor from "../../components/ui/TextEditor";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const RestaurantModify = () => {
  const navigate = useNavigate();
  const { restNo } = useParams();

  // 폼 필드 상태 — 기존 데이터를 불러와 초기값으로 세팅
  const [restName, setRestName] = useState("");
  const [restAddr, setRestAddr] = useState("");
  const [restHours, setRestHours] = useState("");
  const [restPhone, setRestPhone] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const originalContent = useRef("");

  const mapDivRef = useRef(null);
  const [lat, setLat] = useState(37.5696734);
  const [lng, setLng] = useState(126.9843022);

  // 기존 맛집 데이터 조회 — 마운트 시 1회 실행
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/restaurants?restNo=${restNo}`)
      .then((res) => {
        console.log(res.data);
        const data = res.data;
        setRestName(data.restName ?? "");
        setRestAddr(data.restAddr ?? "");
        setRestHours(data.hours ?? "");
        setRestPhone(data.phone ?? "");
        setCategory(data.category ?? "");
        setContent(data.restContent ?? "");
        originalContent.current = data.restContent ?? "";
        // 기존 좌표가 있으면 지도 중심으로 세팅
        if (data.lat) setLat(data.lat);
        if (data.lng) setLng(data.lng);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({ title: "맛집 정보를 불러오지 못했습니다.", icon: "error" });
      });
  }, [restNo]);

  // 지도 초기화 — lat/lng 세팅 후 실행
  useEffect(() => {
    if (!mapDivRef.current || !window.naver) return;

    const center = new naver.maps.LatLng(lat, lng);

    const map = new naver.maps.Map(mapDivRef.current, {
      center,
      zoom: 18,
    });

    const marker = new naver.maps.Marker({ position: center, map });

    const infoWindow = new naver.maps.InfoWindow({
      content: `<h3>${restName || "맛집"}</h3>`,
    });

    naver.maps.Event.addListener(marker, "click", () => {
      infoWindow.getMap() ? infoWindow.close() : infoWindow.open(map, marker);
    });
  }, [lat, lng]);

  // 텍스트 에디터 내용 업데이트
  const inputContent = (data) => {
    setContent(data);
  };

  // 카테고리 태그 목록
  const categoryList = [
    { value: "한식", label: "한식" },
    { value: "양식", label: "양식" },
    { value: "일식", label: "일식" },
    { value: "중식", label: "중식" },
  ];

  // URL 추출 헬퍼
  const extractImageUrls = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return [...doc.querySelectorAll("img")].map((img) => img.src);
  };

  // 맛집 수정 요청
  const modify = async () => {
    // 삭제된 이미지 URL 계산
    const prevUrls = extractImageUrls(originalContent.current);
    const nextUrls = extractImageUrls(content);
    const deletedUrls = prevUrls.filter((url) => !nextUrls.includes(url));

    // 삭제된 이미지가 있으면 먼저 처리
    if (deletedUrls.length > 0) {
      await axios.delete(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/images`,
        { data: deletedUrls },
      );
    }

    const requestData = {
      restNo,
      restName,
      restAddr,
      restHours: restHours === "" ? null : restHours,
      restPhone: restPhone === "" ? null : restPhone,
      category,
      content,
      lng: Number(lng),
      lat: Number(lat),
    };

    axios
      .put(`${import.meta.env.VITE_BACKSERVER}/restaurants/modify`, requestData)
      .then((res) => {
        if (res.data > 0) {
          Swal.fire({ title: "맛집 수정 완료", icon: "success" }).then(() => {
            navigate(`/rest/view/${restNo}`);
          });
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({ title: "수정 중 오류가 발생했습니다.", icon: "error" });
      });
  };

  return (
    <div className={styles.page_wrap}>
      {/* 페이지 제목 */}
      <h2 className={styles.page_title}>맛집 수정</h2>

      {/* ===== 상단: 좌측 입력 폼 + 우측 지도 ===== */}
      <section className={styles.info_section}>
        {/* 좌측: 기본 정보 입력 */}
        <section className={styles.info_left}>
          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="restName">
              상호명*
            </label>
            <input
              type="text"
              name="restName"
              id="restName"
              value={restName}
              onChange={(e) => setRestName(e.target.value)}
              disabled={true}
            />
          </div>

          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="restAddr">
              주소*
            </label>
            <input
              type="text"
              name="restAddr"
              id="restAddr"
              value={restAddr}
              onChange={(e) => setRestAddr(e.target.value)}
              disabled={true}
            />
          </div>

          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="restHours">
              영업시간
            </label>
            <input
              type="text"
              name="restHours"
              id="restHours"
              value={restHours}
              onChange={(e) => setRestHours(e.target.value)}
            />
          </div>

          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="restPhone">
              전화번호
            </label>
            <input
              type="text"
              name="restPhone"
              id="restPhone"
              value={restPhone}
              onChange={(e) => setRestPhone(e.target.value)}
            />
          </div>

          {/* 카테고리 선택 — radio를 숨기고 label을 pill 버튼으로 스타일링 */}
          <div className={styles.category_wrap}>
            <div className={styles.field_label}>카테고리*</div>
            <div className={styles.category}>
              {categoryList.map(({ value, label }) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="category"
                    value={value}
                    checked={category === value}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 우측: 네이버 지도 */}
        <section className={styles.info_right}>
          <div className={styles.map_label}>
            <span className={styles.field_label}>위치</span>
          </div>
          <div className={styles.map_div} ref={mapDivRef} />
        </section>
      </section>

      {/* ===== 본문 내용: 텍스트 에디터 ===== */}
      <section className={styles.rest_content}>
        <div className={styles.field_label}>본문 내용*</div>
        {/* content가 로딩된 후 에디터에 기존 데이터 전달 */}
        <TextEditor data={content} setData={inputContent} />
      </section>

      {/* ===== 수정 버튼 ===== */}
      <div className={styles.regist_btn}>
        <button type="button" onClick={modify}>
          수정
        </button>
      </div>
    </div>
  );
};

export default RestaurantModify;
