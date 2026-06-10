import { useEffect, useState } from "react";
import styles from "./Terms.module.css";
import GavelIcon from "@mui/icons-material/Gavel";

const Terms = () => {
  const [activeSection, setActiveSection] = useState("section1");

  const handleScroll = () => {
    const sections = [
      "section1",
      "section2",
      "section3",
      "section4",
      "section5",
      "section6",
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
    <div className={styles.termsWrapper}>
      <div className={styles.container}>
        {/* 헤더 섹션 */}
        <div className={styles.header}>
          <div className={styles.titleIcon}>
            <GavelIcon fontSize="large" />
          </div>
          <h2>이용약관</h2>
          <p>맛맛곳곳 서비스 이용을 위한 약관 및 정책을 안내해 드립니다.</p>
          <span className={styles.lastUpdated}>
            최종 수정일 : 2026년 06월 09일
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
                  제1조 총칙
                </li>
                <li
                  className={
                    activeSection === "section2" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section2")}
                >
                  제2조 서비스 이용계약
                </li>
                <li
                  className={
                    activeSection === "section3" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section3")}
                >
                  제3조 서비스 이용 제한
                </li>
                <li
                  className={
                    activeSection === "section4" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section4")}
                >
                  제4조 계약 당사자의 의무
                </li>
                <li
                  className={
                    activeSection === "section5" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section5")}
                >
                  제5조 책임제한 및 면책
                </li>
                <li
                  className={
                    activeSection === "section6" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section6")}
                >
                  제6조 준거법 및 관할법원
                </li>
              </ul>
            </nav>
          </aside>

          {/* 우측 약관 본문 */}
          <main className={styles.mainContent}>
            <section id="section1" className={styles.termSection}>
              <h3>제1조 (목적)</h3>
              <p>
                이 약관은 "맛맛곳곳"(이하 "회사"라 함)이 운영하는 웹사이트 및
                모바일 애플리케이션을 통해 제공하는 맛집 정보 공유 및 여행 코스
                설계 서비스(이하 "서비스"라 함)의 이용 조건 및 절차에 관한
                사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section id="section2" className={styles.termSection}>
              <h3>제2조 (서비스 이용계약의 성립)</h3>
              <div className={styles.subContent}>
                <p>
                  1. 이용계약은 이용자가 본 약관의 내용에 동의한 후 회원가입
                  신청을 하고, 회사가 이를 승낙함으로써 성립합니다.
                </p>
                <p>
                  2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지
                  않거나 사후에 이용계약을 해지할 수 있습니다.
                </p>
                <ul>
                  <li>타인의 명의를 이용하거나 허위 정보를 기재한 경우</li>
                  <li>
                    사회의 안녕과 질서, 미풍양속을 저해할 목적으로 신청한 경우
                  </li>
                  <li>부정한 용도로 서비스를 이용하고자 하는 경우</li>
                </ul>
              </div>
            </section>

            <section id="section3" className={styles.termSection}>
              <h3>제3조 (서비스 이용 및 제한)</h3>
              <p>
                회사는 연중무휴, 1일 24시간 서비스 제공을 원칙으로 합니다. 다만,
                시스템 정기 점검, 설비의 보수, 통신 장애 등 운영상 상당한 이유가
                있는 경우 서비스의 전부 또는 일부를 일시적으로 중단할 수
                있습니다. 이 경우 회사는 공지사항을 통해 사전에 통지합니다.
              </p>
            </section>

            <section id="section4" className={styles.termSection}>
              <h3>제4조 (회사의 의무와 이용자의 의무)</h3>
              <div className={styles.subContent}>
                <p>
                  1. 회사는 관련법과 이 약관이 금지하거나 미풍양속에 어긋나는
                  행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기
                  위하여 최선을 다하여 노력합니다.
                </p>
                <p>2. 이용자는 다음 각 호의 행위를 하여서는 안 됩니다.</p>
                <ul>
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>
                    회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는
                    게시
                  </li>
                </ul>
              </div>
            </section>

            <section id="section5" className={styles.termSection}>
              <h3>제5조 (면책 조항)</h3>
              <p>
                회사는 천재지변, 전시, 비상사태 또는 이에 준하는 불가항력으로
                인하여 서비스를 제공할 수 없는 경우 서비스 제공에 관한 책임이
                면제됩니다. 또한, 이용자가 게재한 정보, 자료, 사실의 신뢰도 및
                정확성에 대해서는 보증하지 않으며, 이용자 간에 발생한 분쟁에
                대해서는 개입할 의무가 없습니다.
              </p>
            </section>

            <section id="section6" className={styles.termSection}>
              <h3>제6조 (준거법 및 관할법원)</h3>
              <p>
                회사와 이용자 간에 발생한 분쟁에 대하여는 대한민국 법을
                준거법으로 하며, 회사와 이용자 간에 발생한 소송의 관할법원은
                회사의 본사 소재지를 관할하는 법원을 전용 관할법원으로 합니다.
              </p>
            </section>

            <div className={styles.finalNote}>
              <p>
                본 약관에 명시되지 않은 사항은 전기통신기본법, 전기통신사업법 및
                기타 관련 법령의 규정에 따릅니다.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Terms;
