import { useEffect, useState } from 'react';
import styles from './Board.module.css';
import axios from 'axios';
import BoardList from '../../components/board/BoardList';
import Pagination from '../../components/ui/Pagination';
import { Input } from '../../components/ui/Form.jsx';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';

// 게시글 목록 페이지
const BoardListPage = () => {
  const navigate = useNavigate();

  const { memberStatus, memberNo } = useAuthStore();

  const isBlocked = Number(memberStatus) === 1 || Number(memberStatus) === 3;
  const isLogin = memberNo != null;

  const [boardList, setBoardList] = useState([]);
  const [page, setPage] = useState(0);

  const size = 8;

  const [totalPage, setTotalPage] = useState(5);
  const [order, setOrder] = useState(1);
  const [category, setCategory] = useState(0);

  const [type, setType] = useState(1);
  const [keyword, setKeyword] = useState('');

  const [searchType, setSearchType] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleWriteClick = () => {
    if (isBlocked) {
      Swal.fire({
        title: '게시글 작성 불가',
        text: '현재 회원 상태에서는 게시글을 작성할 수 없습니다.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
        width: '600px',
      });

      return;
    }

    navigate('/board/write');
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/boards`, {
        params: {
          page,
          size,
          status: 1,
          order,
          searchType,
          searchKeyword,
          category,
        },
      })
      .then((res) => {
        setBoardList(res.data.items);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [page, order, searchType, searchKeyword, category]);

  return (
    <section className={styles.board_wrap}>
      <h3 className={styles.page_title}></h3>

      <div className={styles.list_option_wrap}>
        <div className={styles.left_option}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => {
              setCategory(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value={0}>전체 카테고리</option>
            <option value={1}>여행후기</option>
            <option value={2}>자유게시글</option>
          </select>

          <form
            className={styles.search_wrap}
            onSubmit={(e) => {
              e.preventDefault();
              setSearchType(type);
              setSearchKeyword(keyword);
              setPage(0);
            }}
          >
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(Number(e.target.value))}
            >
              <option value={1}>제목</option>
              <option value={2}>작성자</option>
            </select>

            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <Button
              type="submit"
              className="btn primary"
              style={{
                width: '60px',
                height: '36px',
                fontSize: '14px',
                lineHeight: '1',
              }}
            >
              검색
            </Button>
          </form>
        </div>

        <div className={styles.right_option}>
          <select
            className={styles.select}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          >
            <option value={1}>최신순</option>
            <option value={2}>작성순</option>
          </select>
        </div>
      </div>

      <BoardList boardList={boardList} />

      {isLogin && (
        <div className={styles.write_btn_zone}>
          <Button
            className="btn primary"
            onClick={handleWriteClick}
            style={{
              width: '80px',
              fontSize: '14px',
            }}
          >
            글쓰기
          </Button>
        </div>
      )}

      <div className={styles.board_list_pagination}>
        <Pagination
          page={page}
          setPage={setPage}
          totalPage={totalPage}
          naviSize={5}
        />
      </div>
    </section>
  );
};

export default BoardListPage;
