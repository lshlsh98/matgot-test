import { useEffect, useState } from "react";
import styles from "./LocationTerms.module.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const LocationTerms = () => {
  const [activeSection, setActiveSection] = useState("section1");

  const handleScroll = () => {
    const sections = [
      "section1",
      "section2",
      "section3",
      "section4",
      "section5",
    ];
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 200) {
          setActiveSection(section);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className={styles.locationWrapper}>
      <div className={styles.container}>
        {/* 헤더 섹션 */}
        <div className={styles.header}>
          <div className={styles.titleIcon}>
            <LocationOnIcon fontSize="large" />
          </div>
          <h2>위치기반서비스 이용약관</h2>
          <p>
            내 주변 맛집 찾기 및 경로 안내 서비스를 위한 위치 정보 활용
            지침입니다.
          </p>
          <span className={styles.lastUpdated}>
            시행일자 : 2026년 06월 09일
          </span>
        </div>

        <div className={styles.contentLayout}>
          {/* 좌측 사이드바 네비게이션 */}
          <aside className={styles.sidebar}>
            <nav>
              <ul>
                <li
                  className={
                    activeSection === "section1" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section1")}
                >
                  제1조 목적 및 효력
                </li>
                <li
                  className={
                    activeSection === "section2" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section2")}
                >
                  제2조 서비스의 내용
                </li>
                <li
                  className={
                    activeSection === "section3" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section3")}
                >
                  제3조 이용요금 및 포인트
                </li>
                <li
                  className={
                    activeSection === "section4" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section4")}
                >
                  제4조 정보주체의 권리
                </li>
                <li
                  className={
                    activeSection === "section5" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section5")}
                >
                  제5조 위치정보책임자
                </li>
              </ul>
            </nav>
          </aside>

          {/* 우측 본문 영역 */}
          <main className={styles.mainContent}>
            <section id="section1" className={styles.termSection}>
              <h3>제1조 (목적 및 약관의 효력)</h3>
              <div className={styles.subContent}>
                <p>
                  1. 본 약관은 이용자가 "맛맛곳곳"(이하 "회사")이 제공하는
                  위치기반서비스를 이용함에 있어 회사와 이용자의 권리·의무 및
                  책임사항을 규정함을 목적으로 합니다.
                </p>
                <p>
                  2. 이용자가 본 서비스를 이용할 경우 본 약관에 동의한 것으로
                  간주하며, 회사는 약관의 내용을 서비스 화면에 게시하거나 기타의
                  방법으로 이용자에게 공지함으로써 효력이 발생합니다.
                </p>
              </div>
            </section>

            <section id="section2" className={styles.termSection}>
              <h3>제2조 (서비스의 내용 및 정보 보유)</h3>
              <p>
                회사는 이용자의 위치정보를 활용하여 아래와 같은 서비스를
                제공합니다.
              </p>
              <div className={styles.infoBlock}>
                <ul>
                  <li>
                    <strong>내 주변 맛집 검색:</strong> 이용자의 현재 위치를
                    기반으로 근거리 식당 정보 제공
                  </li>
                  <li>
                    <strong>최적 코스 추천:</strong> 지점 간 이동 거리 및 소요
                    시간 계산을 통한 여행 경로 최적화
                  </li>
                  <li>
                    <strong>길 안내 서비스:</strong> 출발지부터 맛집까지의 도보
                    및 차량 경로 시각화
                  </li>
                </ul>
                <p className={styles.noticeText}>
                  ※ 회사는 위치정보의 이용·제공사실 확인자료를 위치정보시스템에
                  자동으로 기록하며, 해당 자료는 관련 법령에 따라 6개월 이상
                  보관합니다.
                </p>
              </div>
            </section>

            <section id="section3" className={styles.termSection}>
              <h3>제3조 (서비스 이용요금)</h3>
              <div className={styles.subContent}>
                <p>
                  1. 회사가 제공하는 위치기반서비스는 기본적으로{" "}
                  <strong>무료</strong>입니다.
                </p>
                <p>
                  2. 단, 무선 서비스 이용 시 발생하는 데이터 통신료는 이용자가
                  가입한 각 이동통신사의 정책에 따라 이용자에게 부과될 수
                  있습니다.
                </p>
              </div>
            </section>

            <section id="section4" className={styles.termSection}>
              <h3>제4조 (개인위치정보주체의 권리)</h3>
              <div className={styles.subContent}>
                <p>
                  1. 이용자는 회사에 대하여 언제든지 위치정보 수집에 대한 동의의
                  전부 또는 일부를 철회할 수 있습니다.
                </p>
                <p>
                  2. 이용자는 위치정보의 이용 및 제공 사실 확인자료의 열람 또는
                  고지를 요구할 수 있으며, 오류가 있는 경우 정정을 요구할 수
                  있습니다.
                </p>
                <p>
                  3. 회사는 이용자가 동의의 전부 또는 일부를 철회한 경우에는
                  지체 없이 수집된 개인위치정보 및 확인자료를 파기합니다.
                </p>
              </div>
            </section>

            <section id="section5" className={styles.termSection}>
              <h3>제5조 (위치정보 관리책임자의 정보)</h3>
              <p>
                회사는 위치정보를 적절히 관리·보호하고 개인위치정보주체의 불만을
                원활히 처리할 수 있도록 실질적인 책임을 질 수 있는 지위에 있는
                자를 위치정보관리책임자로 지정하고 있습니다.
              </p>

              <div className={styles.contactBox}>
                <p>
                  <strong>위치정보관리책임자</strong>
                </p>
                <ul>
                  <li>성명 : 이위치 팀장</li>
                  <li>소속 : 맛맛곳곳 서비스운영본부</li>
                  <li>연락처 : 02-1234-5678</li>
                  <li>이메일 : location@matmatgotgot.com</li>
                </ul>
              </div>
            </section>

            <div className={styles.finalNote}>
              <p>공고일자 : 2026년 06월 02일</p>
              <p>시행일자 : 2026년 06월 09일</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LocationTerms;
