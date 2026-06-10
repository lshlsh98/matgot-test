import { useEffect, useRef, useState } from "react";
import styles from "./ReviewCommentItem.module.css";
import Swal from "sweetalert2";
import ReportModal from "../ui/ReportModal";

const ReviewCommentItem = ({
  comment,
  replies = [],
  loginMemberId,
  onUpdate,
  onDelete,
  onReplyAdd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // 신고 모달 표시 여부 (이 댓글 전용)
  const [reportModal, setReportModal] = useState(false);

  const editTextareaRef = useRef(null);
  const replyTextareaRef = useRef(null);

  // 수정 textarea 자동 높이 조정
  useEffect(() => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = "auto";
      editTextareaRef.current.style.height =
        editTextareaRef.current.scrollHeight + "px";
    }
  }, [editContent, isEditing]);

  // 대댓글 textarea 자동 높이 조정
  useEffect(() => {
    if (replyTextareaRef.current) {
      replyTextareaRef.current.style.height = "auto";
      replyTextareaRef.current.style.height =
        replyTextareaRef.current.scrollHeight + "px";
    }
  }, [replyContent]);

  // 댓글 수정: "수정" 클릭 → 편집 모드 / "완료" 클릭 → onUpdate 호출
  const handleUpdate = () => {
    if (isEditing) {
      if (editContent.trim() && editContent !== comment.content) {
        onUpdate(comment.commentNo, editContent);
      }
    }
    setIsEditing(!isEditing);
  };

  // 댓글 삭제: Swal 확인 후 onDelete 호출
  // DB ON DELETE CASCADE 로 대댓글도 함께 삭제됨
  const handleDelete = () => {
    Swal.fire({
      title: "삭제하시겠습니까?",
      text: "삭제 시 댓글과 답글이 모두 삭제됩니다",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(comment.commentNo);
      }
    });
  };

  // 대댓글 등록
  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReplyAdd(comment.commentNo, replyContent);
    setReplyContent("");
    setShowReplyInput(false);
  };

  // ── 신고 버튼 클릭 처리 ──────────────────────────────────
  // 1) 비로그인 상태 → 로그인 필요 안내
  // 2) 자기 자신의 댓글 → 자기 신고 불가 안내
  // 3) 정상 → 신고 모달 오픈
  const handleReport = () => {
    // 비로그인 체크: loginMemberId 가 null 이면 로그인 안 된 상태
    if (!loginMemberId) {
      Swal.fire({
        title: "로그인이 필요합니다",
        text: "신고하려면 먼저 로그인해 주세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    // 자기 자신 신고 체크: 댓글 작성자와 로그인 회원이 동일한 경우
    if (loginMemberId === comment.memberId) {
      Swal.fire({
        title: "신고할 수 없습니다",
        text: "자기 자신의 댓글은 신고할 수 없습니다.",
        icon: "info",
        confirmButtonText: "확인",
      });
      return;
    }

    // 모든 검사 통과 → 신고 모달 오픈
    setReportModal(true);
  };

  // 로그인 회원이 이 댓글의 작성자인지 확인
  const isOwner = loginMemberId === comment.memberId;

  return (
    <div className={styles.comment_wrap}>
      {/* ── 작성자 정보 + 수정/삭제 버튼 ── */}
      <div className={styles.comment_header}>
        <div className={styles.writer}>
          <div
            className={
              comment.memberThumb
                ? styles.member_thumb_exists
                : styles.member_thumb
            }
          >
            {comment.memberThumb ? (
              <img
                src={`${import.meta.env.VITE_BACKSERVER}/matgot/member/${comment.memberThumb}`}
                alt="프로필"
              />
            ) : (
              ""
            )}
          </div>
          <span className={styles.comment_name}>{comment.writerName}</span>
          <span className={styles.comment_date}>{comment.createdAt}</span>
        </div>

        {/* 본인 댓글만 수정/삭제 버튼 표시 */}
        {isOwner && (
          <div
            className={styles.comment_btn_section}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.comment_btn} onClick={handleUpdate}>
              {isEditing ? "완료" : "수정"}
            </button>
            {!isEditing && (
              <button className={styles.comment_btn} onClick={handleDelete}>
                삭제
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 댓글 내용 ── */}
      <div className={styles.comment_content}>
        <textarea
          ref={editTextareaRef}
          className={styles.textarea}
          value={isEditing ? editContent : comment.content}
          onChange={(e) => setEditContent(e.target.value)}
          disabled={!isEditing}
        />
      </div>

      {/* ── 답글 / 신고 버튼 ── */}
      <div className={styles.comment_actions}>
        <button
          type="button"
          className={styles.action_btn}
          onClick={() => setShowReplyInput(true)}
        >
          답글
        </button>

        {/* 신고 버튼: handleReport 에서 로그인·자기신고 검사 후 모달 오픈 */}
        <button
          type="button"
          className={`${styles.action_btn} ${styles.report_btn}`}
          onClick={handleReport}
        >
          신고
        </button>
      </div>

      {/* ── 대댓글 입력창 (답글 버튼 클릭 시 표시) ── */}
      {showReplyInput && (
        <div className={styles.reply_input_wrap}>
          <div className={styles.indent_line} />
          <div className={styles.reply_input}>
            <textarea
              ref={replyTextareaRef}
              className={styles.textarea}
              value={replyContent}
              placeholder="대댓글을 입력하세요"
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReplySubmit();
                }
              }}
            />
            <div className={styles.reply_input_btns}>
              <button
                type="button"
                className={styles.cancel_btn}
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent("");
                }}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.submit_btn}
                onClick={handleReplySubmit}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 대댓글 목록 ── */}
      {replies.length > 0 && (
        <div className={styles.replies_wrap}>
          {replies.map((reply) => (
            <ReplyItem
              key={reply.commentNo}
              reply={reply}
              loginMemberId={loginMemberId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              // ⚠ reportModal/setReportModal 을 내려주지 않음
              //   ReplyItem 은 자체 state 로 모달을 관리함
              //   (댓글마다 독립된 모달이 필요하기 때문)
            />
          ))}
        </div>
      )}

      {/* ── 신고 모달 오버레이 ──────────────────────────────
       * reportModal 이 true 일 때만 렌더링
       * 오버레이 클릭 → 모달 닫기 (e.stopPropagation 으로 모달 내부 클릭은 무시)
       */}
      {reportModal && (
        <div
          className={styles.modal_overlay}
          onClick={(e) => {
            e.stopPropagation();
            setReportModal(false);
          }}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 오버레이 닫힘 방지
          >
            <ReportModal
              type={"comment"} // 댓글 신고 타입
              no={comment.commentNo} // 신고 대상 댓글 번호
              setReportModal={setReportModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ReplyItem = ({ reply, loginMemberId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);

  // 신고 모달 표시 여부 (이 대댓글 전용 — 부모와 독립)
  const [reportModal, setReportModal] = useState(false);

  const textareaRef = useRef(null);

  // textarea 자동 높이 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editContent, isEditing]);

  // 대댓글 수정
  const handleUpdate = () => {
    if (isEditing) {
      if (editContent.trim() && editContent !== reply.content) {
        onUpdate(reply.commentNo, editContent);
      }
    }
    setIsEditing(!isEditing);
  };

  // 대댓글 삭제
  const handleDelete = () => {
    Swal.fire({
      title: "삭제하시겠습니까?",
      text: "삭제 시 정보를 복구할 수 없습니다",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(reply.commentNo);
      }
    });
  };

  // ── 신고 버튼 클릭 처리 ──────────────────────────────────
  // 1) 비로그인 상태 → 로그인 필요 안내
  // 2) 자기 자신의 대댓글 → 자기 신고 불가 안내
  // 3) 정상 → 신고 모달 오픈
  const handleReport = () => {
    if (!loginMemberId) {
      Swal.fire({
        title: "로그인이 필요합니다",
        text: "신고하려면 먼저 로그인해 주세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (loginMemberId === reply.memberId) {
      Swal.fire({
        title: "신고할 수 없습니다",
        text: "자기 자신의 댓글은 신고할 수 없습니다.",
        icon: "info",
        confirmButtonText: "확인",
      });
      return;
    }

    setReportModal(true);
  };

  const isOwner = loginMemberId === reply.memberId;

  return (
    <div className={styles.reply_wrap}>
      {/* 들여쓰기 구분선 — 대댓글임을 시각적으로 표시 */}
      <div className={styles.indent_line} />

      <div className={styles.reply_content_wrap}>
        {/* ── 작성자 정보 + 수정/삭제 ── */}
        <div className={styles.comment_header}>
          <div className={styles.writer}>
            <div
              className={
                reply.memberThumb
                  ? styles.member_thumb_exists
                  : styles.member_thumb
              }
            >
              {reply.memberThumb ? (
                <img
                  src={`${import.meta.env.VITE_BACKSERVER}/matgot/member/${reply.memberThumb}`}
                  alt="프로필"
                />
              ) : (
                ""
              )}
            </div>
            <span className={styles.comment_name}>{reply.writerName}</span>
            <span className={styles.comment_date}>{reply.createdAt}</span>
          </div>

          {isOwner && (
            <div
              className={styles.comment_btn_section}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.comment_btn} onClick={handleUpdate}>
                {isEditing ? "완료" : "수정"}
              </button>
              {!isEditing && (
                <button className={styles.comment_btn} onClick={handleDelete}>
                  삭제
                </button>
              )}
            </div>
          )}
        </div>

        {/* 대댓글 내용 */}
        <div className={styles.comment_content}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={isEditing ? editContent : reply.content}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {/* 답글 버튼 없음 — depth=1 은 대댓글을 달 수 없음 (DB CHECK 제약) */}
        <div className={styles.comment_actions}>
          {/* 신고 버튼: handleReport 에서 로그인·자기신고 검사 후 모달 오픈 */}
          <button
            type="button"
            className={`${styles.action_btn} ${styles.report_btn}`}
            onClick={handleReport}
          >
            신고
          </button>
        </div>
      </div>

      {/* ── 신고 모달 오버레이 ──────────────────────────────
       * 오버레이 클릭 → 모달 닫기
       * 모달 내부 클릭 → 이벤트 버블링 차단 (모달 닫힘 방지)
       */}
      {reportModal && (
        <div
          className={styles.modal_overlay}
          onClick={(e) => {
            e.stopPropagation();
            setReportModal(false);
          }}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <ReportModal
              type={"review_comment"} // 댓글 신고 타입
              no={reply.commentNo} // 신고 대상 대댓글 번호
              setReportModal={setReportModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCommentItem;
