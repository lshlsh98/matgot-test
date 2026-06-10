import { useState, useEffect } from 'react';
import styles from './Board.module.css';
import { useAuthStore } from '../../store/useAuthStore'; //////////////////////////로그인 기능 구현 후 주석 지울 예정
import BoardFrm from '../../components/board/BoardFrm';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const BoardWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  ////////////////////////////////////////////////////////////////////로그인 기능 구현 후 주석 지울 예정
  // zustand 로그인 정보
  const { memberNo, memberStatus, isReady } = useAuthStore();

  // 비정상/정지 회원 상태 접근 제한
  useEffect(() => {
    if (!isReady) return;

    if (Number(memberStatus) === 1 || Number(memberStatus) === 3) {
      Swal.fire({
        title: '접근 제한',
        text: '해당 회원은 게시글 작성 페이지에 접근할 수 없습니다.',
        icon: 'error',
        confirmButtonColor: 'var(--color1)',
      }).then(() => {
        navigate('/board/list');
      });
    }
  }, [isReady, memberStatus, navigate]);

  // 장소 선택 후 돌아왔을 때 //게시글 상태
  const [board, setBoard] = useState(() => {
    const prevBoard = location.state?.prevBoard;

    return {
      boardTitle: prevBoard?.boardTitle || '',
      boardContent: prevBoard?.boardContent || '',
      boardCategory: prevBoard?.boardCategory || 1,
      placeNo: location.state?.placeNo || null,
      locationName:
        location.state?.placeInfo?.placeName ||
        location.state?.selectedPlace ||
        prevBoard?.locationName ||
        '',
    };
  });

  // input 변경
  const inputBoard = (e) => {
    const { name, value } = e.target;

    setBoard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 에디터 내용 변경
  const inputBoardContent = (data) => {
    setBoard((prev) => ({
      ...prev,
      boardContent: data,
    }));
  };

  // 지도 이동
  const handleMapClick = () => {
    navigate('/boardNavermap', {
      state: {
        fromWrite: true,
        prevBoard: board,
      },
    });
  };

  // 게시글 등록
  const registBoard = () => {
    /////////////////////////////////////////////////////////////////////로그인 기능 구현 후 주석 지울 예정
    // 로그인 체크
    if (!memberNo) {
      Swal.fire({
        title: '로그인이 필요합니다.',
        icon: 'warning',
        confirmButtonColor: 'var(--color1)',
      });

      navigate('/login');
      return;
    }
    //

    // 제목 + 내용 둘 다 비었을 때
    if (
      board.boardTitle.trim() === '' &&
      (!board.boardContent || board.boardContent === '<p></p>')
    ) {
      Swal.fire({
        title: '제목과 내용을 입력해주세요.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
      });
      return;
    }

    // 제목 검사
    if (board.boardTitle.trim() === '') {
      Swal.fire({
        title: '제목을 입력해주세요.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
      });
      return;
    }

    // 내용 검사
    if (!board.boardContent || board.boardContent === '<p></p>') {
      Swal.fire({
        title: '내용을 입력해주세요.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
      });
      return;
    }

    // 장소 선택 검사 (placeNo가 없어도 locationName이 있으면 직접 입력으로 간주하여 통과)
    if (!board.placeNo && !board.locationName) {
      Swal.fire({
        title: '장소를 선택해주세요.',
        text: '마커 아이콘을 클릭하여 장소를 지정해야 합니다.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)',
        width: '600px',
      });

      return;
    }

    // 네이버 맵 페이지에서 넘어온 주소 정보 객체 추출
    const placeInfo = location.state?.placeInfo;

    console.log('등록 요청 데이터:', {
      //memberNo: 1, //로그인 구현 전 테스트 코드
      memberNo: memberNo,
      boardTitle: board.boardTitle,
      boardContent: board.boardContent,
      boardCategory: Number(board.boardCategory),
      placeNo: board.placeNo,
      // 로그 확인용 추가
      placeName: board.locationName,
      addressName: placeInfo?.roadAddress || placeInfo?.jibunAddress || '',
    });

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/boards`, {
        memberNo, // 로그인시 주석 풀거임
        //memberNo: 1, // 테스트용 (로그인 구현되면 지울거임)
        boardTitle: board.boardTitle,
        boardContent: board.boardContent,
        boardCategory: Number(board.boardCategory),
        placeNo: board.placeNo, // 기존 장소 선택 시 ID값(Integer), 직접 입력 시 null

        //백엔드의 Board 엔티티 멤버 변수와 일치시켜 데이터 전송
        placeName: board.locationName, // 화면에 표시된 장소명
        addressName:
          placeInfo?.roadAddress ||
          placeInfo?.jibunAddress ||
          board.locationName, // 도로명/지번 주소 (없으면 장소명 대체)
        placeLat: placeInfo?.latitude ?? null,
        placeLng: placeInfo?.longitude ?? null,
      })
      .then((res) => {
        if (res.data > 0) {
          Swal.fire({
            title: '게시글 작성 완료',
            icon: 'success',
            confirmButtonColor: 'var(--color1)',
            timer: 1200,
            showConfirmButton: false,
          }).then(() => {
            navigate('/board/list');
          });
        }
      })
      .catch((err) => {
        console.error('게시글 등록 실패:', err);
        Swal.fire({
          title: '게시글 등록 실패',
          text: '잠시 후 다시 시도해주세요.',
          icon: 'error',
          confirmButtonColor: 'var(--color1)',
        });
      });
  };

  return (
    <section className={styles.board_wrap}>
      <h3 className={styles.page_title}></h3>

      <div className={styles.category_wrap}>
        <div className={styles.select_wrap}>
          {/* 카테고리 */}
          <select
            className={styles.select}
            name="boardCategory"
            value={board.boardCategory}
            onChange={(e) => {
              const newCategory = Number(e.target.value);

              // 카테고리 바꾸면 장소 초기화
              setBoard((prev) => ({
                ...prev,
                boardCategory: newCategory,
                placeNo: null,
                locationName: '',
              }));
            }}
          >
            <option value={1}>여행후기</option>
            <option value={2}>자유게시글</option>
          </select>

          {/* 지도 버튼 */}
          <span
            className={`${styles.location_icon} material-icons`}
            onClick={handleMapClick}
            style={{
              cursor: 'pointer',
              color: 'var(--color1)',
              fontSize: '30px',
            }}
          >
            location_on
          </span>

          {/* 선택 장소명 */}
          <span className={styles.selected_place_name}>
            {board.locationName || '장소 선택'}
          </span>
        </div>
      </div>

      <BoardFrm
        board={board}
        inputBoard={inputBoard}
        inputBoardContent={inputBoardContent}
      />

      <div className={styles.btn_wrap}>
        <Button className="btn primary lg" onClick={registBoard}>
          작성하기
        </Button>
      </div>
    </section>
  );
};

export default BoardWritePage;
