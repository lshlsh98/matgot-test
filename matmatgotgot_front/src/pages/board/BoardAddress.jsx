import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './BoardAddress.css';

const BoardAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const detailRef = useRef(null);

  // 입력값
  const [postcode, setPostcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  // 카카오 postcode script
  useEffect(() => {
    const script = document.createElement('script');

    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

    script.async = true;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 주소찾기
  const searchAddr = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setPostcode(data.zonecode);

        setAddress1(data.jibunAddress);

        setAddress2(data.roadAddress);

        detailRef.current?.focus();
      },
    }).open();
  };

  // 선택 완료
  const completeSelect = () => {
    if (!postcode || !detailAddress.trim()) {
      Swal.fire({
        icon: 'warning',
        text: '주소와 장소명을 입력해주세요.',
        confirmButtonColor: 'var(--primary)',
      });

      return;
    }

    Swal.fire({
      icon: 'question',
      iconColor: 'var(--primary)',
      text: `'${detailAddress}'을(를) 선택하시겠습니까?`,
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--gray5)',
      confirmButtonText: '선택',
      cancelButtonText: '취소',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/board/write', {
          state: {
            selectedPlace: detailAddress,

            placeInfo: {
              postcode,
              jibunAddress: address1,
              roadAddress: address2,
              placeName: detailAddress,
            },

            category: 2,
            prevBoard: location.state?.prevBoard,
          },
        });
      }
    });
  };

  return (
    <div className="board-address-container">
      <div className="address-form">
        {/* 우편번호 */}
        <div className="form-row">
          <label>우편번호</label>

          <div className="postcode-box">
            <input value={postcode} readOnly />

            <button className="search-btn" onClick={searchAddr}>
              주소찾기
            </button>
          </div>
        </div>

        {/* 지번주소 */}
        <div className="form-row">
          <label>지번주소</label>

          <input value={address1} readOnly />
        </div>

        {/* 도로명주소 */}
        <div className="form-row">
          <label>도로명주소</label>

          <input value={address2} readOnly />
        </div>

        {/* 장소명 */}
        <div className="form-row">
          <label>장소명</label>

          <input
            ref={detailRef}
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder="장소명을 입력하세요"
          />
        </div>

        {/* 버튼 */}
        <div className="address-bottom-buttons">
          <button className="cancel-btn" onClick={() => navigate(-1)}>
            취소
          </button>

          <button className="complete-btn" onClick={completeSelect}>
            선택완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardAddress;
