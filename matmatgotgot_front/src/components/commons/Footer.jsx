import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

const Footer = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div className={styles.infoSection}>
            <h2 className={styles.footerLogo}>맛맛곳곳</h2>
            <p className={styles.footerDesc}>
              대한민국 구석구석 맛집을 찾아 나만의 특별한 여행 코스를 설계하는
              맛집 정복 플랫폼
            </p>
            <div className={styles.snsIcons}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.snsLink}
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.snsLink}
              >
                <InstagramIcon />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.snsLink}
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h4>서비스</h4>
              <Link
                to="/rest"
                className={isActive("/rest") ? styles.activeLink : ""}
              >
                맛집 검색
              </Link>
              <Link
                to="/trip"
                className={isActive("/trip") ? styles.activeLink : ""}
              >
                여행 코스
              </Link>
              <Link
                to="/trip/create"
                className={isActive("/board/list") ? styles.activeLink : ""}
              >
                게시판
              </Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>고객지원</h4>
              <Link
                to="/notice"
                className={isActive("/notice") ? styles.activeLink : ""}
              >
                공지사항
              </Link>
              <Link
                to="/faq"
                className={isActive("/faq") ? styles.activeLink : ""}
              >
                자주 묻는 질문
              </Link>
              <Link
                to="/qna"
                className={isActive("/qna") ? styles.activeLink : ""}
              >
                1:1 문의
              </Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>약관 및 정책</h4>
              <Link
                to="/terms"
                className={isActive("/terms") ? styles.activeLink : ""}
              >
                이용약관
              </Link>
              <Link
                to="/privacy"
                className={`${styles.boldLink} ${isActive("/privacy") ? styles.activeLink : ""}`}
              >
                개인정보처리방침
              </Link>
              <Link
                to="/location"
                className={isActive("/location") ? styles.activeLink : ""}
              >
                위치기반서비스 이용약관
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.footerBottom}>
          <div className={styles.companyInfo}>
            <span>(주)맛맛곳곳</span>
            <span>대표이사 : 홍길동</span>
            <span>주소 : 서울특별시 강남구 테헤란로 123, 4층</span>
            <span>사업자등록번호 : 123-45-67890</span>
            <span>통신판매업신고 : 제 2026-서울강남-1234호</span>
            <span>이메일 : support@matmatgotgot.com</span>
          </div>
          <p className={styles.copyright}>
            © 2026 맛맛곳곳. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
