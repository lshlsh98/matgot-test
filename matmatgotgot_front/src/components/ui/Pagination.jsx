import styles from "./Pagination.module.css";

const Pagination = ({ page, setPage, totalPage, naviSize }) => {
  if (totalPage === null || totalPage < 1) {
    //db 먼저 수행할 수 있도록 함
    return null;
  }

  // 현재 페이지 번호 (서버에 주는 숫자 + 1, 1부터 시작하도록)
  const current = page + 1;
  const halfLenth = Math.floor(naviSize / 2);
  // 현재 페이지가 페이지네이션의 가운데 숫자가 될 수 있도록 함
  let startPage = Math.max(1, current - halfLenth);
  // 마지막 페이지가 총 페이지 개수를 넘지 않도록
  let endPage = Math.min(totalPage, startPage + naviSize - 1);

  const pages = new Array();

  for (let i = startPage; i < endPage + 1; i++) {
    pages.push(i);
  }

  const isFirst = current === 1;
  const isLast = current === totalPage;

  return (
    <div className={styles.pagination_wrap}>
      {/* 처음 페이지로 이동 */}
      <button
        className={styles.jump_btn}
        onClick={() => setPage(0)}
        disabled={isFirst}
        title="첫 페이지"
      >
        {"<<"}
      </button>

      {/* 이전 페이지로 이동 */}
      <button
        className={styles.nav_btn}
        onClick={() => setPage(page - 1)}
        disabled={isFirst}
        title="이전 페이지"
      >
        {"<"}
      </button>

      {/* 페이지 번호 목록 — 현재 페이지에 .active 클래스 적용 */}
      {pages.map((p, i) => (
        <button
          key={"pagination-" + i}
          className={p === current ? styles.active : styles.page_btn}
          onClick={() => setPage(p - 1)}
        >
          {p}
        </button>
      ))}

      {/* 다음 페이지로 이동 */}
      <button
        className={styles.nav_btn}
        onClick={() => setPage(page + 1)}
        disabled={isLast}
        title="다음 페이지"
      >
        {">"}
      </button>

      {/* 마지막 페이지로 이동 */}
      <button
        className={styles.jump_btn}
        onClick={() => setPage(totalPage - 1)}
        disabled={isLast}
        title="마지막 페이지"
      >
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;
