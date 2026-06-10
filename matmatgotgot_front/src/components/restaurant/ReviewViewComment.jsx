import { useState, useEffect } from 'react'; // useEffect 추가
import ReviewCommentItem from './ReviewCommentItem';
import styles from './ReviewViewComment.module.css';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore'; //지연
import Swal from 'sweetalert2';

const ReviewViewComment = ({ reviewNo }) => {
  // 로그인한 회원 번호 (본인 댓글 수정/삭제 여부 판단에 사용)
  const loginMemberId = useAuthStore((state) => state.memberId);
  // const loginMemberNo = authStore.memberId;

  const memberStatus = useAuthStore((state) => state.memberStatus); //지연

  // 서버에서 받은 전체 댓글 flat list
  const [commentList, setCommentList] = useState([]);

  // 새 댓글 입력값
  const [newCommentContent, setNewCommentContent] = useState('');

  // 댓글 목록 조회
  // reviewNo 가 바뀔 때마다 재조회
  useEffect(() => {
    fetchComments();
  }, [reviewNo]);

  const fetchComments = () => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review/${reviewNo}/comments`,
      )
      .then((res) => {
        setCommentList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 새 댓글 등록 (depth = 0)
  const registComment = () => {
    //지연 - 회원 상태 정지/비공개
    if (Number(memberStatus) === 1 || Number(memberStatus) === 3) {
      Swal.fire({
        title: '댓글 작성 불가',
        text: '현재 회원 상태에서는 댓글을 작성할 수 없습니다.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
      });
      return;
    }
    if (!newCommentContent.trim()) return; // 빈 내용 방지

    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review/${reviewNo}/comments`,
        {
          content: newCommentContent,
          depth: 0, // 일반 댓글
          parentComment: null, // 부모 없음
        },
      )
      .then((res) => {
        // 등록된 댓글을 목록 끝에 추가
        setCommentList([...commentList, res.data]);
        setNewCommentContent(''); // 입력창 초기화
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 댓글/대댓글 수정
  // commentNo : 수정할 댓글 번호
  // newContent: 수정된 내용
  const updateComment = (commentNo, newContent) => {
    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review/comment/${commentNo}`,
        {
          content: newContent,
        },
      )
      .then(() => {
        // 로컬 상태의 해당 댓글 내용만 업데이트
        setCommentList(
          commentList.map((c) =>
            c.commentNo === commentNo ? { ...c, content: newContent } : c,
          ),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 댓글/대댓글 삭제
  // DB에서 ON DELETE CASCADE 로 대댓글도 함께 삭제되므로
  // 프론트에서도 해당 댓글과 그 대댓글을 모두 목록에서 제거
  const deleteComment = (commentNo) => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review/comment/${commentNo}`,
      )
      .then(() => {
        setCommentList(
          commentList.filter(
            (c) =>
              c.commentNo !== commentNo && // 해당 댓글 제거
              c.parentComment !== commentNo, // 그 대댓글도 제거 (CASCADE 반영)
          ),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 대댓글 등록 (depth = 1)
  // parentCommentNo : 부모 댓글 번호 (parent_comment 컬럼)
  // replyContent    : 대댓글 내용
  const registReply = (parentCommentNo, replyContent) => {
    if (!replyContent.trim()) return; // 빈 내용 방지

    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/restaurants/review/${reviewNo}/comments`,
        {
          content: replyContent,
          depth: 1, // 대댓글
          parentComment: parentCommentNo, // 부모 댓글 번호
        },
      )
      .then((res) => {
        // 등록된 대댓글을 목록에 추가 (렌더링 시 부모 아래에 그룹화됨)
        setCommentList([...commentList, res.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 렌더링용 그룹화 헬퍼
  // depth=0 인 루트 댓글만 필터링
  const rootComments = commentList.filter((c) => c.depth === 0);

  // 특정 댓글 번호의 대댓글(depth=1) 목록 반환
  const getReplies = (commentNo) =>
    commentList.filter((c) => c.parentComment === commentNo);

  return (
    <div className={styles.comment_section}>
      {/* ── 댓글 수 표시 ── */}
      <div className={styles.comment_count}>댓글 {rootComments.length}개</div>

      {/* ── 댓글 목록 ── */}
      {rootComments.map((comment) => (
        <ReviewCommentItem
          key={comment.commentNo}
          comment={comment}
          replies={getReplies(comment.commentNo)} // 해당 댓글의 대댓글 전달
          loginMemberId={loginMemberId}
          onUpdate={updateComment} // 수정 콜백
          onDelete={deleteComment} // 삭제 콜백
          onReplyAdd={registReply} // 대댓글 등록 콜백
        />
      ))}

      {/* ── 새 댓글 입력 ── */}
      <div className={styles.input_item}>
        <textarea
          className={styles.comment_textarea}
          value={newCommentContent}
          placeholder="댓글을 입력하세요"
          onChange={(e) => setNewCommentContent(e.target.value)}
          // Enter(Shift 없이) 입력 시 등록
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              registComment();
            }
          }}
        />
        <button className={styles.regist_btn} onClick={registComment}>
          댓글 등록
        </button>
      </div>
    </div>
  );
};

export default ReviewViewComment;
