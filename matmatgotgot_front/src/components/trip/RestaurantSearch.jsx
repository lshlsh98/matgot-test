import SearchIcon from "@mui/icons-material/Search";
import styles from "./RestaurantSearch.module.css";

const RestaurantSearch = ({
  searchKeyword,
  setSearchKeyword,
  restaurants,
  selectedRestaurants,
  onRestaurantClick,
}) => {
  return (
    <div className={styles.searchBoxPanel}>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="식당 검색 (ex: ㅎ)"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <SearchIcon />
      </div>

      <div className={styles.searchResultList}>
        {!searchKeyword.trim() ? (
          <div className={styles.searchStatusNotice}>
            🔍 원하시는 식당을 검색해 보세요!
          </div>
        ) : restaurants.length === 0 ? (
          <div className={styles.searchStatusNotice}>
            😭 검색 결과가 없습니다. 다시 입력해 주세요.
          </div>
        ) : (
          restaurants.map((res) => {
            const isSelected = selectedRestaurants.some(
              (item) => item.restNo === res.restNo,
            );
            return (
              <div
                key={res.restNo}
                className={`${styles.searchResultItem} ${isSelected ? styles.selectedRes : ""}`}
                onClick={() => onRestaurantClick(res)}
              >
                <div className={styles.resTitles}>
                  <div className={styles.resTitleReal}>
                    <div className={styles.resName}>{res.restName}</div>
                    <div className={styles.resCategory}>{res.category}</div>
                  </div>
                  <div className={styles.resRating}>
                    ⭐ {res.ratingAverage} ({res.reviewTotalCount}건)
                  </div>
                </div>
                <div className={styles.resAddress}>{res.restAddr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RestaurantSearch;
