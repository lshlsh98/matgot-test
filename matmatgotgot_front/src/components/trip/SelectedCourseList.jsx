import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styles from "./SelectedCourseList.module.css";

const SelectedCourseList = ({
  selectedRestaurants,
  travelDays,
  currentDay,
  onDayChange,
  openAccordionId,
  setOpenAccordionId,
  transitModes,
  transitTimes,
  onRestaurantClick,
  onMenuToggle,
  onOpenAddMenuModal,
  onDragStart,
  onDragOver,
  onDrop,
  onTransitChange,
  getMenuSelectorText,
  formatTransitTime,
}) => {
  return (
    <div className={styles.courseListPanel}>
      <div className={styles.dayTabContainer}>
        {Array.from({ length: travelDays }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            className={`${styles.dayTabButton} ${currentDay === day ? styles.activeDayTab : ""}`}
            onClick={() => onDayChange(day)}
          >
            Day {day}
          </button>
        ))}
      </div>

      <div className={styles.panelScrollAreaPadding}>
        <div className={styles.panelScrollArea}>
          {selectedRestaurants.length === 0 ? (
            <div className={styles.emptyNotice}>
              Day {currentDay}에 등록된 식당이 없습니다.
              <br />
              상단에서 식당을 검색해 코스에 추가해 보세요.
            </div>
          ) : (
            selectedRestaurants.map((res, index) => {
              const nextRes = selectedRestaurants[index + 1];
              const transitKey = nextRes
                ? `Day${currentDay}_${res.restNo}_${nextRes.restNo}`
                : null;

              return (
                <div key={res.restNo} className={styles.courseItemWrap}>
                  <div
                    className={styles.courseCard}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(index)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.orderBadge}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.cardResName}>{res.restName}</span>
                      <CloseIcon
                        className={styles.deleteIcon}
                        onClick={() => onRestaurantClick(res)}
                      />
                    </div>

                    <div
                      className={styles.menuSelectorBar}
                      onClick={() =>
                        setOpenAccordionId(
                          openAccordionId === res.restNo ? null : res.restNo,
                        )
                      }
                    >
                      <span>{getMenuSelectorText(res.selectedMenus)}</span>
                      {openAccordionId === res.restNo ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </div>

                    {openAccordionId === res.restNo && (
                      <div className={styles.menuGridDropdown}>
                        {(res.menus || []).map((menu) => {
                          const isMenuChecked = res.selectedMenus.some(
                            (m) => m.menuNo === menu.menuNo,
                          );
                          return (
                            <div
                              key={menu.menuNo}
                              className={`${styles.menuPhotoCard} ${isMenuChecked ? styles.activeMenu : ""}`}
                              onClick={() => onMenuToggle(res.restNo, menu)}
                            >
                              <div className={styles.menuPhotoBox}>
                                {menu.imagePreview ? (
                                  <img
                                    src={menu.imagePreview}
                                    alt={menu.name}
                                    className={styles.menuThumbImg}
                                  />
                                ) : (
                                  "메뉴 사진"
                                )}
                              </div>
                              <div className={styles.menuInfo}>
                                <div className={styles.mName}>{menu.name}</div>
                                <div className={styles.mPrice}>
                                  {menu.price.toLocaleString()}원
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div
                          className={styles.addMenuTriggerCard}
                          onClick={(e) => onOpenAddMenuModal(e, res.restNo)}
                        >
                          <AddIcon className={styles.addMenuIcon} />
                          <span>메뉴 등록하기</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {index < selectedRestaurants.length - 1 && transitKey && (
                    <div className={styles.transitInfo}>
                      <div className={styles.dotsLine}></div>
                      <div className={styles.transitText}>
                        <div className={styles.transitBtnGroup}>
                          {["WALK", "PUB", "CAR"].map((mode) => {
                            const label =
                              mode === "WALK"
                                ? "도보"
                                : mode === "PUB"
                                  ? "대중교통"
                                  : "자차";

                            const isActive =
                              (transitModes[transitKey] || "WALK") === mode;

                            return (
                              <button
                                key={mode}
                                type="button"
                                className={`${styles.transitBtn} ${isActive ? styles.activeTransit : ""}`}
                                onClick={() =>
                                  onTransitChange(transitKey, mode)
                                }
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        <strong className={styles.durationText}>
                          {transitTimes[transitKey]
                            ? `약 ${formatTransitTime(transitTimes[transitKey])} 소요`
                            : "이동 수단을 선택해 주세요"}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedCourseList;
