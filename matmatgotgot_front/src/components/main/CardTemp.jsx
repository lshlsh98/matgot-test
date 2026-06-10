import styles from "./CardTemp.module.css";

const CardTemp = ({ item }) => {
  const isFullUrl = item.imgName?.startsWith("http");
  const imgSrc = isFullUrl
    ? item.imgName
    : `${import.meta.env.VITE_BACKSERVER}/menu/${item.imgName || "basic.jpeg"}`;

  // 💡 HTML 태그를 제거하는 함수 추가
  const stripHtmlTags = (htmlString) => {
    if (!htmlString) return "";
    // 정규식을 이용해 <...태그...> 형태를 전부 공백으로 치환합니다.
    return htmlString.replace(/<[^>]*>/g, "").trim();
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        <img
          src={imgSrc}
          alt={item.title || "식당 이미지"}
          className={styles.image}
        />
      </div>

      <div className={styles.infoBox}>
        {item.restAddr && (
          <span className={styles.addressText} title={item.restAddr}>
            {item.restAddr.split(" ")[0]}{" "}
            {item.restAddr.split(" ")[1] || ""}{" "}
          </span>
        )}

        <h3 className={styles.title}>{item.title}</h3>

        <div className={styles.divider}></div>

        {/* 💡 함수를 거쳐 순수 텍스트만 렌더링하도록 수정 */}
        <p className={styles.description}>{stripHtmlTags(item.desc)}</p>
      </div>
    </div>
  );
};

export default CardTemp;
