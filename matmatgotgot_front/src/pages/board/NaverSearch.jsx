import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './NaverSearch.css';
import Swal from 'sweetalert2';

const NaverSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const markers = useRef({
    searchMarkers: [],
    clickedMarker: null,
  });

  useEffect(() => {
    if (window.naver && window.naver.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');

    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_KEY}&submodules=geocoder`;

    script.async = true;
    script.onload = initMap;

    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 14,
    });
  };

  const search = async () => {
    if (!query.trim()) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/api/naver/${query}`,
      );

      const data = res.data;
      setPlaces(data);

      if (data && data.length > 0) {
        handlePlaceClick(data[0]);
      }
    } catch (e) {
      console.error(e);
      alert('검색 실패');
    }
  };

  const handlePlaceClick = (place) => {
    if (!mapInstance.current) return;

    const rawX = Number(place.longitude);
    const rawY = Number(place.latitude);

    let latlng;

    if (rawX > 10000000) {
      latlng = new window.naver.maps.LatLng(rawY / 10000000, rawX / 10000000);
    } else if (window.naver.maps.TransCoord) {
      const tm128 = new window.naver.maps.Point(rawX, rawY);

      latlng = window.naver.maps.TransCoord.fromTM128ToLatLng(tm128);
    }

    if (!latlng) return;

    mapInstance.current.setCenter(latlng);
    mapInstance.current.setZoom(16);

    if (markers.current.clickedMarker) {
      markers.current.clickedMarker.setMap(null);
    }

    const marker = new window.naver.maps.Marker({
      position: latlng,
      map: mapInstance.current,
      animation: window.naver.maps.Animation.DROP,
    });

    const cleanTitle = place.title.replace(/<[^>]*>?/gm, '');

    const infoWindow = new window.naver.maps.InfoWindow({
      content: `<div class="info-window-content">${cleanTitle}</div>`,
      borderWidth: 0,
      backgroundColor: 'transparent',
      disableAnchor: true,
    });

    infoWindow.open(mapInstance.current, marker);

    markers.current.clickedMarker = marker;

    setSelectedPlace({
      ...place,
      cleanTitle,
    });
  };

  return (
    <div className="naver-search-container">
      <div className="search-box">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="장소를 입력하세요."
        />

        <button onClick={search}>검색</button>
      </div>

      <div className="search-content">
        <div className="places-section">
          <div className="search-result-title">
            검색결과
            <span>(최대 5개)</span>
          </div>

          <div className="places-list">
            {places.slice(0, 8).map((p, i) => (
              <div
                key={i}
                className="place-item"
                onClick={() => handlePlaceClick(p)}
              >
                <span className="material-icons place-icon">location_on</span>

                <div className="place-info">
                  <strong
                    dangerouslySetInnerHTML={{
                      __html: p.title,
                    }}
                  />
                  <p>{p.address}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="add-place-btn"
            onClick={() =>
              navigate('/boardAddress', {
                state: {
                  prevBoard: location.state?.prevBoard,
                },
              })
            }
          >
            검색 결과에 없는 장소 추가
          </button>
        </div>

        <div className="map-section">
          <div className="map-view" ref={mapRef} />

          <div className="bottom-buttons">
            <button className="cancel-btn" onClick={() => navigate(-1)}>
              취소
            </button>

            <button
              className="complete-btn"
              onClick={() => {
                if (!selectedPlace) {
                  Swal.fire({
                    icon: 'warning',
                    text: '장소를 선택해주세요.',
                    confirmButtonColor: 'var(--primary)',
                  });
                  return;
                }

                Swal.fire({
                  icon: 'question',
                  text: `'${selectedPlace.cleanTitle}'을(를) 선택하시겠습니까?`,
                  showCancelButton: true,
                  confirmButtonText: '선택',
                  cancelButtonText: '취소',
                  confirmButtonColor: 'var(--primary)',
                  cancelButtonColor: 'var(--gray4)',
                  color: 'var(--gray0)',
                  iconColor: 'var(--primary)',
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate('/board/write', {
                      state: {
                        selectedPlace: selectedPlace.cleanTitle,

                        placeNo: selectedPlace.placeNo,

                        prevBoard: location.state?.prevBoard,
                      },
                    });
                  }
                });
              }}
            >
              선택완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaverSearch;
