import React, { useMemo } from "react";
import styles from "./CourseRouteMap.module.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const CourseRouteMap = ({ routes: propsRoutes }) => {
  const routes = propsRoutes;
  const totalItems = routes.length;

  const width = 500;
  const height = 120;
  const paddingX = 40;

  const points = useMemo(() => {
    if (totalItems === 0) return [];
    if (totalItems === 1) return [{ x: width / 2, y: height / 2 }];

    return routes.map((_, index) => {
      const x = paddingX + ((width - paddingX * 2) / (totalItems - 1)) * index;

      let y = height / 2;
      if (totalItems > 2) {
        y = index % 2 === 0 ? height / 2 - 20 : height / 2 + 20;
      }
      return { x, y };
    });
  }, [totalItems]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;

      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  return (
    <div className={styles.routeMapContainer}>
      <svg className={styles.svgLayer} viewBox={`0 0 ${width} ${height}`}>
        {pathD && (
          <path
            d={pathD}
            className={styles.dashedPath}
            fill="none"
            stroke="var(--text1)"
            strokeWidth="3"
            strokeDasharray="6,6"
          />
        )}
      </svg>

      <div className={styles.nodesOverlay}>
        {points.map((point, index) => {
          const route = routes[index];
          return (
            <div
              key={route.id}
              className={styles.nodeItem}
              style={{
                left: `${(point.x / width) * 100}%`,
                top: `${(point.y / height) * 100}%`,
              }}
            >
              <div className={styles.markerWrapper}>
                <LocationOnIcon className={styles.pinIcon} />
                <span className={styles.markerNumber}>{index + 1}</span>
              </div>

              <div className={styles.balloonName}>{route.restName}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseRouteMap;
