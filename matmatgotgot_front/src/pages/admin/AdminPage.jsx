import { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { Input } from '../../components/ui/Form';
import Swal from 'sweetalert2';
import ReportIcon from '@mui/icons-material/Report';
import { useAuthStore } from '../../store/useAuthStore';
import userImage from '../../assets/board/user.png';

const AdminPage = () => {
  const navigate = useNavigate();

  const { admin, isReady } = useAuthStore();

  const [menu, setMenu] = useState(
    sessionStorage.getItem('adminMenu') || 'member',
  );

  useEffect(() => {
    if (!isReady) return;

    if (Number(admin) !== 1) {
      Swal.fire({
        title: '접근 제한',
        text: '관리자만 접근 가능한 페이지입니다.',
        icon: 'error',
        confirmButtonColor: 'var(--primary)',
      }).then(() => {
        navigate('/');
      });
    }
  }, [admin, isReady, navigate]);

  const changeMenu = (newMenu) => {
    setMenu(newMenu);
    sessionStorage.setItem('adminMenu', newMenu);
  };

  if (!isReady) return null;

  return (
    <section className={styles.admin_wrap}>
      <aside className={styles.admin_side}>
        <h2>관리자</h2>

        <button
          className={
            menu === 'member' ? styles.active_side_btn : styles.side_btn
          }
          onClick={() => changeMenu('member')}
        >
          회원 관리
        </button>

        <button
          className={
            menu === 'report' ? styles.active_side_btn : styles.side_btn
          }
          onClick={() => changeMenu('report')}
        >
          신고 관리
        </button>
      </aside>

      <div className={styles.admin_content}>
        {menu === 'member' ? (
          <MemberManage />
        ) : (
          <ReportManage navigate={navigate} />
        )}
      </div>
    </section>
  );
};

const MemberManage = () => {
  const [memberList, setMemberList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [memberStatus, setMemberStatus] = useState('');
  const [nameOrder, setNameOrder] = useState('asc');

  const getMemberList = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/members`, {
        params: {
          page,
          size: 4,
          keyword: searchKeyword,
          memberStatus,
          nameOrder,
        },
      })
      .then((res) => {
        setMemberList(res.data.items);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getMemberList();
  }, [page, searchKeyword, memberStatus, nameOrder]);

  const changeMemberStatus = (member, newStatus) => {
    Swal.fire({
      title: '회원 상태를 변경하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '변경',
      cancelButtonText: '취소',
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--gray4)',
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/members/${member.memberNo}/status`,
          {
            memberStatus: Number(newStatus),
          },
        )
        .then((res) => {
          if (res.data === 1) {
            getMemberList();
          }
        })
        .catch((err) => console.log(err));
    });
  };

  const changeMemberAdmin = (member, newAdmin) => {
    Swal.fire({
      title: '회원 권한을 변경하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '변경',
      cancelButtonText: '취소',
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--gray4)',
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/members/${member.memberNo}/admin`,
          {
            admin: Number(newAdmin),
          },
        )
        .then((res) => {
          if (res.data === 1) {
            getMemberList();
          }
        })
        .catch((err) => console.log(err));
    });
  };

  return (
    <>
      <div className={styles.top_option_wrap}>
        <form
          className={styles.search_wrap}
          onSubmit={(e) => {
            e.preventDefault();
            setSearchKeyword(keyword);
            setPage(0);
          }}
        >
          <Input
            className={styles.admin_search_input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="아이디를 입력하세요."
          />

          <Button
            type="submit"
            className="btn primary"
            style={{
              width: '60px',
              height: '30px',
              fontSize: '14px',
              lineHeight: '1',
            }}
          >
            검색
          </Button>
        </form>

        <div className={styles.option_right}>
          <select
            className={styles.small_select}
            value={memberStatus}
            onChange={(e) => {
              setMemberStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">전체 회원</option>
            <option value="0">정상 회원</option>
            <option value="1">비정상 회원</option>
            <option value="3">정지 회원</option>
          </select>

          <select
            className={styles.small_select}
            value={nameOrder}
            onChange={(e) => {
              setNameOrder(e.target.value);
              setPage(0);
            }}
          >
            <option value="asc">이름 오름차순</option>
            <option value="desc">이름 내림차순</option>
          </select>
        </div>
      </div>

      <div className={styles.member_list}>
        {memberList.map((member) => (
          <div className={styles.member_card} key={member.memberNo}>
            <div className={styles.member_thumb}>
              <img
                src={
                  member.memberThumb
                    ? `${import.meta.env.VITE_BACKSERVER}/upload/${member.memberThumb}`
                    : userImage
                }
                alt="프로필"
              />
            </div>

            <div className={styles.member_info_grid}>
              <Info label="아이디" value={member.memberId} />
              <Info label="이메일" value={member.memberEmail} />
              <Info label="닉네임" value={member.memberNickname} />
              <Info label="이름" value={member.memberName} />
              <Info label="가입일" value={member.enrollDate} />
              <Info label="지역" value={member.region || '-'} />

              <Info
                label="회원등급"
                value={
                  <select
                    className={styles.member_manage_select}
                    value={Number(member.admin)}
                    onChange={(e) => changeMemberAdmin(member, e.target.value)}
                  >
                    <option value={0}>일반 회원</option>
                    <option value={1}>관리자</option>
                  </select>
                }
              />

              <Info
                label="회원상태"
                value={
                  <select
                    className={styles.member_manage_select}
                    value={Number(member.memberStatus)}
                    onChange={(e) => changeMemberStatus(member, e.target.value)}
                  >
                    <option value={0}>정상</option>
                    <option value={1}>비정상</option>
                    <option value={3}>정지</option>
                  </select>
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.admin_pagination}>
        <Pagination
          page={page}
          setPage={setPage}
          totalPage={totalPage}
          naviSize={5}
        />
      </div>
    </>
  );
};

const ReportManage = ({ navigate }) => {
  const [target, setTarget] = useState(
    sessionStorage.getItem('adminReportTarget') || 'board',
  );

  const [reportList, setReportList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(null);
  const [searchType, setSearchType] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [category, setCategory] = useState(0);
  const [order, setOrder] = useState(1);
  const [reportStatus, setReportStatus] = useState('');

  const targetTabs = [
    { value: 'rest', label: '맛집' },
    { value: 'review', label: '맛집 리뷰' },
    { value: 'reviewComment', label: '맛집 댓글' },
    { value: 'board', label: '게시글' },
    { value: 'boardComment', label: '게시글 댓글' },
  ];

  const getReportList = () => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/reports`, {
        params: {
          target,
          page,
          size: 5,
          searchType,
          searchKeyword,
          category,
          order,
          reportStatus,
        },
      })
      .then((res) => {
        setReportList(res.data.items);
        setTotalPage(res.data.totalPage);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getReportList();
  }, [target, page, searchKeyword, category, order, reportStatus]);

  const resetFilter = (newTarget) => {
    setTarget(newTarget);
    sessionStorage.setItem('adminReportTarget', newTarget);
    setPage(0);
    setCategory(0);
    setOrder(1);
    setReportStatus('');
    setKeyword('');
    setSearchKeyword('');
  };

  const rejectReport = (report) => {
    Swal.fire({
      title: '신고를 반려하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '반려',
      cancelButtonText: '취소',
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--gray4)',
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/reports/${target}/${report.reportNo}/reject`,
        )
        .then((res) => {
          if (res.data === 1) {
            getReportList();
          }
        })
        .catch((err) => console.log(err));
    });
  };

  const processReport = (report, action) => {
    const actionName =
      action === 'public' ? '공개' : action === 'private' ? '비공개' : '삭제';

    Swal.fire({
      title: `${actionName} 처리하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '처리',
      cancelButtonText: '취소',
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--gray4)',
    }).then((result) => {
      if (!result.isConfirmed) return;

      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/admin/reports/${target}/${report.reportNo}/process`,
          {
            contentNo: report.contentNo,
            action,
          },
        )
        .then((res) => {
          if (res.data === 1) {
            getReportList();
          }
        })
        .catch((err) => console.log(err));
    });
  };

  const goDetail = (report) => {
    sessionStorage.setItem('adminMenu', 'report');
    sessionStorage.setItem('adminReportTarget', target);

    if (target === 'board' || target === 'boardComment') {
      navigate(`/board/view/${report.boardNo}`);
      return;
    }

    // 맛집 상세 이동
    if (target === 'rest') {
      navigate(`/rest/view/${report.contentNo}`);
      return;
    }

    // 맛집 리뷰 상세 이동
    if (target === 'review' || target === 'reviewComment') {
      navigate(`/rest/review/view/${report.reviewNo}`);
      return;
    }
  };

  return (
    <>
      <div className={styles.top_option_wrap}>
        <form
          className={styles.search_wrap}
          onSubmit={(e) => {
            e.preventDefault();
            setSearchKeyword(keyword);
            setPage(0);
          }}
        >
          <select
            className={styles.small_select}
            value={searchType}
            onChange={(e) => setSearchType(Number(e.target.value))}
          >
            <option value={1}>제목</option>
            <option value={2}>작성자</option>
          </select>

          <Input
            className={styles.admin_search_input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력하세요."
          />

          <Button
            type="submit"
            className="btn primary"
            style={{
              width: '60px',
              height: '30px',
              fontSize: '14px',
              lineHeight: '1',
            }}
          >
            검색
          </Button>
        </form>

        <div className={styles.option_right}>
          {(target === 'board' || target === 'boardComment') && (
            <select
              className={styles.small_select}
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
          )}

          <select
            className={styles.small_select}
            value={order}
            onChange={(e) => {
              setOrder(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value={1}>신고 최신순</option>
            <option value={2}>신고 많은순</option>
            <option value={3}>신고 오래된순</option>
          </select>

          <select
            className={styles.small_select}
            value={reportStatus}
            onChange={(e) => {
              setReportStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">전체 상태</option>
            <option value="0">처리대기</option>
            <option value="1">처리완료</option>
            <option value="2">반려</option>
          </select>
        </div>
      </div>

      <div className={styles.report_tab_wrap}>
        {targetTabs.map((tab) => (
          <button
            key={tab.value}
            className={target === tab.value ? styles.active_tab : styles.tab}
            onClick={() => resetFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.report_list}>
        {reportList.map((report) => (
          <div
            className={styles.report_card}
            key={`${target}-${report.reportNo}`}
            onClick={() => goDetail(report)}
          >
            <div className={styles.report_left}>
              <strong>{report.title}</strong>

              {target === 'review' && (
                <span className={styles.star_text}>
                  {'★'.repeat(Number(report.rating || 0))}
                  {'☆'.repeat(5 - Number(report.rating || 0))}
                </span>
              )}

              <p className={styles.report_content_text}>{report.content}</p>
            </div>

            <div className={styles.report_middle}>
              <div className={styles.report_reason_box}>
                <p>
                  <b>신고 사유:</b> {report.reportReason}
                </p>

                {report.detail && (
                  <p className={styles.detail_text}>{report.detail}</p>
                )}
              </div>

              <div className={styles.report_meta_group}>
                <span className={styles.report_reporter}>
                  신고자: {report.reporter || '-'}
                </span>

                <span className={styles.report_writer}>
                  작성자: {report.writer || '-'}
                </span>

                <span className={styles.report_date}>{report.reportDate}</span>

                <span className={styles.report_count}>
                  <ReportIcon className={styles.report_count_icon} />
                  {report.reportCount}
                </span>
              </div>
            </div>

            <div
              className={styles.report_right}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.process_row}>
                <span
                  className={`${styles.status_badge} ${
                    Number(report.reportStatus) === 0
                      ? styles.wait
                      : Number(report.reportStatus) === 1
                        ? styles.done
                        : styles.reject
                  }`}
                >
                  {Number(report.reportStatus) === 0
                    ? '처리대기'
                    : Number(report.reportStatus) === 1
                      ? '처리완료'
                      : '반려'}
                </span>

                <select
                  className={styles.process_select}
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return;

                    processReport(report, e.target.value);
                    e.target.value = '';
                  }}
                >
                  <option value="">처리</option>
                  <option value="public">공개</option>
                  <option value="private">비공개</option>
                  <option value="delete">삭제</option>
                </select>
              </div>

              <button
                className={styles.reject_btn}
                onClick={() => rejectReport(report)}
              >
                반려
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.admin_pagination}>
        <Pagination
          page={page}
          setPage={setPage}
          totalPage={totalPage}
          naviSize={5}
        />
      </div>
    </>
  );
};

const Info = ({ label, value }) => {
  return (
    <div className={styles.info_item}>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  );
};

export default AdminPage;
