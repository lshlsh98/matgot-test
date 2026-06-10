import styles from "./BoardReports.module.css";
import {useNavigate} from "react-router-dom";
import comment from "../../assets/img/comment.svg";
import heart from "../../assets/img/heart.svg";
import view from "../../assets/img/view.svg";

const BoardReports = ({ myboard }) => {
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
            <div className={styles.reports} onClick={()=>navigate(`/board/view/${board.boardNo}`)}>
                <div className={styles.report}>
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
                    {board.reportStatus === 0 ? <div className={styles.report_send}>처리대기</div> : board.reportStatus === 1 ? <div className={styles.report_finished}>처리완료</div> : board.reportStatus === 2 && <div className={styles.report_err}>반려</div> }
                </div>
            </div>
        </>
    );
};

export default BoardReports;