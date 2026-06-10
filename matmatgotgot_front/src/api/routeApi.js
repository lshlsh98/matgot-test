import axios from "axios";

export const fetchTmapDuration = async (start, end, type) => {
  const tmapAppKey = import.meta.env.VITE_TMAP_APP_KEY;

  const url =
    type === "WALK"
      ? "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&callback=function"
      : "https://apis.openapi.sk.com/tmap/routes?version=1&callback=function";

  try {
    const response = await axios.post(
      url,
      {
        startX: start.lng,
        startY: start.lat,
        endX: end.lng,
        endY: end.lat,
        reqCoordType: "WGS84GEO",
        resCoordType: "WGS84GEO",
        startName: start.name,
        endName: end.name,
        searchOption: "0",
      },
      {
        headers: {
          appKey: tmapAppKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data && response.data.features) {
      const totalTimeSeconds = response.data.features[0].properties.totalTime;
      return Math.ceil(totalTimeSeconds / 60);
    }
    return null;
  } catch (error) {
    console.error(`TMAP (${type}) 호출 실패:`, error);
    return null;
  }
};

export const fetchOdsayDuration = async (start, end) => {
  const odsayApiKey = import.meta.env.VITE_ODSAY_API_KEY;
  const url = "https://api.odsay.com/v1/api/searchPubTransPathT";

  try {
    const response = await axios.get(url, {
      params: {
        SX: start.lng,
        SY: start.lat,
        EX: end.lng,
        EY: end.lat,
        apiKey: odsayApiKey,
      },
      headers: {
        Authorization: null,
      },
    });

    if (response.data && response.data.result && response.data.result.path) {
      const totalTimeMinutes = response.data.result.path[0].info.totalTime;
      return totalTimeMinutes;
    }

    if (response.data?.error) {
      console.error("ODsay 서버 에러 메시지:", response.data.error);
    }

    return null;
  } catch (error) {
    console.error("ODsay API 호출 실패:", error);
    return null;
  }
};
