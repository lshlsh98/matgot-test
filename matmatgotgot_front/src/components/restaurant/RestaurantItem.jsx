import styles from "./RestaurantItem.module.css";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";

const RestaurantItem = ({ rest }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.card}
      onClick={() => {
        navigate(`/rest/view/${rest.restNo}`);
      }}
    >
      <div className={styles.restaurant_item}>
        <div className={styles.name_like}>
          <div className={styles.rest_name}>{rest.restName}</div>
          <div className={styles.like}>
            {rest.isLike ? (
              <FavoriteIcon className={styles.favorite_icon} />
            ) : (
              <FavoriteBorderIcon className={styles.favorite_icon} />
            )}
          </div>
        </div>
        <div className={styles.rest_img}>
          {rest.restThumb ? (
            <img src={rest.restThumb} />
          ) : (
            <ImageNotSupportedIcon className={styles.ImageNotSupportedIcon} />
          )}
        </div>
        <div className={styles.rest_addr}>{rest.restAddr}</div>
        <div className={styles.reset_category}>{rest.category}</div>
      </div>
      <div className={styles.like_reviews}>
        <div className={styles.review_count}>
          리뷰수 {rest.reviewTotalCount}
        </div>
        <div className={styles.star}>★ {rest?.ratingAvg ?? 0}</div>
      </div>
    </div>
  );
};

export default RestaurantItem;
