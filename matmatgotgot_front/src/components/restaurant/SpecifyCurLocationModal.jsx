import { useEffect, useRef, useState } from "react";
import styles from "./SpecifyCurLocationModal.module.css";
import { useKakaoPostcode } from "@clroot/react-kakao-postcode";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";

const SpecifyCurLocationModal = ({ setModalOpen }) => {
  const setLat = useAuthStore((state) => state.setLat);
  const setLng = useAuthStore((state) => state.setLng);
  const lat = useAuthStore((state) => state.lat);
  const lng = useAuthStore((state) => state.lng);
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [curAddr, setCurAddr] = useState("");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    // 지도 div 또는 Naver Maps SDK 가 아직 로드되지 않았으면 중단
    if (!mapDivRef.current || !window.naver) return;

    const defaultCenter =
      lat == null || lng == null
        ? new naver.maps.LatLng(37.5662952, 126.9779451) // 기본 위치 (서울 시청)
        : new naver.maps.LatLng(lat, lng);

    // 지도 생성
    const map = new naver.maps.Map(mapDivRef.current, {
      center: defaultCenter,
      zoom: 18,
    });

    // 마커 생성 (초기 위치: 기본 중심)
    const marker = new naver.maps.Marker({
      position: defaultCenter,
      map: map,
    });

    // 인포윈도우 생성 (마커 위에 말풍선으로 주소 표시)
    const infoWindow = new naver.maps.InfoWindow({
      content: "<div style='padding:8px 12px'><p></p></div>",
    });

    // 이후 handleSearch·역지오코딩 함수에서도 접근할 수 있도록 ref에 저장
    mapRef.current = map;
    markerRef.current = marker;
    infoWindowRef.current = infoWindow;

    // 마커 클릭 이벤트: 인포윈도우 열기/닫기 토글
    naver.maps.Event.addListener(marker, "click", () => {
      if (infoWindow.getMap()) {
        // 이미 열려 있으면 닫기
        infoWindow.close();
      } else {
        // 닫혀 있으면 열기
        infoWindow.open(map, marker);
      }
    });

    naver.maps.Event.addListener(map, "click", (e) => {
      // 클릭한 좌표를 지도 중심으로 이동
      map.setCenter(e.coord);
      // 마커를 클릭 위치로 이동
      marker.setPosition(e.coord);
      // 기존에 열려 있던 인포윈도우는 닫음 (새 주소로 갱신 전)
      if (infoWindow.getMap()) infoWindow.close();

      // Naver 역지오코딩: 클릭한 위도/경도 → 주소 변환
      naver.maps.Service.reverseGeocode(
        { location: e.coord },
        (status, response) => {
          if (status !== naver.maps.Service.Status.OK) {
            alert("주소를 찾을 수 없습니다.");
            return;
          }

          // 역지오코딩 결과 중 첫 번째 주소 사용
          const addr = response.result.items[0].address;

          // 인포윈도우 내용을 조회된 주소로 갱신 후 열기
          infoWindow.setContent(
            `<div style="padding:8px 12px"><p>${addr}</p></div>`,
          );
          infoWindow.open(map, marker);

          // input에 주소 자동 입력
          setCurAddr(addr);
          // 위도/경도 state 업데이트 → 화면 하단 좌표 표시 갱신
          setCoords({ lat: e.coord.lat(), lng: e.coord.lng() });
        },
      );
    });

    // cleanup: 컴포넌트 언마운트 시 지도 이벤트 리스너 제거
    return () => {
      naver.maps.Event.clearListeners(map, "click");
      naver.maps.Event.clearListeners(marker, "click");
    };
  }, []);

  const geocodeAndMove = (query) => {
    // Naver 지오코딩: 주소 문자열 → 위도/경도 변환
    naver.maps.Service.geocode({ query }, (status, response) => {
      if (status !== naver.maps.Service.Status.OK) {
        return;
      }

      const items = response.v2?.addresses;
      if (!items || items.length === 0) {
        return;
      }

      // 첫 번째 결과의 x(경도), y(위도) 추출
      const { x, y } = items[0];
      const lat = parseFloat(y);
      const lng = parseFloat(x);
      const newCenter = new naver.maps.LatLng(lat, lng);

      // 지도 중심 및 줌 레벨 이동
      mapRef.current.setCenter(newCenter);
      mapRef.current.setZoom(18);
      // 마커 위치 이동
      markerRef.current.setPosition(newCenter);

      // 기존 인포윈도우 닫기
      if (infoWindowRef.current.getMap()) infoWindowRef.current.close();

      // 도로명 주소 우선, 없으면 지번 주소 사용
      const roadAddr = items[0].roadAddress || items[0].jibunAddress;
      // 인포윈도우 내용 갱신 후 열기
      infoWindowRef.current.setContent(
        `<div style="padding:8px 12px"><p>${roadAddr}</p></div>`,
      );
      infoWindowRef.current.open(mapRef.current, markerRef.current);

      // 위도/경도 state 업데이트 → 화면 좌표 표시 갱신
      setCoords({ lat, lng });
    });
  };

  const { open } = useKakaoPostcode({
    onComplete: (data) => {
      const selectedAddr = data.roadAddress;
      setCurAddr(selectedAddr);
      geocodeAndMove(selectedAddr);
    },
  });

  const confirm = () => {
    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/members/location`, coords)
      .then((res) => {
        setLat(coords.lat);
        setLng(coords.lng);
        setModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className={styles.api_content_wrap}>
      {/* ── 주소 입력 영역 ── */}
      <div className={`${styles.form_group} ${styles.addr_rows}`}>
        <div className={styles.input_row}>
          <label className={styles.label}>주소</label>

          <input
            type="text"
            id="curAddr"
            name="curAddr"
            value={curAddr}
            disabled={true}
          />

          {/* 카카오 우편번호 팝업 버튼: 클릭 시 팝업 오픈 */}
          <button type="button" onClick={open}>
            주소 찾기
          </button>
        </div>
      </div>

      <div className={styles.map_div} ref={mapDivRef} />
      <div className={styles.input_row}>
        <button type="button" className={styles.confirm} onClick={confirm}>
          확인
        </button>
      </div>
    </div>
  );
};

export default SpecifyCurLocationModal;
