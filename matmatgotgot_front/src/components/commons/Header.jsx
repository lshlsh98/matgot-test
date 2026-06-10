import styles from "./Header.module.css";
import { FiBell, FiMail, FiUser, FiSettings } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/logo/black_only.png";

export default function Header() {
  const location = useLocation();
  const { memberId, admin } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>
            <Link to="/">
              <img src={logo} alt="맛맛곳곳 로고" className={styles.logoImg} />
              <div className={styles.logoText}>맛맛곳곳</div>
            </Link>
          </div>
        </div>

        {memberId && (
          <nav className={styles.centerMenu}>
            <button
              className={
                location.pathname.startsWith("/rest") ? styles.activeMenu : ""
              }
            >
              <Link to="/rest">맛집</Link>
            </button>

            <button
              className={
                location.pathname.startsWith("/trip") ? styles.activeMenu : ""
              }
            >
              <Link to="/trip">여행</Link>
            </button>

            <button
              className={
                location.pathname.startsWith("/board") ? styles.activeMenu : ""
              }
            >
              <Link to="/board/list">게시판</Link>
            </button>
          </nav>
        )}

        <div className={styles.rightArea}>
          {memberId ? (
            <div className={styles.userMenu}>
              <button aria-label="알림" className={styles.iconBtn}>
                <FiBell />
              </button>

              <button aria-label="메시지" className={styles.iconBtn}>
                <FiMail />
              </button>

              {admin ? (
                <Link to="/admin">
                  <button aria-label="관리자페이지" className={styles.iconBtn}>
                    <FiUser />
                  </button>
                </Link>
              ) : (
                <Link to="/mypage/myinfo">
                  <button aria-label="마이페이지" className={styles.iconBtn}>
                    <FiUser />
                  </button>
                </Link>
              )}

              <Link to={"/logout"}>
                <button
                  aria-label="설정"
                  className={styles.iconBtn}
                  onClick={logout}
                >
                  <FiSettings />
                </button>
              </Link>
            </div>
          ) : (
            <div className={styles.authMenu}>
              <button>
                <Link to="/login">Login</Link>
              </button>

              <button>
                <Link to="/signup">Sign Up</Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
