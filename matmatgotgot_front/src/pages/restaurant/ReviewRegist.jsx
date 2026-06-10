import { useEffect, useState } from 'react';
import styles from './ReviewRegist.module.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuthStore } from '../../store/useAuthStore'; //지연

const ReviewRegist = () => {
  const { restNo } = useParams();
  const navigate = useNavigate();
  const memberStatus = useAuthStore((state) => state.memberStatus); //지연

  // 폼 필드 상태
  const [review, setReview] = useState({
    restName: '',
    restAddr: '',
    reviewVisit: '',
  });
  const [menus, setMenus] = useState([]);
  const [reviewContent, setReviewContent] = useState('');

  useEffect(() => {
    const savedData = sessionStorage.getItem('receiptData');

    if (!savedData) return;

    const receiptData = JSON.parse(savedData);
    console.log(receiptData);

    setReview({
      ...review,
      restName: receiptData.storeName,
      restAddr: receiptData.address,
      reviewVisit: receiptData.date,
    });

    setMenus(receiptData.menuItems);
  }, []);

  // 별점 상태 (1~5, 0 = 미선택)
  const [rating, setRating] = useState(0);

  // 체크된 태그 배열
  const [tags, setTags] = useState([]);

  // 첨부 이미지 파일 배열
  const [files, setFiles] = useState([]);

  // 이미지 추가
  const addFiles = (fileList) => {
    setFiles([...files, ...fileList]);
  };

  // 이미지 삭제
  const deleteFile = (targetFile) => {
    setFiles(files.filter((f) => f !== targetFile));
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

  // 리뷰 등록
  const registReview = () => {
    //지연 - 회원 상태 비정상/정지일 때 리뷰 등록 막음
    if (Number(memberStatus) === 1 || Number(memberStatus) === 3) {
      Swal.fire({
        title: '리뷰 작성 불가',
        text: '현재 회원 상태에서는 리뷰를 작성할 수 없습니다.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
      });
      return;
    }

    // 필수 항목 검증
    if (
      !review.restName.trim() ||
      !review.restAddr.trim() ||
      !review.reviewVisit.trim() ||
      !reviewContent.trim() ||
      !(menus.length > 0) ||
      rating === 0
    ) {
      Swal.fire({ title: '필수 항목을 입력해주세요', icon: 'warning' });
      return;
    }

    // 파일 포함 요청 → FormData 사용
    const form = new FormData();

    form.append('restNo', restNo);
    form.append('restName', review.restName);
    form.append('restAddr', review.restAddr);
    form.append('reviewVisit', review.reviewVisit);
    form.append('reviewContent', reviewContent);
    form.append('rating', rating);
    menus.forEach((menu) => form.append('reviewMenus', menu.name));
    tags.forEach((tag) => form.append('tags', tag));
    files.forEach((file) => form.append('files', file));

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/restaurants/review`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        console.log(res.data.success);
        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: '등록 완료',
            text: '리뷰 상세 페이지로 이동합니다.',
          }).then(() => {
            sessionStorage.removeItem('receiptData');
            navigate(`/rest/review/view/${res.data.reviewNo}`);
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: '등록 실패',
            text: '리뷰 등록에 실패하였습니다.',
          });
        }
      })
      .catch((err) => {
        console.log(res);
        console.log(res.data);
      });
  };

  const tagList = [
    { value: '야외석', label: '야외석' },
    { value: '국물', label: '국물' },
    { value: '분위기', label: '분위기' },
    { value: '혼밥', label: '혼밥' },
    { value: '데이트', label: '데이트' },
  ];

  return (
    <div className={styles.page_wrap}>
      {/* ── 페이지 제목 ── */}
      <h2 className={styles.page_title}>리뷰 작성</h2>

      <section className={styles.regist_main}>
        {/* ======= 왼쪽: 폼 필드 ======= */}
        <div className={styles.main_left}>
          {/* 상호명 */}
          <div className={styles.field_group}>
            <label className={styles.field_label}>상호명*</label>
            <input
              type="text"
              name="restName"
              id="restName"
              value={review.restName}
              disabled={true}
            />
          </div>

          {/* 주소 */}
          <div className={styles.field_group}>
            <label className={styles.field_label}>주소*</label>
            <input
              type="text"
              name="restAddr"
              id="restAddr"
              value={review.restAddr}
              disabled={true}
            />
          </div>

          {/* 방문 날짜 */}
          <div className={styles.field_group}>
            <label className={styles.field_label}>방문 날짜*</label>
            <input
              type="date"
              name="reviewVisit"
              id="reviewVisit"
              value={review.reviewVisit}
              disabled={true}
            />
          </div>

          {/* 메뉴 */}
          <div className={styles.field_group}>
            <label className={styles.field_label}>메뉴*</label>
            {menus && menus.length > 0 ? (
              <ul className={styles.menu_list}>
                {menus.map((item, idx) => (
                  <li key={idx} className={styles.menu_item}>
                    <span className={styles.menu_item_name}>{item.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.no_value}>인식된 메뉴가 없습니다</span>
            )}
          </div>

          {/* ── 별점 ── */}
          <div className={styles.star_rating}>
            <div className={styles.field_label}>별점*</div>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
              sx={{
                color: 'var(--primary)', // 선택된 별 — 노란색
                '& .MuiRating-iconEmpty': {
                  color: 'var(--gray5)', // 미선택 별 — 회색
                },
              }}
            />
          </div>

          {/* ── 태그 선택 ── */}
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

        {/* ======= 오른쪽: 사진 + 리뷰 내용 ======= */}
        <div className={styles.main_right}>
          {/* ── 사진 등록 ── */}
          <div className={styles.field_group}>
            <input
              type="file"
              id="files"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => addFiles(Array.from(e.target.files))}
            />

            {/* 기존 서버 파일 목록 (수정 모드에서 사용) */}
            {review.fileList &&
              review.fileList.map((file, index) => (
                <FileItem key={index} file={file} />
              ))}

            {/* 사진 없을 때: 클릭 영역 */}
            {files.length === 0 ? (
              <label htmlFor="files" className={styles.photo_placeholder}>
                사진 등록
              </label>
            ) : (
              /* 사진 있을 때: 미리보기 그리드 */
              <div className={styles.photo_preview}>
                {files.map((file, index) => (
                  <div key={index} className={styles.preview_item}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`미리보기 ${index + 1}`}
                    />
                    {/* 삭제 버튼 */}
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
            <label className={styles.field_label}>리뷰 내용*</label>
            <textarea
              className={styles.review_textarea}
              name="reviewContent"
              id="reviewContent"
              value={reviewContent}
              onChange={(e) => {
                setReviewContent(e.target.value);
              }}
              placeholder="리뷰 내용을 입력하세요"
            />
          </div>

          {/* ── 등록 버튼 ── */}
          <div className={styles.btn_zone}>
            <button
              type="button"
              className={styles.regist_btn}
              onClick={registReview}
            >
              리뷰 등록
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FileItem = ({ file, deleteFile }) => {
  return (
    <ul className={styles.file_item}>
      <li className={styles.file_name}>{file.name || file.reviewFileName}</li>
      {deleteFile && (
        <li>
          <ClearIcon
            className={styles.file_delete}
            onClick={() => deleteFile(file)}
          />
        </li>
      )}
    </ul>
  );
};

export default ReviewRegist;
