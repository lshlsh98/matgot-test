import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./ReceiptCheck.module.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useKakaoPostcode } from "@clroot/react-kakao-postcode";
import Swal from "sweetalert2";

const ReceiptCheck = () => {
  const [file, setFile] = useState(null); // 선택된 파일
  const [preview, setPreview] = useState(null); // 이미지 미리보기 URL
  const [loading, setLoading] = useState(false); // OCR 분석 중 여부
  const [result, setResult] = useState(null); // OCR 결과 데이터
  const [error, setError] = useState(null); // 에러 메시지
  const [dragOver, setDragOver] = useState(false); // 드래그 오버 여부
  const inputRef = useRef(null); // 숨겨진 file input 참조
  const { mode, restNo } = useParams();

  // 파일 선택 공통 처리 (input change / 드래그 드롭)
  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // 이미지 파일만 허용
    if (!selectedFile.type.startsWith("image/")) {
      setError("이미지 파일(JPG, PNG, GIF 등)만 업로드할 수 있습니다.");
      return;
    }

    // 20MB 크기 제한
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("파일 크기는 20MB 이하여야 합니다.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);

    // FileReader로 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  // input[type=file] change 이벤트
  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // 드래그 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // 이미지 제거
  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // OCR 분석 API 호출
  const handleAnalyze = () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/api/ocr/receipt`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.success) {
          setResult(response.data.data);
        } else {
          setError(response.data.message || "OCR 분석에 실패했습니다.");
        }
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "서버 연결에 실패했습니다. 백엔드가 실행 중인지 확인해주세요.";

        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.receipt}>
      <div className={styles.receipt_inner}>
        {/* 페이지 헤더 */}
        <header className={styles.receipt_header}>
          <h1>영수증 OCR 분석기</h1>
          <p>영수증 이미지를 업로드하면 가게명, 메뉴를 자동으로 추출합니다.</p>
        </header>

        {/* 업로드 카드 */}
        <div className={styles.upload_card}>
          {/* 드롭존 */}
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""} ${
              preview ? styles.hasImage : ""
            }`}
            onClick={() => !preview && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* 숨겨진 file input — CSS로 display:none 처리 */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />

            {preview ? (
              /* 이미지 미리보기 */
              <div className={styles.preview_wrapper}>
                <img
                  src={preview}
                  alt="영수증 미리보기"
                  className={styles.preview_image}
                />
                <button
                  className={styles.preview_remove}
                  onClick={handleRemove}
                  title="제거"
                >
                  ✕
                </button>
              </div>
            ) : (
              /* 업로드 안내 */
              <>
                <p className={styles.dropzone_title}>
                  {dragOver
                    ? "여기에 놓으세요!"
                    : "영수증 이미지를 드래그하거나 클릭하세요"}
                </p>
                <p className={styles.dropzone_sub}>JPG, PNG, GIF · 최대 20MB</p>
              </>
            )}
          </div>

          {/* OCR 분석 버튼 */}
          <button
            className={styles.btn_analyze}
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading ? "분석 중..." : "OCR 분석 시작"}
          </button>

          {/* 로딩 스피너 */}
          {loading && (
            <div className={styles.loading_wrapper}>
              <div className={styles.spinner} />
              <p className={styles.loading_text}>
                CLOVA OCR로 영수증을 분석하고 있습니다...
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className={styles.error_box}>
              <p className={styles.error_text}>{error}</p>
            </div>
          )}
        </div>

        {/* OCR 결과 카드 */}
        {result && <ResultCard data={result} mode={mode} restNo={restNo} />}
      </div>
    </div>
  );
};

