import styles from "./BoardLikeList.module.css";
import {useNavigate} from "react-router-dom";
import comment from "../../assets/img/comment.svg";
import heart from "../../assets/img/heart.svg";
import view from "../../assets/img/view.svg";

const BoardLikeList = ({ myboard }) => {
    return (
        <ul className={styles.board_list_wrap}>
            {myboard.map((board, i) => (
                <BoardItem key={`board-${board.boardNo}`} board={board} no={i+1} />
            ))}
        </ul>
    );
};

const BoardItem = ({ board, no }) => {
    const navigate = useNavigate();
    return (
        <>
            <div className={styles.likeposts} onClick={()=>navigate(`/board/view/${board.boardNo}`)}>
                <div className={styles.likepost}>
                    <div>{no}</div>
                    <div>{board.boardTitle}</div>
                    <div>
                        <ul>
                            <li><img src={comment} alt=""/>{board.boardComment}</li>
                            <li><img src={heart} alt=""/>{board.boardLike}</li>
                            <li><img src={view} alt=""/>{board.boardView}</li>
                        </ul>
                    </div>
                    <div>{board.boardDate}</div>
                </div>
            </div>
        </>
    );
};

export default BoardLikeList;