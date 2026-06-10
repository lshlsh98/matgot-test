import { useEffect, useState } from "react";
import styles from "./Privacy.module.css";
import SecurityIcon from "@mui/icons-material/Security";

const Privacy = () => {
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
    <div className={styles.privacyWrapper}>
      <div className={styles.container}>
        {/* 헤더 섹션 */}
        <div className={styles.header}>
          <div className={styles.titleIcon}>
            <SecurityIcon fontSize="large" />
          </div>
          <h2>개인정보처리방침</h2>
          <p>
            맛맛곳곳은 이용자의 개인정보를 중요시하며, 관련 법령을 준수하고
            있습니다.
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
                  1. 수집하는 항목 및 방법
                </li>
                <li
                  className={
                    activeSection === "section2" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section2")}
                >
                  2. 개인정보의 이용목적
                </li>
                <li
                  className={
                    activeSection === "section3" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section3")}
                >
                  3. 보유 및 이용기간
                </li>
                <li
                  className={
                    activeSection === "section4" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section4")}
                >
                  4. 개인정보의 파기절차
                </li>
                <li
                  className={
                    activeSection === "section5" ? styles.activeNav : ""
                  }
                  onClick={() => scrollToSection("section5")}
                >
                  5. 이용자의 권리 및 연락처
                </li>
              </ul>
            </nav>
          </aside>

          {/* 우측 본문 영역 */}
          <main className={styles.mainContent}>
            <section id="section1" className={styles.termSection}>
              <h3>1. 수집하는 개인정보 항목 및 수집방법</h3>
              <p className={styles.leadText}>
                회사는 회원가입, 원활한 고객상담, 서비스 제공을 위해 아래와 같은
                개인정보를 수집하고 있습니다.
              </p>

              <table className={styles.privacyTable}>
                <thead>
                  <tr>
                    <th>수집 시점</th>
                    <th>수집 항목</th>
                    <th>수집 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>일반 회원가입</strong>
                    </td>
                    <td>이메일 주소, 비밀번호, 닉네임</td>
                    <td>이용자 식별 및 계정 관리</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>서비스 이용 과정</strong>
                    </td>
                    <td>접속 로그, 쿠키, 서비스 이용 기록, IP 정보</td>
                    <td>서비스 부정 이용 방지 및 품질 개선</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>위치기반 서비스</strong>
                    </td>
                    <td>사용자 현재 위치 정보 (선택 동의 시)</td>
                    <td>주변 맛집 검색 및 최적 경로 추천</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="section2" className={styles.termSection}>
              <h3>2. 개인정보의 이용목적</h3>
              <p>
                회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다. 명시된
                목적 외의 용도로는 사용되지 않으며, 이용 목적이 변경될 시에는
                사전 동의를 구할 예정입니다.
              </p>
              <ul className={styles.dottedList}>
                <li>
                  <strong>서비스 제공에 관한 계약 이행:</strong> 맞춤형 여행
                  코스 설계 서비스 제공, 컨텐츠 제공, 위치기반 서비스 제공
                </li>
                <li>
                  <strong>회원 관리:</strong> 회원제 서비스 이용에 따른
                  본인확인, 개인 식별, 불량회원의 부정이용 방지와 비인가 사용
                  방지, 가입의사 확인, 불만처리 등 민원처리
                </li>
              </ul>
            </section>

            <section id="section3" className={styles.termSection}>
              <h3>3. 개인정보의 보유 및 이용기간</h3>
              <p>
                회사는 회원 탈퇴 시 혹은 위 목적을 달성할 때까지 이용자의
                개인정보를 보유합니다. 단, 관계법령의 규정에 의하여 보존할
                필요가 있는 경우 회사는 아래와 같이 일정 기간 회원정보를
                보관합니다.
              </p>
              <ul className={styles.dottedList}>
                <li>
                  <strong>웹사이트 방문 기록:</strong> 3개월 (통신비밀보호법)
                </li>
                <li>
                  <strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년
                  (전자상거래 등에서의 소비자보호에 관한 법률)
                </li>
                <li>
                  <strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년
                  (전자상거래 등에서의 소비자보호에 관한 법률)
                </li>
              </ul>
            </section>

            <section id="section4" className={styles.termSection}>
              <h3>4. 개인정보의 파기절차 및 방법</h3>
              <p>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당
                정보를 지체 없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.
              </p>
              <div className={styles.subBlock}>
                <h4>■ 파기절차</h4>
                <p>
                  회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 별도의
                  DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련
                  법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후
                  파기됩니다.
                </p>
                <h4>■ 파기방법</h4>
                <p>
                  전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는
                  기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는
                  분쇄기로 분쇄하거나 소각을 통하여 파기합니다.
                </p>
              </div>
            </section>

            <section id="section5" className={styles.termSection}>
              <h3>5. 이용자 및 법정대리인의 권리와 그 행사방법</h3>
              <p>
                이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나
                수정할 수 있으며 가입해지(회원탈퇴)를 요청할 수도 있습니다.
                개인정보 관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체
                없이 조치하겠습니다.
              </p>

              <div className={styles.managerBox}>
                <h4>개인정보 보호책임자 및 담당부서</h4>
                <p>이름 : 김보안 팀장</p>
                <p>소속 : 맛맛곳곳 정보보호부</p>
                <p>이메일 : privacy@matmatgotgot.com</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
