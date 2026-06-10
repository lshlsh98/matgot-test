import styles from './BoardList.module.css';
import defaultImage from '../../assets/board/image.png';
import userImage from '../../assets/board/user.png';
import { useNavigate } from 'react-router-dom';

const BoardList = ({ boardList }) => {
  return (
    <ul className={styles.board_list_wrap}>
      {boardList.map((board) => (
        <BoardItem key={`board-${board.boardNo}`} board={board} />
      ))}
    </ul>
  );
};

const BoardItem = ({ board }) => {
  const navigate = useNavigate();

  const getCategoryName = (category) => {
    if (category === 1) return '여행후기';
    if (category === 2) return '자유게시글';
    return '';
  };

  return (
    <li
      className={styles.board_item}
      onClick={() => navigate(`/board/view/${board.boardNo}`)}
    >
      <div className={styles.board_img_wrap}>
        <img
          src={
            board.boardThumb
              ? `${import.meta.env.VITE_BACKSERVER}/editor/${board.boardThumb}`
              : defaultImage
          }
          alt="썸네일"
        />
      </div>

      <div className={styles.board_info}>
        <p className={styles.board_title}>
          [{getCategoryName(board.boardCategory)}] {board.boardTitle}
        </p>

        <div className={styles.board_sub_info}>
          <div className={styles.board_writer}>
            <div
              className={board.memberThumb ? styles.member_thumb_exists : ''}
            >
              <img
                src={
                  board.memberThumb
                    ? `${import.meta.env.VITE_BACKSERVER}/upload/${board.memberThumb}`
                    : userImage
                }
                alt="프로필"
              />
            </div>

            <p>{board.boardWriter}</p>
          </div>

          <p>{board.boardDate}</p>
        </div>
      </div>
    </li>
  );
};

export default BoardList;
