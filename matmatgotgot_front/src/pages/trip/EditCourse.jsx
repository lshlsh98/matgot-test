import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CreateCourse.module.css";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import CourseMap from "../../components/trip/CourseMap";

import RestaurantSearch from "../../components/trip/RestaurantSearch";
import SelectedCourseList from "../../components/trip/SelectedCourseList";
import CourseSummaryPanel from "../../components/trip/CourseSummaryPanel";
import AddMenuModal from "../../components/trip/AddMenuModal";
import { useAuthStore } from "../../store/useAuthStore.js";

const EditCourse = () => {
  const { tplan_no } = useParams();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRestaurants, setSelectedRestaurants] = useState({ 1: [] });
  const [currentDay, setCurrentDay] = useState(1);
  const [travelDays, setTravelDays] = useState(1);

  const [courseTitle, setCourseTitle] = useState("");
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [transitTimes, setTransitTimes] = useState({});
  const [transitModes, setTransitModes] = useState({});
  const [courseDesc, setCourseDesc] = useState("");
  // 💡 기존 코스의 지역 정보를 백업해둘 상태 추가
  const [originalRegion, setOriginalRegion] = useState("");

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [targetRestaurantId, setTargetRestaurantId] = useState(null);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuImage, setNewMenuImage] = useState(null);
  const [newMenuImagePreview, setNewMenuImagePreview] = useState("");

  const TMAP_APP_KEY = import.meta.env.VITE_TMAP_APP_KEY;
  const ODSAY_API_KEY = import.meta.env.VITE_ODSAY_API_KEY;

  const [tags, setTags] = useState([]);

  const { memberNo: loginMemberNo, isReady } = useAuthStore();

  useEffect(() => {
    if (isReady && !loginMemberNo) {
      alert("로그인이 필요한 서비스입니다. 메인 페이지로 이동합니다.");
      navigate("/");
    }
  }, [isReady, loginMemberNo, navigate]);

  const handleCourseDescChange = (value) => {
    if (value.length <= 300) {
      setCourseDesc(value);
    }
  };

  useEffect(() => {
    if (!isReady || !loginMemberNo) return;

    const fetchOriginalCourseData = async () => {
      try {
        const tagResponse = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/create/tags`,
        );
        let tagList = tagResponse.data;

        const detailResponse = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/detail/${tplan_no}`,
        );
        const course = detailResponse.data;
        console.log("불러온 원본 데이터:", course);

        if (course.memberNo !== loginMemberNo) {
          alert("본인이 작성한 코스만 수정할 수 있습니다.");
          navigate(`/trip/detail/${tplan_no}`);
          return;
        }

        setCourseTitle(course.title || "");
        setCourseDesc(course.desc || "");
        setTravelDays(course.tplanDays);
        setOriginalRegion(course.region || "");

        if (
          course.tags &&
          Array.isArray(course.tags) &&
          course.tags.length > 0
        ) {
          tagList = tagList.map((t) => {
            const targetText = t.text ? t.text.replace(/^#/, "") : "";

            const isActive = course.tags.some((courseTag) => {
              console.log(courseTag);
              if (typeof courseTag === "object" && courseTag !== null) {
                const courseTagName = courseTag.replace(/^#/, "");
                return courseTagName === targetText;
              }

              if (typeof courseTag === "string") {
                return courseTag.replace(/^#/, "") === targetText;
              }

              return courseTag === t.tagNo;
            });

            return { ...t, active: isActive };
          });
        }
        setTags(tagList);

        if (course.dayRoutes) {
          const loadedRestaurants = {};
          const loadedTransitModes = {};

          for (const dayKey of Object.keys(course.dayRoutes)) {
            const routes = course.dayRoutes[dayKey] || [];

            const routesWithMenus = await Promise.all(
              routes.map(async (node, index) => {
                if (index < routes.length - 1) {
                  const nextNode = routes[index + 1];
                  const transitKey = `Day${dayKey}_${node.restNo}_${nextNode.restNo}`;
                  if (node.transitType) {
                    loadedTransitModes[transitKey] = node.transitType;
                  }
                }

                let menuPool = [];
                try {
                  const menuResponse = await axios.get(
                    `${import.meta.env.VITE_BACKSERVER}/trips/create/menus`,
                    { params: { restNo: node.restNo } },
                  );
                  menuPool = menuResponse.data;
                } catch (menuError) {
                  console.error(
                    `식당 번호 ${node.restNo}의 메뉴 조회 실패:`,
                    menuError,
                  );
                  menuPool = node.menus || [];
                }

                return {
                  restNo: node.restNo,
                  restName: node.restName,
                  restAddr: node.restAddr || node.rest_addr || node.addr || "",
                  lat: node.lat,
                  lng: node.lng,
                  selectedMenus: node.selectedMenus || [],
                  menus: menuPool,
                };
              }),
            );

            loadedRestaurants[dayKey] = routesWithMenus;
          }

          setSelectedRestaurants(loadedRestaurants);
          setTransitModes(loadedTransitModes);
        }
      } catch (error) {
        console.error("기존 코스 수정 정보를 불러오지 못했습니다.", error);
        alert("데이터 로딩 실패");
      }
    };

    if (tplan_no) {
      fetchOriginalCourseData();
    }
  }, [tplan_no, isReady, loginMemberNo, navigate]);

  const handleTravelDaysChange = (days) => {
    const numDays = Number(days);
    setTravelDays(numDays);

    setSelectedRestaurants((prev) => {
      const nextState = { ...prev };
      for (let i = 1; i <= numDays; i++) {
        if (!nextState[i]) nextState[i] = [];
      }
      Object.keys(nextState).forEach((key) => {
        if (Number(key) > numDays) delete nextState[key];
      });
      return nextState;
    });

    if (currentDay > numDays) {
      setCurrentDay(numDays);
    }
  };

  const handleRestaurantClick = async (res) => {
    const currentDayList = selectedRestaurants[currentDay] || [];
    const isExist = currentDayList.find((item) => item.restNo === res.restNo);

    if (isExist) {
      setSelectedRestaurants((prev) => ({
        ...prev,
        [currentDay]: currentDayList.filter(
          (item) => item.restNo !== res.restNo,
        ),
      }));
      return;
    }

    if (currentDayList.length >= 6) {
      alert("현재 Day의 식당이 많습니다. 동선상 비효율적일 수 있습니다.");
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/trips/create/menus`,
        { params: { restNo: res.restNo } },
      );

      setSelectedRestaurants((prev) => ({
        ...prev,
        [currentDay]: [
          ...currentDayList,
          { ...res, selectedMenus: [], menus: response.data },
        ],
      }));
    } catch (error) {
      console.error("메뉴 조회 실패:", error);
      setSelectedRestaurants((prev) => ({
        ...prev,
        [currentDay]: [
          ...currentDayList,
          { ...res, selectedMenus: [], menus: [] },
        ],
      }));
    }
  };

  const handleMenuToggle = (restaurantId, menu) => {
    setSelectedRestaurants((prev) => ({
      ...prev,
      [currentDay]: prev[currentDay].map((res) => {
        if (res.restNo !== restaurantId) return res;
        const isMenuSelected = res.selectedMenus.some(
          (m) => m.menuNo === menu.menuNo,
        );
        return {
          ...res,
          selectedMenus: isMenuSelected
            ? res.selectedMenus.filter((m) => m.menuNo !== menu.menuNo)
            : [...res.selectedMenus, menu],
        };
      }),
    }));
  };

  const openAddMenuModal = (e, restaurantId) => {
    e.stopPropagation();
    setTargetRestaurantId(restaurantId);
    setIsMenuModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMenuImage(file);
      setNewMenuImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddMenuSubmit = async (e) => {
    e.preventDefault();
    if (!newMenuName.trim() || !newMenuPrice.trim()) {
      alert("메뉴명과 가격은 필수 입력 항목입니다.");
      return;
    }
    const priceNum = parseInt(newMenuPrice.replace(/[^0-9]/g, ""), 10);
    if (isNaN(priceNum)) {
      alert("올바른 가격 숫자를 입력해 주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("restNo", targetRestaurantId);
      formData.append("menuName", newMenuName);
      formData.append("menuPrice", newMenuPrice);
      if (newMenuImage) formData.append("image", newMenuImage);

      await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/trips/create/menu`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const response = await axios.get(
        `${import.meta.env.VITE_BACKSERVER}/trips/create/menus`,
        { params: { restNo: targetRestaurantId } },
      );

      setSelectedRestaurants((prev) => ({
        ...prev,
        [currentDay]: prev[currentDay].map((res) =>
          res.restNo === targetRestaurantId
            ? { ...res, menus: response.data }
            : res,
        ),
      }));

      setIsMenuModalOpen(false);
      setNewMenuName("");
      setNewMenuPrice("");
      setNewMenuImage(null);
      setNewMenuImagePreview("");
    } catch (error) {
      console.error(error);
      alert("메뉴 등록 실패");
    }
  };

  const handleTagToggle = (id) => {
    setTags(
      tags.map((tag) =>
        tag.id === id ? { ...tag, active: !tag.active } : tag,
      ),
    );
  };

  const [draggedIndex, setDraggedIndex] = useState(null);
  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (index) => {
    if (draggedIndex === null) return;
    const currentDayList = [...selectedRestaurants[currentDay]];
    const draggedItem = currentDayList[draggedIndex];
    currentDayList.splice(draggedIndex, 1);
    currentDayList.splice(index, 0, draggedItem);

    setSelectedRestaurants((prev) => ({
      ...prev,
      [currentDay]: currentDayList,
    }));
    setDraggedIndex(null);
    setTransitModes({});
    setTransitTimes({});
  };

  const handleTransitChange = async (transitKey, mode) => {
    setTransitModes((prev) => ({ ...prev, [transitKey]: mode }));
    const [, originNo, destinationNo] = transitKey.split("_");
    const currentDayList = selectedRestaurants[currentDay] || [];

    const origin = currentDayList.find((r) => String(r.restNo) === originNo);
    const destination = currentDayList.find(
      (r) => String(r.restNo) === destinationNo,
    );

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng)
      return;

    const startX = Number(origin.lng);
    const startY = Number(origin.lat);
    const endX = Number(destination.lng);
    const endY = Number(destination.lat);

    if (mode === "WALK" || mode === "CAR") {
      const endpoint =
        mode === "WALK"
          ? "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json"
          : "https://apis.openapi.sk.com/tmap/routes?version=1&format=json";

      try {
        const requestBody =
          mode === "WALK"
            ? {
                startX,
                startY,
                endX,
                endY,
                startName: "출발지",
                endName: "목적지",
              }
            : {
                startX,
                startY,
                endX,
                endY,
                reqCoordType: "WGS84GEO",
                resCoordType: "WGS84GEO",
                searchOption: "0",
              };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", appKey: TMAP_APP_KEY },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (data.features?.[0]) {
          const totalMinutes = Math.ceil(
            data.features[0].properties.totalTime / 60,
          );
          setTransitTimes((prev) => ({
            ...prev,
            [transitKey]: `${totalMinutes}분`,
          }));
        }
      } catch (error) {
        console.error("Tmap 경로 조회 실패:", error);
      }
    } else if (mode === "PUB") {
      try {
        const url = "https://api.odsay.com/v1/api/searchPubTransPathT";

        const response = await axios.get(url, {
          params: {
            SX: startX,
            SY: startY,
            EX: endX,
            EY: endY,
            apiKey: ODSAY_API_KEY,
          },
          headers: {
            Authorization: null,
          },
        });

        const data = response.data;

        if (data.result?.path?.[0]) {
          setTransitTimes((prev) => ({
            ...prev,
            [transitKey]: `${data.result.path[0].info.totalTime}분`,
          }));
        } else {
          setTransitTimes((prev) => ({
            ...prev,
            [transitKey]: "도보 추천 (경로 없음)",
          }));
        }
      } catch (error) {
        console.error("ODsay 대중교통 조회 실패:", error);
        setTransitTimes((prev) => ({
          ...prev,
          [transitKey]: "조회 실패",
        }));
      }
    }
  };

  const allRestaurants = Object.values(selectedRestaurants).flat();
  const totalCount = allRestaurants.length;
  const restaurantStayTime = totalCount * 60;
  const totalTransitMinutes = Object.values(transitTimes).reduce(
    (sum, timeStr) => {
      const num = parseInt(timeStr, 10);
      return isNaN(num) ? sum : sum + num;
    },
    0,
  );

  const totalMinutes =
    totalCount > 0 ? restaurantStayTime + totalTransitMinutes : 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalDistance =
    totalCount > 1
      ? ((totalCount - Object.keys(selectedRestaurants).length) * 1.4).toFixed(
          1,
        )
      : 0;
  const totalCost = allRestaurants.reduce((sum, res) => {
    return (
      sum +
      res.selectedMenus.reduce(
        (menuSum, m) => menuSum + (m.price || m.menuPrice),
        0,
      )
    );
  }, 0);

  const getMenuSelectorText = (selectedMenus) => {
    if (selectedMenus.length === 0) return "📌 필수 메뉴 선택하기";
    const menuSum = selectedMenus.reduce(
      (sum, m) => sum + (m.price || m.menuPrice),
      0,
    );
    if (selectedMenus.length === 1)
      return `📌 ${selectedMenus[0].name || selectedMenus[0].menuName} (${menuSum.toLocaleString()}원)`;
    return `📌 ${selectedMenus[0].name || selectedMenus[0].menuName} 외 ${selectedMenus.length - 1}개 (총 ${menuSum.toLocaleString()}원)`;
  };

  const formatTransitTime = (timeStr) => {
    if (!timeStr || isNaN(parseInt(timeStr, 10))) return timeStr || "";
    const tMinutes = parseInt(timeStr, 10);
    const hr = Math.floor(tMinutes / 60);
    const mn = tMinutes % 60;
    return hr > 0 ? (mn > 0 ? `${hr}시간 ${mn}분` : `${hr}시간`) : `${mn}분`;
  };

  const extractCityName = (addr) => {
    if (!addr) return "";
    const trimAddr = addr.trim();
    const firstWord = trimAddr.split(" ")[0];

    if (firstWord.endsWith("도") && trimAddr.split(" ").length > 1) {
      return trimAddr.split(" ")[1];
    }
    return firstWord;
  };

  const handleUpdateCourse = async () => {
    if (!courseTitle.trim()) {
      alert("코스명을 입력해 주세요.");
      return;
    }

    const allSelectedList = Object.values(selectedRestaurants).flat();
    if (allSelectedList.length === 0) {
      alert("최소 한 개 이상의 식당을 코스에 추가해야 합니다.");
      return;
    }

    for (const dayStr of Object.keys(selectedRestaurants)) {
      const dayNum = Number(dayStr);
      const restaurantList = selectedRestaurants[dayNum] || [];

      for (let index = 0; index < restaurantList.length; index++) {
        const res = restaurantList[index];

        if (!res.selectedMenus || res.selectedMenus.length === 0) {
          alert(
            `[Day ${dayNum}] '${res.restName || "선택한 식당"}'의 추천 메뉴를 최소 1개 이상 선택해 주세요.`,
          );
          setCurrentDay(dayNum);
          return;
        }

        const nextRes = restaurantList[index + 1];
        if (nextRes) {
          const transitKey = `Day${dayNum}_${res.restNo}_${nextRes.restNo}`;
          if (!transitModes[transitKey]) {
            alert(
              `[Day ${dayNum}] '${res.restName || "출발지"}'에서 '${nextRes.restName || "목적지"}'로 이동하는 교통수단을 선택해 주세요.`,
            );
            setCurrentDay(dayNum);
            return;
          }
        }
      }
    }

    const activeTags = tags.filter((t) => t.active).map((t) => t.id || t.tagNo);

    // 💡 주소 데이터 추출
    const cities = allSelectedList
      .map((res) => extractCityName(res.restAddr))
      .filter((city) => city !== "");

    const uniqueCities = [...new Set(cities)];

    // 💡 [핵심 방어 코드] 추출된 도시명이 없다면 백업해둔 기존 지역 이름(originalRegion)을 최종 할당
    let tplanRegionValue = uniqueCities.join(", ");
    if (!tplanRegionValue && originalRegion) {
      tplanRegionValue = originalRegion;
    }

    const daysData = Object.keys(selectedRestaurants).map((dayStr) => {
      const dayNum = Number(dayStr);
      const restaurantList = selectedRestaurants[dayNum] || [];

      const schedules = restaurantList.map((res, index) => {
        const nextRes = restaurantList[index + 1];
        const transitKey = nextRes
          ? `Day${dayNum}_${res.restNo}_${nextRes.restNo}`
          : null;

        return {
          tscheDayNo: dayNum,
          tscheOrderNo: index + 1,
          restNo: res.restNo,
          selectedMenuNos: res.selectedMenus.map((m) => m.menuNo),
          route: nextRes
            ? { transitType: transitModes[transitKey] || "WALK" }
            : null,
        };
      });

      return { day: dayNum, schedules };
    });

    const payload = {
      tplanNo: tplan_no,
      tplanTitle: courseTitle,
      tplanDesc: courseDesc,
      tplanRegion: tplanRegionValue, // 💡 이제 빈 값이 아닌 온전한 지역 데이터가 담김
      tplanDays: travelDays,
      tplanTotalPrice: totalCost,
      tagNos: activeTags,
      days: daysData,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKSERVER}/trips/edit/${tplan_no}`,
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        alert("여행 코스가 성공적으로 수정되었습니다! ✨");
        navigate(`/trip/detail/${tplan_no}`);
      }
    } catch (error) {
      console.error("코스 수정 실패 에러 로그:", error);
      if (error.response) {
        alert(
          `서버 응답 오류 (${error.response.status}): ${error.response.data}`,
        );
      } else {
        alert(`프론트엔드 스크립트 내부 오류: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (!searchKeyword.trim()) {
      setRestaurants([]);
      return;
    }
    const delayDebounceTimer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/trips/create/search`,
          { params: { keyword: searchKeyword } },
        );
        setRestaurants(response.data);
      } catch (error) {
        console.error(error);
      }
    }, 300);
    return () => clearTimeout(delayDebounceTimer);
  }, [searchKeyword]);

  if (!isReady || !loginMemberNo) {
    return (
      <div className={styles.loading}>페이지 접근 권한을 확인 중입니다...</div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainHeader}>
        <EditIcon className={styles.editIcon} /> <h2>코스 수정하기</h2>
      </div>

      <div className={styles.gridDashboard}>
        <div className={styles.leftColumn}>
          <RestaurantSearch
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            restaurants={restaurants}
            selectedRestaurants={selectedRestaurants[currentDay] || []}
            onRestaurantClick={handleRestaurantClick}
          />

          <SelectedCourseList
            selectedRestaurants={selectedRestaurants[currentDay] || []}
            travelDays={travelDays}
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            openAccordionId={openAccordionId}
            setOpenAccordionId={setOpenAccordionId}
            transitModes={transitModes}
            transitTimes={transitTimes}
            onRestaurantClick={handleRestaurantClick}
            onMenuToggle={handleMenuToggle}
            onOpenAddMenuModal={openAddMenuModal}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTransitChange={handleTransitChange}
            getMenuSelectorText={getMenuSelectorText}
            formatTransitTime={formatTransitTime}
          />
        </div>

        <div className={styles.rightColumn}>
          <CourseSummaryPanel
            courseTitle={courseTitle}
            setCourseTitle={setCourseTitle}
            courseDesc={courseDesc}
            onCourseDescChange={handleCourseDescChange}
            travelDays={travelDays}
            onTravelDaysChange={handleTravelDaysChange}
            tags={tags}
            onTagToggle={handleTagToggle}
            hours={hours}
            mins={mins}
            totalDistance={totalDistance}
            totalCost={totalCost}
            onSubmit={handleUpdateCourse}
          />

          <div className={styles.mapPlaceholderPanel}>
            <CourseMap list={selectedRestaurants[currentDay] || []} />
          </div>
        </div>
      </div>

      <AddMenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        newMenuName={newMenuName}
        setNewMenuName={setNewMenuName}
        newMenuPrice={newMenuPrice}
        setNewMenuPrice={setNewMenuPrice}
        newMenuImagePreview={newMenuImagePreview}
        onImageChange={handleImageChange}
        onSubmit={handleAddMenuSubmit}
      />
    </div>
  );
};

export default EditCourse;