const ResultCard = ({ data, mode, restNo }) => {
  return (
    <div className={styles.result_card}>
      {/* 결과 헤더 */}
      <div className={styles.result_header}>
        <div className={styles.result_header_title}>OCR 분석 완료</div>
        <div className={styles.result_header_sub}>
          영수증에서 추출된 정보입니다
        </div>
      </div>

      <div className={styles.result_body}>
        {/* 가게명 */}
        <div className={styles.result_row}>
          <div className={styles.result_row_content}>
            <div className={styles.result_label}>가게명</div>
            <div className={styles.result_value}>
              {data.storeName || (
                <span className={styles.no_value}>인식되지 않음</span>
              )}
            </div>
          </div>
        </div>

        {/* 주소 */}
        <div className={styles.result_row}>
          <div className={styles.result_row_content}>
            <div className={styles.result_label}>주소</div>
            <div className={styles.result_value}>
              {data.address || (
                <span className={styles.no_value}>인식되지 않음</span>
              )}
            </div>
          </div>
        </div>

        {/* 날짜 */}
        <div className={styles.result_row}>
          <div className={styles.result_row_content}>
            <div className={styles.result_label}>날짜</div>
            <div className={styles.result_value}>
              {data.date || (
                <span className={styles.no_value}>인식되지 않음</span>
              )}
            </div>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <div className={styles.result_row}>
          <div className={styles.result_row_content}>
            <div className={styles.result_label}>메뉴</div>
            {data.menuItems && data.menuItems.length > 0 ? (
              <ul className={styles.menu_list}>
                {data.menuItems.map((item, idx) => (
                  <li key={idx} className={styles.menu_item}>
                    <span className={styles.menu_item_name}>{item.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.no_value}>인식된 메뉴가 없습니다</span>
            )}
          </div>
        </div>

        {/* 네이버 맵 */}
        <div className={`${styles.result_row} ${styles.result_row_map}`}>
          <div className={styles.result_row_content}>
            <div className={styles.result_label}>
              <div className={styles.addr_caution}>
                [영수증에서 추출된 주소 정보가 정확하지 않을 수 있습니다. 정확한
                주소인지 다시한번 확인해 주시고 올바르지 않다면 올바른 주소를
                선택해 주세요]
              </div>
            </div>
            {/* OCR 주소를 초기값으로 전달 → 지도 자동 이동 */}
            <NaverMapSection
              initialAddress={data.address}
              data={data}
              mode={mode}
              restNo={restNo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const NaverMapSection = ({ initialAddress, data, mode, restNo }) => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  // initialAddress 로 주소 input 초기화 (수정: 빈 문자열 → OCR 주소)
  const [address, setAddress] = useState(initialAddress || "");
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 지도 초기화 + initialAddress 자동 이동
  useEffect(() => {
    if (!mapDivRef.current || !window.naver) return;

    const defaultCenter = new naver.maps.LatLng(37.5696734, 126.9843022);

    const map = new naver.maps.Map(mapDivRef.current, {
      center: defaultCenter,
      zoom: 18,
    });

    const marker = new naver.maps.Marker({
      position: defaultCenter,
      map: map,
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: "",
    });

    // ref에 저장 (이후 이벤트/함수에서 참조)
    mapRef.current = map;
    markerRef.current = marker;
    infoWindowRef.current = infoWindow;

    // 마커 클릭 시 InfoWindow 토글
    naver.maps.Event.addListener(marker, "click", () => {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
    });

    // 지도 클릭 시 마커 이동 + 역지오코딩
    naver.maps.Event.addListener(map, "click", (e) => {
      map.setCenter(e.coord);
      marker.setPosition(e.coord);
      if (infoWindow.getMap()) infoWindow.close();

      naver.maps.Service.reverseGeocode(
        { location: e.coord },
        (status, response) => {
          if (status !== naver.maps.Service.Status.OK) {
            alert("주소를 찾을 수 없습니다");
            return;
          }
          const addr = response.result.items[0].address;
          infoWindow.setContent(
            `<div style="padding:8px 12px"><p>${addr}</p></div>`,
          );
          infoWindow.open(map, marker); // 클릭 시 infoWindow도 바로 열기
          setAddress(addr); // ← 이 줄 추가
          setCoords({ lat: e.coord.lat(), lng: e.coord.lng() });
        },
      );
    });

    // OCR 주소가 있으면 자동으로 지오코딩 후 지도 이동
    if (initialAddress) {
      naver.maps.Service.geocode(
        { query: initialAddress },
        (status, response) => {
          if (status !== naver.maps.Service.Status.OK) return;
          const items = response.v2?.addresses;
          if (!items || items.length === 0) return;

          const { x, y } = items[0];
          const lat = parseFloat(y);
          const lng = parseFloat(x);
          const newCenter = new naver.maps.LatLng(lat, lng);

          map.setCenter(newCenter);
          map.setZoom(18);
          marker.setPosition(newCenter);

          const roadAddr = items[0].roadAddress || items[0].jibunAddress;
          infoWindow.setContent(
            `<div style="padding:8px 12px"><p>${roadAddr}</p></div>`,
          );
          infoWindow.open(map, marker);
          setCoords({ lat, lng });
        },
      );
    }
  }, []);

  const { open } = useKakaoPostcode({
    onComplete: (data) => {
      const selectedAddr = data.roadAddress;
      setAddress(selectedAddr);
      handleSearch(selectedAddr);
    },
  });

  // 주소 검색 (검색 버튼 / Enter 키)
  const handleSearch = (query = address) => {
    const trimmed = query.trim(); // trimmed 사용
    if (!trimmed) {
      // query → trimmed
      setError("주소를 입력해주세요.");
      return;
    }
    setError("");

    naver.maps.Service.geocode({ query: trimmed }, (status, response) => {
      // query → trimmed
      if (status !== naver.maps.Service.Status.OK) {
        setError("주소를 찾을 수 없습니다.");
        return;
      }

      const items = response.v2?.addresses;
      if (!items || items.length === 0) {
        setError("검색 결과가 없습니다.");
        return;
      }

      const { x, y } = items[0];
      const lat = parseFloat(y);
      const lng = parseFloat(x);
      const newCenter = new naver.maps.LatLng(lat, lng);

      mapRef.current.setCenter(newCenter);
      mapRef.current.setZoom(18);
      markerRef.current.setPosition(newCenter);

      if (infoWindowRef.current.getMap()) infoWindowRef.current.close();

      const roadAddr = items[0].roadAddress || items[0].jibunAddress;
      infoWindowRef.current.setContent(
        `<div style="padding:8px 12px"><p>${roadAddr}</p></div>`,
      );
      infoWindowRef.current.open(mapRef.current, markerRef.current);
      setCoords({ lat, lng });
      setAddress(roadAddr);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const confirm = () => {
    const receiptData = {
      ...data,
      address: address,
      lat: coords.lat,
      lng: coords.lng,
    };

    sessionStorage.setItem("receiptData", JSON.stringify(receiptData));

    if (mode === "rest") {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/restaurants/isdup`, {
          params: {
            storeName: receiptData.storeName,
            lat: receiptData.lat,
            lng: receiptData.lng,
          },
        })
        .then((res) => {
          if (res.data.duplicate) {
            console.log("중복");
            Swal.fire({
              title: "이미 등록된 맛집입니다.",
              text: "이미 존재하는 맛집에 리뷰를 등록하시겠습니까?",
              icon: "info",
              showCancelButton: true,
              confirmButtonText: "확인",
              cancelButtonText: "취소",
            }).then((result) => {
              if (result.isConfirmed) {
                console.log("확인 클릭");
                navigate(`/rest/review/regist/${res.data.restNo}`);
              } else if (result.isDismissed) {
                console.log("취소 클릭");
                navigate(`/rest`);
              }
            });

            return;
          }

          navigate(`/rest/regist`);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/restaurants/isexist`, {
          params: {
            storeName: receiptData.storeName,
            lat: receiptData.lat,
            lng: receiptData.lng,
            restNo: restNo,
          },
        })
        .then((res) => {
          console.log(res);
          if (res.data) {
            navigate(`/rest/review/regist/${restNo}`);
          } else {
            Swal.fire({
              title: "리뷰 할 맛집 정보와 \n영수증 정보가 다릅니다.",
              icon: "warning",
              confirmButtonText: "확인",
            }).then(() => {
              navigate(-1);
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div className={styles.api_content_wrap}>
      {/* 주소 검색 입력창 */}
      <div className={styles.address_input}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="주소를 입력하세요"
          className={styles.address_input_field}
        />
        <button className={styles.search_button} onClick={open}>
          검색
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && <p className={styles.map_error}>{error}</p>}

      {/* 선택된 좌표 표시 */}
      {/* {coords && (
        <p className={styles.lat_lng}>
          위도: <strong>{coords.lat.toFixed(7)}</strong>
          &nbsp; 경도: <strong>{coords.lng.toFixed(7)}</strong>
        </p>
      )} */}

      {/* 지도 컨테이너 */}
      <div className={styles.map_div} ref={mapDivRef} />

      <div className={styles.confirmBtn_zone}>
        <button type="button" onClick={confirm}>
          확인
        </button>
      </div>
    </div>
  );
};

export default ReceiptCheck;
