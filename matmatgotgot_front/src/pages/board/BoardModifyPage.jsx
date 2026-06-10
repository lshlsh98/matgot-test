import { useEffect, useState } from 'react';
import styles from './Board.module.css';
import BoardFrm from '../../components/board/BoardFrm';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const BoardModifyPage = () => {
    const navigate = useNavigate();
    const { boardNo } = useParams();

    const [board, setBoard] = useState(null);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BACKSERVER}/boards/${boardNo}`)
            .then((res) => {
                setBoard(res.data);
            })
            .catch((err) => console.log(err));
    }, [boardNo]);

    const inputBoard = (e) => {
        const { name, value } = e.target;

        setBoard((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const inputBoardContent = (data) => {
        setBoard((prev) => ({
            ...prev,
            boardContent: data,
        }));
    };

    const modifyBoard = () => {
        if (board.boardTitle.trim() === '') {
            Swal.fire({
                title: '제목을 입력해주세요.',
                icon: 'warning',
                confirmButtonColor: 'var(--color1)',
            });
            return;
        }

        if (!board.boardContent || board.boardContent === '<p></p>') {
            Swal.fire({
                title: '내용을 입력해주세요.',
                icon: 'warning',
                confirmButtonColor: 'var(--color1)',
            });
            return;
        }

        axios
            .put(`${import.meta.env.VITE_BACKSERVER}/boards/${boardNo}`, {
                boardTitle: board.boardTitle,
                boardContent: board.boardContent,
                boardCategory: Number(board.boardCategory),
            })
            .then((res) => {
                if (res.data === 1) {
                    Swal.fire({
                        title: '게시글 수정 완료',
                        icon: 'success',
                        confirmButtonColor: 'var(--color1)',
                        timer: 1200,
                        showConfirmButton: false,
                    }).then(() => {
                        navigate(`/board/view/${boardNo}`);
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                Swal.fire({
                    title: '게시글 수정 실패',
                    icon: 'error',
                    confirmButtonColor: 'var(--color1)',
                });
            });
    };

    if (!board) {
        return null;
    }

    return (
        <section className={styles.board_wrap}>
            <h3 className={styles.page_title}></h3>

            <div className={styles.category_wrap}>
                <div className={styles.select_wrap}>
                    <select
                        className={styles.select}
                        name="boardCategory"
                        value={board.boardCategory}
                        onChange={inputBoard}
                    >
                        <option value={1}>여행후기</option>
                        <option value={2}>자유게시글</option>
                    </select>
                </div>
                {/* 장소 정보 - 수정 불가 */}
                {board.placeName && (
                    <div className={styles.readonly_place_box}>
                        <span className={`${styles.readonly_place_icon} material-icons`}>
                            location_on
                        </span>

                        <div className={styles.readonly_place_text}>
                            <span className={styles.readonly_place_name}>
                                {board.placeName}
                            </span>

                            {board.addressName && (
                                <span className={styles.readonly_place_address}>
                                    {board.addressName}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <BoardFrm
                board={board}
                inputBoard={inputBoard}
                inputBoardContent={inputBoardContent}
            />

            <div className={styles.btn_wrap}>
                <Button className="btn primary lg" onClick={modifyBoard}>
                    수정하기
                </Button>
            </div>
        </section>
    );
};

export default BoardModifyPage;