import CloseIcon from "@mui/icons-material/Close";
import styles from "./AddMenuModal.module.css";

const AddMenuModal = ({
  isOpen,
  onClose,
  newMenuName,
  setNewMenuName,
  newMenuPrice,
  setNewMenuPrice,
  newMenuImagePreview,
  onImageChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>✨ 새로운 메뉴 추가</h3>
          <CloseIcon className={styles.modalCloseBtn} onClick={onClose} />
        </div>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>
              메뉴명 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="메뉴 이름을 입력하세요"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              가격(원) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              placeholder="숫자만 입력하세요"
              value={newMenuPrice}
              onChange={(e) => setNewMenuPrice(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              메뉴 사진 <span className={styles.optional}>(선택)</span>
            </label>
            <div className={styles.imageUploadWrapper}>
              <input
                type="file"
                accept="image/*"
                id="menuImgInput"
                onChange={onImageChange}
              />
              <label htmlFor="menuImgInput" className={styles.fileSelectBtn}>
                파일 선택
              </label>
              {newMenuImagePreview && (
                <div className={styles.previewContainer}>
                  <img
                    src={newMenuImagePreview}
                    alt="미리보기"
                    className={styles.imgPreview}
                  />
                </div>
              )}
            </div>
          </div>
          <div className={styles.modalActionRow}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className={styles.saveBtn}>
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuModal;
