import { useState } from "react";
import styles from "./ReportModal.module.css";
import axios from "axios";
import Swal from "sweetalert2";

const ReportModal = ({ type, no, setReportModal }) => {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  const doReport = () => {
    const data = {
      type: type,
      no: no,
      reason: reason,
      detail: detail,
    };

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/restaurants/report`, data)
      .then((res) => {
        if (res.data === 1) {
          Swal.fire({
            title: "신고 완료",
            icon: "success",
            confirmButtonText: "확인",
          }).then(() => {
            setReportModal(false);
          });
        }
      })
      .catch((err) => {
        if (err.response?.data === "이미 신고한 맛집입니다.") {
          Swal.fire({
            title: "이미 신고하였습니다.",
            icon: "info",
            confirmButtonText: "확인",
          });
        } else {
          Swal.fire({
            title: "오류",
            text: "신고 처리 중 문제가 발생했습니다.",
            icon: "error",
          });
        }
      });
  };

  return (
    <section className={styles.report}>
      <div className={styles.title}>신고</div>

      <div className={styles.reason_zone}>
        <div className={styles.reason_line}>
          <label>
            <input
              type="radio"
              name="reason"
              value="허위정보"
              checked={reason === "허위정보"}
              onChange={(e) => setReason(e.target.value)}
            />
            허위 정보
          </label>
          <label>
            <input
              type="radio"
              name="reason"
              value="광고스팸"
              checked={reason === "광고스팸"}
              onChange={(e) => setReason(e.target.value)}
            />
            광고 스팸
          </label>
        </div>
        <div className={styles.reason_line}>
          <label>
            <input
              type="radio"
              name="reason"
              value="욕설비방"
              checked={reason === "욕설비방"}
              onChange={(e) => setReason(e.target.value)}
            />
            욕설 비방
          </label>
          {/* 기타: 선택 시 빨간색으로 강조 — etc_label 클래스 별도 지정 */}
          <label>
            <input
              type="radio"
              name="reason"
              value="기타"
              checked={reason === "기타"}
              onChange={(e) => setReason(e.target.value)}
            />
            기타
          </label>
        </div>
      </div>

      {reason === "기타" && (
        <div className={styles.detail_zone}>
          <textarea
            className={styles.textarea}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="신고 내용을 입력해주세요."
          />
        </div>
      )}

      <div className={styles.btn_zone}>
        <button
          className={styles.btn_cancel}
          onClick={() => setReportModal(false)}
        >
          취소
        </button>
        <button className={styles.btn_submit} onClick={doReport}>
          신고
        </button>
      </div>
    </section>
  );
};

export default ReportModal;
