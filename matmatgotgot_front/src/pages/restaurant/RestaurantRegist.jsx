import { useState, useEffect, useRef } from 'react';
import styles from './RestaurantRegist.module.css';
import TextEditor from '../../components/ui/TextEditor';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const RestaurantRegist = () => {
  const [restName, setRestName] = useState('');
  const [restAddr, setRestAddr] = useState('');
  const [restHours, setRestHours] = useState('');
  const [restPhone, setRestPhone] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const mapDivRef = useRef(null);

  const navigate = useNavigate();

  const memberStatus = useAuthStore((state) => state.memberStatus); //지연

  useEffect(() => {
    const savedData = sessionStorage.getItem('receiptData');

    if (!savedData) return;

    const receiptData = JSON.parse(savedData);

    setLat(receiptData.lat);
    setLng(receiptData.lng);
    setRestAddr(receiptData.address);
    setRestName(receiptData.storeName);
  }, []);

  useEffect(() => {
    if (!mapDivRef.current || !window.naver) {
      return null;
    }

    const center = new naver.maps.LatLng(lat, lng);

    const map = new naver.maps.Map(mapDivRef.current, {
      center: center,
      zoom: 18,
    });

    const marker = new naver.maps.Marker({
      position: center,
      map: map,
    });

    const infoWindow = new naver.maps.InfoWindow({
      content: `<h3>${restName}</h3>`,
    });

    naver.maps.Event.addListener(marker, 'click', () => {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
    });

    naver.maps.Event.addListener(map, 'click', (e) => {
      map.setCenter(e.coord);

      if (infoWindow.getMap()) {
        infoWindow.close();
      }
    });
  }, [lat, lng, restName]);

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setTags([...tags, value]);
    } else {
      setTags(tags.filter((item) => item !== value));
    }
  };

  // 텍스트 에디터 내용 업데이트
  const inputContent = (data) => {
    setContent(data);
  };

  const regist = () => {
    // 지연 - 회원 상태 비정상/정지 맛집 등록 막아둠
    if (Number(memberStatus) === 1 || Number(memberStatus) === 3) {
      Swal.fire({
        title: '맛집 등록 불가',
        text: '현재 회원 상태에서는 맛집을 등록할 수 없습니다.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
      });
      return;
    }
    if (
      restName === '' ||
      restAddr === '' ||
      category === '' ||
      content === '' ||
      lat === '' ||
      lng === ''
    ) {
      if (category === '') {
        Swal.fire({
          icon: 'warning',
          title: '카테고리를 선택해 주세요.',
        });
      } else if (content === '') {
        Swal.fire({
          icon: 'warning',
          title: '본문을 작성해 주세요.',
        });
      }

      return;
    }

    const requestData = {
      restName,
      restAddr,
      restHours: restHours === '' ? null : restHours,
      restPhone: restPhone === '' ? null : restPhone,
      category,
      content,
      lat: Number(lat),
      lng: Number(lng),
    };

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/restaurants`, requestData)
      .then((res) => {
        console.log(res.data);
        if (res.data > 0) {
          Swal.fire({
            icon: 'success',
            title: '등록 완료',
            text: '맛집 상세 페이지로 이동합니다.',
          }).then(() => {
            sessionStorage.removeItem('receiptData');
            navigate(`/rest/view/${res.data}`);
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: '등록 실패',
            text: '맛집 등록에 실패하였습니다.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className={styles.page_wrap}>
      {/* 페이지 제목 */}
      <h2 className={styles.page_title}>맛집 등록</h2>

      {/* ===== 상단: 좌측 입력 폼 + 우측 지도/카테고리/태그 ===== */}
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
              <label>
                <input
                  type="radio"
                  name="category"
                  value="한식"
                  checked={category === '한식'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                한식
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="양식"
                  checked={category === '양식'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                양식
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="일식"
                  checked={category === '일식'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                일식
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="중식"
                  checked={category === '중식'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                중식
              </label>
            </div>
          </div>
        </section>

        {/* 우측: 지도 + 카테고리 + 태그 */}
        <section className={styles.info_right}>
          {/* 네이버 지도 */}
          <div className={styles.map_div} ref={mapDivRef} />
        </section>
      </section>

      {/* ===== 본문 내용: 텍스트 에디터 ===== */}
      <section className={styles.rest_content}>
        <div className={styles.field_label}>본문 내용*</div>
        <TextEditor data={content} setData={inputContent} />
      </section>

      {/* ===== 등록 버튼 ===== */}
      <div className={styles.regist_btn}>
        <button type="button" onClick={regist}>
          등록
        </button>
      </div>
    </div>
  );
};

export default RestaurantRegist;
