import { useState } from "react";
import styles from "./Faq.module.css";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import { useNavigate } from "react-router-dom";

const FAQ_DATA = [
  {
    id: 1,
    category: "회원",
    question: "회원가입은 꼭 해야 코스를 만들 수 있나요?",
    answer:
      "맛맛곳곳의 추천 맛집 리스트는 비회원도 자유롭게 둘러보실 수 있습니다. 하지만 '나만의 여행 코스 설계', '코스 저장 및 수정', '커뮤니티 공유' 등의 개인화 기능은 안전한 데이터 보관을 위해 회원가입 및 로그인 후 이용이 가능합니다.",
  },
  {
    id: 2,
    category: "코스",
    question: "일정별 코스는 최대 며칠까지 생성 가능한가요?",
    answer:
      "현재 맛맛곳곳에서 생성 가능한 여행 코스는 당일치기(1일)부터 최대 7일(6박 7일)까지 설정할 수 있습니다. 각 Day별로는 동선의 효율성과 지도 API 로딩 안정성을 위해 최대 6개의 식당 또는 장소를 추가하는 것을 권장합니다.",
  },
  {
    id: 3,
    category: "맛집",
    question: "방문했던 맛집이 검색창에 나오지 않는데 추가할 수 없나요?",
    answer:
      "검색 결과에 없는 새로운 식당은 코스 편집기 내에서 유저가 직접 추가할 수 있습니다! 코스 만들기 화면 왼쪽에 있는 '메뉴 직접 등록' 또는 '식당 추가' 기능을 이용해 식당 이름, 주소, 추천 메뉴 및 가격을 입력하시면 나만의 코스에 바로 반영됩니다.",
  },
  {
    id: 4,
    category: "코스",
    question: "설계한 코스의 이동 시간과 거리는 정확한가요?",
    answer:
      "맛맛곳곳은 국토교통부 및 Tmap, ODsay(대중교통) API를 연동하여 실시간에 가까운 도보/자동차/대중교통 소요 시간을 계산합니다. 다만, 당일 실시간 교통 정체나 도로 상황, 대중교통 배차 간격에 따라 실제 소요 시간과 일부 오차가 발생할 수 있습니다.",
  },
  {
    id: 5,
    category: "회원",
    question: "비밀번호를 분실했는데 어떻게 찾나요?",
    answer:
      "로그인 화면 하단의 '비밀번호 찾기' 링크를 클릭하신 후, 가입 시 등록한 이메일 주소를 입력해 주세요. 해당 이메일로 임시 비밀번호를 변경할 수 있는 안전한 인증 링크를 발송해 드립니다.",
  },
  {
    id: 6,
    category: "기타",
    question: "1:1 문의 답변은 어디서 확인하나요?",
    answer:
      "공지사항 옆 '1:1 문의(Q&A)' 게시판을 통해 접수해주신 문의사항은 영업일 기준 보통 24시간 이내에 답변 처리가 완료됩니다. 답변 내용은 마이페이지 내 '내 문의 내역' 메뉴에서 실시간으로 확인하실 수 있습니다.",
  },
];

const Faq = () => {
  const navigate = useNavigate();

  const [faqs] = useState(FAQ_DATA);
  const [activeTab, setActiveTab] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesTab = activeTab === "전체" || faq.category === activeTab;
    const matchesKeyword =
      faq.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesTab && matchesKeyword;
  });

  return (
    <div className={styles.faqWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>자주 묻는 질문</h2>
          <p>
            유저분들이 맛맛곳곳 서비스 이용 시 가장 자주 묻는 질문들을
            모았습니다.
          </p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="궁금한 점을 검색해 보세요! (예: 코스 기간, 비밀번호)"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setExpandedId(null);
              }}
            />
          </div>
        </div>

        <div className={styles.tabContainer}>
          {["전체", "회원", "코스", "맛집", "기타"].map((tab) => (
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

        <div className={styles.faqList}>
          {filteredFaqs.length === 0 ? (
            <div className={styles.noData}>
              <p>🔍 검색 결과에 맞는 자주 묻는 질문이 없습니다.</p>
              <span>다른 키워드로 검색하시거나 1:1 문의를 이용해 주세요.</span>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`${styles.faqItem} ${isExpanded ? styles.activeItem : ""}`}
                >
                  <div
                    className={styles.faqQuestion}
                    onClick={() => handleToggle(faq.id)}
                  >
                    <div className={styles.questionTitle}>
                      <span className={styles.qText}>Q</span>
                      <span className={styles.categoryBadge}>
                        {faq.category}
                      </span>
                      <p className={styles.questionText}>{faq.question}</p>
                    </div>
                    <ExpandMoreIcon
                      className={`${styles.arrowIcon} ${isExpanded ? styles.rotatedArrow : ""}`}
                    />
                  </div>

                  <div
                    className={`${styles.faqAnswerWrapper} ${isExpanded ? styles.showAnswer : ""}`}
                  >
                    <div className={styles.faqAnswer}>
                      <span className={styles.aText}>A</span>
                      <p className={styles.answerText}>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.contactBanner}>
          <HelpOutlineIcon className={styles.bannerIcon} />
          <div className={styles.bannerText}>
            <h4>원하시는 답변을 찾지 못하셨나요?</h4>
            <p>
              고객센터 1:1 문의를 통해 질문을 남겨주시면 신속하고 친절하게
              답변해 드리겠습니다.
            </p>
          </div>
          <button className={styles.bannerBtn} onClick={() => navigate("/qna")}>
            1:1 문의하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Faq;
