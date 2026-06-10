import { EditorContent, useEditor } from "@tiptap/react";
import styles from "./TextEditor.module.css";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import ResizeImage from "tiptap-extension-resize-image";
// TextAlign 사용 전 설치 필요: npm install @tiptap/extension-text-align
import TextAlign from "@tiptap/extension-text-align";
import axios from "axios";

// MUI 아이콘 — 메뉴 버튼에 사용
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import ImageIcon from "@mui/icons-material/Image";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { useEffect } from "react";

const TextEditor = ({ data, setData }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizeImage,
      // TextAlign: heading과 paragraph에 좌/가운데/우 정렬 기능 적용
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: data || "",
    immediatelyRender: false, // Next.js 서버사이드 렌더링 hydration 오류 방지
    onUpdate: ({ editor }) => {
      setData(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== data) {
      editor.commands.setContent(data || "");
    }
  }, [editor, data]);

  return (
    <div className={styles.editor_wrap}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className={styles.editor_content} />
    </div>
  );
};

// ===== 메뉴 바 컴포넌트 =====
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  // 이미지 파일 선택 → 백엔드 업로드 → 에디터에 삽입
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return; // 파일 선택 취소 시 종료

      const form = new FormData();
      form.append("image", file);

      // 선택한 이미지를 백엔드에 업로드하고 파일 이름을 받아옴
      axios
        .post(
          `${import.meta.env.VITE_BACKSERVER}/restaurants/image-upload`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        )
        .then((res) => {
          const imageUrl = `${res.data}`;
          editor.chain().focus().setImage({ src: imageUrl }).run();
        })
        .catch(console.error);
    };
  };

  return (
    <div className={styles.menu_bar}>
      {/* ── 그룹 1: 제목 (H1 / H2) ── */}
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="제목 1"
      >
        H1
      </button>
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="제목 2"
      >
        H2
      </button>

      <span className={styles.separator} aria-hidden="true" />

      {/* ── 그룹 2: 텍스트 서식 (굵게 / 기울임) ── */}
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive("bold") ? styles.active : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="굵게 (Ctrl+B)"
      >
        <FormatBoldIcon fontSize="small" />
      </button>
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive("italic") ? styles.active : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="기울임 (Ctrl+I)"
      >
        <FormatItalicIcon fontSize="small" />
      </button>

      <span className={styles.separator} aria-hidden="true" />

      {/* ── 그룹 3: 목록 (순서 없음 / 순서 있음) ── */}
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive("bulletList") ? styles.active : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="순서 없는 목록"
      >
        <FormatListBulletedIcon fontSize="small" />
      </button>
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive("orderedList") ? styles.active : ""}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="순서 있는 목록"
      >
        <FormatListNumberedIcon fontSize="small" />
      </button>

      <span className={styles.separator} aria-hidden="true" />

      {/* ── 그룹 4: 텍스트 정렬 (왼쪽 / 가운데 / 오른쪽) ── */}
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive({ textAlign: "left" }) ? styles.active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="왼쪽 정렬"
      >
        <FormatAlignLeftIcon fontSize="small" />
      </button>
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive({ textAlign: "center" }) ? styles.active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="가운데 정렬"
      >
        <FormatAlignCenterIcon fontSize="small" />
      </button>
      <button
        type="button"
        className={`${styles.menu_btn} ${editor.isActive({ textAlign: "right" }) ? styles.active : ""}`}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="오른쪽 정렬"
      >
        <FormatAlignRightIcon fontSize="small" />
      </button>

      <span className={styles.separator} aria-hidden="true" />

      {/* ── 그룹 5: 삽입 (이미지) ── */}
      <button
        type="button"
        className={styles.menu_btn}
        onClick={addImage}
        title="이미지 삽입"
      >
        <ImageIcon fontSize="small" />
      </button>

      <span className={styles.separator} aria-hidden="true" />

      {/* ── 그룹 6: 실행 취소 / 다시 실행 ── */}
      <button
        type="button"
        className={styles.menu_btn}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="실행 취소 (Ctrl+Z)"
      >
        <UndoIcon fontSize="small" />
      </button>
      <button
        type="button"
        className={styles.menu_btn}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="다시 실행 (Ctrl+Y)"
      >
        <RedoIcon fontSize="small" />
      </button>
    </div>
  );
};

export default TextEditor;
