import { useEffect, useRef } from 'react';
import './NaverMap.css';

const NaverMap = ({ places }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!window.naver || !window.naver.maps) return;

    const center = new window.naver.maps.LatLng(37.5665, 126.978);

    mapInstance.current = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom: 14,
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !places || !window.naver.maps) return;

    // 기존 마커 제거
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    places.forEach((place) => {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);

      const position = new window.naver.maps.LatLng(lat, lng);

      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstance.current,
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div class="info-window">${place.title}</div>`,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
    });

    if (places.length > 0) {
      const lat = parseFloat(places[0].latitude);
      const lng = parseFloat(places[0].longitude);

      const firstPos = new window.naver.maps.LatLng(lat, lng);

      mapInstance.current.setCenter(firstPos);
      mapInstance.current.setZoom(16);
    }
  }, [places]);

  return <div ref={mapRef} className="naver-map" />;
};

export default NaverMap;
