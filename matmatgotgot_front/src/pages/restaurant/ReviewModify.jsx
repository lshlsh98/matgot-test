import { useState, useEffect } from "react";
import styles from "./ReviewModify.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import ClearIcon from "@mui/icons-material/Clear";

const ReviewModify = () => {
  const navigate = useNavigate();
  // URL 파라미터에서 수정할 리뷰 번호 추출
  const { reviewNo, restNo } = useParams();

  // 폼 필드 상태 — 기존 데이터를 불러와 초기값으로 세팅
  const [review, setReview] = useState({
    restName: "",
    restAddr: "",
    reviewMenu: [],
    reviewVisit: "",
    reviewContent: "",
    fileList: [], // 서버에 저장된 기존 파일 목록
  });

  // 별점 상태 (1~5)
  const [rating, setRating] = useState(0);
  const [oldRating, setOldRating] = useState(0);

  // 체크된 태그 배열
  const [tags, setTags] = useState([]);

  // 새로 추가한 이미지 파일 배열
  const [files, setFiles] = useState([]);

  // 기존 파일 중 삭제할 파일명 배열
  const [deleteFileList, setDeleteFileList] = useState([]);

  // 기존 리뷰 데이터 조회 — 마운트 시 1회 실행
  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review?reviewNo=${reviewNo}`,
      )
      .then((res) => {
        const data = res.data;
        console.log(data);
        setReview({
          restName: data.restName ?? "",
          restAddr: data.restAddr ?? "",
          reviewMenu: data.reviewMenu ?? [],
          reviewVisit: data.reviewVisit ?? "",
          reviewContent: data.reviewContent ?? "",
          fileList: data.images ?? [],
        });
        setRating(data.rating ?? 0);
        setOldRating(data.rating ?? 0);
        setTags(data.tags ?? []);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({ title: "리뷰 정보를 불러오지 못했습니다.", icon: "error" });
      });
  }, [reviewNo]);

  // 새 이미지 추가
  const addFiles = (fileList) => {
    setFiles([...files, ...fileList]);
  };

  // 새 이미지 삭제
  const deleteFile = (targetFile) => {
    setFiles(files.filter((f) => f !== targetFile));
  };

  // 기존 서버 파일 삭제 표시
  // 실제 삭제는 수정 요청 시 deleteFileList를 서버에 전달
  const deleteServerFile = (fileName) => {
    console.log(fileName);
    setDeleteFileList([...deleteFileList, fileName]);
    // 화면에서도 즉시 제거
    setReview((prev) => ({
      ...prev,
      fileList: prev.fileList.filter((f) => f !== fileName),
    }));
  };

  // 입력 공통 핸들러
  const inputReview = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  // 태그 체크박스 핸들러
  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setTags([...tags, value]);
    } else {
      setTags(tags.filter((item) => item !== value));
    }
  };

  // 리뷰 수정 요청
  const modifyReview = () => {
    // 필수 항목 검증
    if (
      !review.restName.trim() ||
      !review.restAddr.trim() ||
      !review.reviewMenu.length > 0 ||
      !review.reviewVisit.trim() ||
      !review.reviewContent.trim() ||
      rating === 0
    ) {
      Swal.fire({ title: "모든 항목을 입력해주세요", icon: "warning" });
      return;
    }

    // 파일 포함 요청 → FormData 사용
    const form = new FormData();
    form.append("reviewNo", reviewNo);
    form.append("reviewContent", review.reviewContent);
    form.append("rating", rating);
    form.append("oldRating", oldRating);
    form.append("restNo", restNo);
    tags.forEach((tag) => form.append("tags", tag));
    // 새로 추가한 파일
    files.forEach((file) => form.append("files", file));
    // 삭제할 기존 파일명 목록
    deleteFileList.forEach((name) => form.append("deleteFileList", name));

    axios
      .put(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review/modify`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      .then((res) => {
        if (res.data > 0) {
          Swal.fire({ title: "리뷰 수정 완료", icon: "success" }).then(() => {
            navigate(-1); // 이전 페이지(맛집 상세)로 이동
          });
        }
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response);
        console.log(err.response?.data);
        Swal.fire({ title: "수정 중 오류가 발생했습니다.", icon: "error" });
      });
  };

  const tagList = [
    { value: "야외석", label: "야외석" },
    { value: "국물", label: "국물" },
    { value: "분위기", label: "분위기" },
    { value: "혼밥", label: "혼밥" },
    { value: "데이트", label: "데이트" },
  ];

  // 기존 파일 + 새 파일을 합산해 사진이 하나라도 있는지 판단
  const hasPhoto = review.fileList.length > 0 || files.length > 0;

  return (
    <div className={styles.page_wrap}>
      {/* ── 페이지 제목 ── */}
      <h2 className={styles.page_title}>리뷰 수정</h2>

      <section className={styles.regist_main}>
        {/* ======= 왼쪽: 폼 필드 ======= */}
        <div className={styles.main_left}>
          {/* 상호명 */}
          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="restName">
              상호명*
            </label>
            <input
              type="text"
              name="restName"
              id="restName"
              value={review.restName}
              onChange={inputReview}
              disabled={true}
            />
          </div>

          {/* 주소 */}
          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="restAddr">
              주소*
            </label>
            <input
              type="text"
              name="restAddr"
              id="restAddr"
              value={review.restAddr}
              onChange={inputReview}
              disabled={true}
            />
          </div>

          <div className={styles.field_group}>
            <label className={styles.field_label}>메뉴*</label>
            {review.reviewMenu && review.reviewMenu.length > 0 ? (
              <ul className={styles.menu_list}>
                {review.reviewMenu.map((item, idx) => (
                  <li key={idx} className={styles.menu_item}>
                    <span className={styles.menu_item_name}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.no_value}>인식된 메뉴가 없습니다</span>
            )}
          </div>

          {/* 방문 날짜 */}
          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="reviewVisit">
              방문 날짜*
            </label>
            <input
              type="date"
              name="reviewVisit"
              id="reviewVisit"
              value={review.reviewVisit}
              onChange={inputReview}
              disabled={true}
            />
          </div>

          {/* 별점 — MUI Rating */}
          <div className={styles.star_rating}>
            <div className={styles.field_label}>별점*</div>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
              sx={{
                color: "var(--primary)",
                "& .MuiRating-iconEmpty": {
                  color: "var(--gray5)",
                },
              }}
            />
          </div>

          {/* 태그 선택 */}
          <div className={styles.tag_wrap}>
            <div className={styles.field_label}>태그 선택</div>
            <div className={styles.tag}>
              {tagList.map(({ value, label }) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    value={value}
                    checked={tags.includes(value)}
                    onChange={handleTagChange}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 사진 + 리뷰 내용 */}
        <div className={styles.main_right}>
          {/* ── 사진 등록 ── */}
          <div className={styles.field_group}>
            <input
              type="file"
              id="files"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => addFiles(Array.from(e.target.files))}
            />

            {/* 사진이 없을 때: 클릭 영역 */}
            {!hasPhoto ? (
              <label htmlFor="files" className={styles.photo_placeholder}>
                사진 등록
              </label>
            ) : (
              /* 사진이 있을 때: 기존 파일 + 새 파일 미리보기 그리드 */
              <div className={styles.photo_preview}>
                {/* 기존 서버 파일 — X 버튼으로 삭제 표시 */}
                {review.fileList.map((file, index) => (
                  <div key={`server-${index}`} className={styles.preview_item}>
                    <img src={`${file}`} alt={`기존 이미지 ${index + 1}`} />
                    <button
                      type="button"
                      className={styles.preview_delete}
                      onClick={() => deleteServerFile(file)}
                    >
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}

                {/* 새로 추가한 파일 미리보기 */}
                {files.map((file, index) => (
                  <div key={`new-${index}`} className={styles.preview_item}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`새 이미지 ${index + 1}`}
                    />
                    <button
                      type="button"
                      className={styles.preview_delete}
                      onClick={() => deleteFile(file)}
                    >
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}

                {/* 추가 업로드 버튼 */}
                <label htmlFor="files" className={styles.photo_add_more}>
                  +
                </label>
              </div>
            )}
          </div>

          {/* ── 리뷰 내용 ── */}
          <div className={styles.field_group}>
            <label className={styles.field_label} htmlFor="reviewContent">
              리뷰 내용*
            </label>
            <textarea
              className={styles.review_textarea}
              name="reviewContent"
              id="reviewContent"
              value={review.reviewContent}
              onChange={inputReview}
              placeholder="리뷰 내용을 입력하세요"
            />
          </div>

          {/* ── 수정 버튼 ── */}
          <div className={styles.btn_zone}>
            <button
              type="button"
              className={styles.regist_btn}
              onClick={modifyReview}
            >
              리뷰 수정
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewModify;
