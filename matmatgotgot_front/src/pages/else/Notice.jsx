import { useState } from "react";
import styles from "./Notice.module.css";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CampaignIcon from "@mui/icons-material/Campaign";

const INITIAL_NOTICES = [
  {
    id: 1,
    category: "점검",
    title: "[공지] 시스템 정기 점검 안내 (6월 15일)",
    date: "2026.06.09",
    isPinned: true,
    content:
      "안녕하세요. 맛맛곳곳입니다.\n\n더 안정적인 서비스 제공을 위해 서버 정기 점검이 진행될 예정입니다.\n점검 시간 동안은 서비스 이용이 일시 중단되오니 이용에 참고하시기 바랍니다.\n\n■ 점검 시간: 2026년 6월 15일(월) 새벽 02:00 ~ 06:00 (약 4시간)\n■ 작업 내용: DB 최적화 및 서버 안정화\n\n항상 더 나은 서비스를 제공하기 위해 노력하는 맛맛곳곳이 되겠습니다. 감사합니다.",
  },
  {
    id: 2,
    category: "이벤트",
    title: "✨ 맛맛곳곳 런칭 기념 리뷰 왕 이벤트 안내",
    date: "2026.06.01",
    isPinned: true,
    content:
      "안녕하세요! 맛맛곳곳입니다.\n\n나만의 비밀 맛집 코스를 공유하고 푸짐한 선물도 받아 가세요!\n가장 정성스러운 코스와 리뷰를 작성해주신 10분을 선정하여 '백화점 상품권 5만원권'을 드립니다.\n\n■ 참여 방법: 여행 코스 만들기 메뉴에서 코스 등록 후 커뮤니티 공유!\n■ 이벤트 기간: 2026년 6월 1일 ~ 6월 30일까지\n■ 당첨자 발표: 2026년 7월 5일 공지사항 발표",
  },
  {
    id: 3,
    category: "안내",
    title: "위치 기반 코스 추천 기능 고도화 업데이트 완료",
    date: "2026.05.28",
    isPinned: false,
    content:
      "이제 내 주변 맛집뿐만 아니라 동선상 가장 최적화된 도보/차량 이동 시간을 기준으로 코스를 정교하게 짜실 수 있습니다.\n\nTmap 및 ODsay API 연동 최적화로 로딩 속도가 30% 개선되었습니다. 지금 바로 새로워진 코스 편집기를 이용해 보세요!",
  },
  {
    id: 4,
    category: "서비스",
    title: "개인정보처리방침 변경 안내",
    date: "2026.05.15",
    isPinned: false,
    content:
      "맛맛곳곳 서비스를 이용해 주시는 회원 여러분께 감사드립니다.\n새로운 기능 도입에 따른 개인정보처리방침 일부 변경 내용을 안내해 드립니다.\n\n개정 사항은 2026년 5월 22일부로 효력이 발생하며, 세부 변경 사항은 고객센터 약관 페이지에서 확인하실 수 있습니다.",
  },
];

const Notice = () => {
  const [notices] = useState(INITIAL_NOTICES);
  const [activeTab, setActiveTab] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesTab = activeTab === "전체" || notice.category === activeTab;
    const matchesKeyword =
      notice.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesTab && matchesKeyword;
  });

  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.id - a.id;
  });

  return (
    <div className={styles.noticeWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>공지사항</h2>
          <p>맛맛곳곳의 주요 소식과 알림을 전해드립니다.</p>
        </div>

        <div className={styles.utilBar}>
          <div className={styles.tabs}>
            {["전체", "안내", "점검", "이벤트", "서비스"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  setExpandedId(null);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setExpandedId(null);
              }}
            />
          </div>
        </div>

        <div className={styles.listContainer}>
          {sortedNotices.length === 0 ? (
            <div className={styles.noData}>등록된 공지사항이 없습니다.</div>
          ) : (
            sortedNotices.map((notice) => {
              const isExpanded = expandedId === notice.id;
              return (
                <div
                  key={notice.id}
                  className={`${styles.noticeItem} ${notice.isPinned ? styles.pinnedItem : ""} ${isExpanded ? styles.expandedItem : ""}`}
                >
                  <div
                    className={styles.itemHeader}
                    onClick={() => handleToggle(notice.id)}
                  >
                    <div className={styles.titleSide}>
                      {notice.isPinned ? (
                        <span className={styles.pinBadge}>
                          <CampaignIcon fontSize="small" /> 중요
                        </span>
                      ) : (
                        <span className={styles.categoryBadge}>
                          {notice.category}
                        </span>
                      )}
                      <span className={styles.titleText}>{notice.title}</span>
                    </div>
                    <div className={styles.infoSide}>
                      <span className={styles.date}>{notice.date}</span>
                      <span className={styles.arrowIcon}>
                        {isExpanded ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.itemContent}>
                      <p>{notice.content}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notice;
