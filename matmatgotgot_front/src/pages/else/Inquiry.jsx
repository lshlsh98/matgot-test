import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Inquiry.module.css";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore.js";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

const Inquiry = () => {
  const navigate = useNavigate();
  const { memberNo: loginMemberNo, isReady } = useAuthStore();

  const [inquiryType, setInquiryType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isReady && !loginMemberNo) {
      alert(
        "1:1 문의는 로그인이 필요한 서비스입니다. 메인 페이지로 이동합니다.",
      );
      navigate("/");
    }
  }, [isReady, loginMemberNo, navigate]);

  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setContent(value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 용량은 최대 5MB까지만 첨부 가능합니다.");
        return;
      }
      setAttachedFile(file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview("");
      }
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setAttachedFile(null);
    setFilePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 용량은 최대 5MB까지만 첨부 가능합니다.");
        return;
      }
      setAttachedFile(file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inquiryType) {
      alert("문의 유형을 선택해 주세요.");
      return;
    }
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("memberNo", loginMemberNo);
      formData.append("inquiryType", inquiryType);
      formData.append("title", title);
      formData.append("content", content);
      if (attachedFile) {
        formData.append("file", attachedFile);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/qna/create`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.status === 200 || response.status === 201) {
        alert(
          "1:1 문의가 성공적으로 접수되었습니다. ✨\n답변은 마이페이지에서 확인하실 수 있습니다.",
        );
        navigate("/faq");
      }
    } catch (error) {
      console.error("Q&A 접수 실패:", error);
      alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (!isReady || !loginMemberNo) {
    return (
      <div className={styles.loading}>페이지 접근 권한을 확인 중입니다...</div>
    );
  }

  return (
    <div className={styles.inquiryWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>1:1 문의하기</h2>
          <p>
            서비스 이용 중 불편한 점이나 제안사항을 남겨주시면 정성껏 답변해
            드리겠습니다.
          </p>
        </div>

        <div className={styles.infoBox}>
          <HelpOutlineIcon className={styles.infoIcon} />
          <div className={styles.infoText}>
            <h4>문의 전 확인해 주세요!</h4>
            <p>
              고객센터 운영시간은 <strong>평일 10:00 ~ 18:00</strong> 입니다.
            </p>
            <p>
              접수된 문의는 순차적으로 답변되며, 평균 24시간 이내에 처리
              완료됩니다.
            </p>
          </div>
        </div>

        <form className={styles.inquiryForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>
              문의 유형 <span className={styles.required}>*</span>
            </label>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">-- 유형을 선택해 주세요 --</option>
              <option value="COURSES">코스 이용 및 오류</option>
              <option value="RESTAURANTS">맛집 정보 오류/추가 요청</option>
              <option value="MEMBERS">계정 및 로그인/탈퇴</option>
              <option value="SUGGESTIONS">건의사항 및 기타 제안</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="제목을 입력해 주세요 (최대 50자)"
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.textInput}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label>
                문의 내용 <span className={styles.required}>*</span>
              </label>
              <span className={styles.charCounter}>
                {content.length} / 1000자
              </span>
            </div>
            <textarea
              placeholder="문의하실 내용을 상세히 적어주세요. 장소명이나 오류 현상을 구체적으로 적어주시면 더 신속한 답변이 가능합니다."
              value={content}
              onChange={handleContentChange}
              className={styles.textareaInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>파일 첨부 (선택)</label>
            <div
              className={styles.uploadZone}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className={styles.hiddenFileInput}
              />

              {!attachedFile ? (
                <div className={styles.uploadPrompt}>
                  <CloudUploadIcon className={styles.uploadIcon} />
                  <p>클릭하거나 파일을 이곳에 드래그하여 첨부하세요.</p>
                  <span>5MB 이하의 파일만 업로드 가능합니다.</span>
                </div>
              ) : (
                <div className={styles.fileCard}>
                  {filePreview && (
                    <div className={styles.previewContainer}>
                      <img
                        src={filePreview}
                        alt="미리보기"
                        className={styles.imagePreview}
                      />
                    </div>
                  )}
                  <div className={styles.fileDetails}>
                    <p className={styles.fileName}>{attachedFile.name}</p>
                    <span className={styles.fileSize}>
                      {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeFileBtn}
                    onClick={handleRemoveFile}
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className={styles.btnGroup}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button type="submit" className={styles.submitBtn}>
              문의 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inquiry;
