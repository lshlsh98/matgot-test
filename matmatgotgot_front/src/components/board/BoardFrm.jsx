import { Input } from '../ui/Form.jsx';
import styles from './BoardFrm.module.css';
import BoardTextEditor from '../ui/BoardTextEditor';

const BoardFrm = ({ board, inputBoard, inputBoardContent }) => {
  return (
    <div className={styles.board_frm_wrap}>
      <div className={styles.input_wrap}>
        <Input
          type="text"
          name="boardTitle"
          id="boardTitle"
          value={board.boardTitle}
          onChange={inputBoard}
          placeholder="제목을 입력하세요."
        />
      </div>

      <div className={styles.input_wrap}>
        <BoardTextEditor
          data={board.boardContent}
          setData={inputBoardContent}
        />
      </div>
    </div>
  );
};

export default BoardFrm;
