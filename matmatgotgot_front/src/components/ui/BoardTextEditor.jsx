import { EditorContent, useEditor } from '@tiptap/react';
import styles from './BoardTextEditor.module.css';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import ResizeImage from 'tiptap-extension-resize-image';
import axios from 'axios';
import { useEffect } from 'react';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ImageIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import RedoIcon from '@mui/icons-material/Redo';
import TextAlign from '@tiptap/extension-text-align';

const BoardTextEditor = ({ data, setData }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      ResizeImage,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: data || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setData(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && data && editor.isEmpty) {
      editor.commands.setContent(data);
    }
  }, [editor, data]);

  return (
    <div className={styles.editor_wrap}>
      <MenuBar editor={editor} />

      <div style={{ position: 'relative' }}>
        {!data && <div className={styles.placeholder}>내용을 입력하세요.</div>}

        <EditorContent editor={editor} className={styles.editor_content} />
      </div>
    </div>
  );
};

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;

      const form = new FormData();
      form.append('image', file);

      axios
        .post(`${import.meta.env.VITE_BACKSERVER}/boards/image-upload`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          const imageUrl = `${import.meta.env.VITE_IMG_SERVER}/editor/${res.data}`;
          editor.chain().focus().setImage({ src: imageUrl }).run();
        })
        .catch((err) => {
          console.log(err);
        });
    };
  };

  return (
    <div className={styles.menu_bar}>
      <button
        type="button"
        className={
          editor.isActive('heading', { level: 1 }) ? styles.active : ''
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>

      <button
        type="button"
        className={
          editor.isActive('heading', { level: 2 }) ? styles.active : ''
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>

      <span className={styles.toolbar_divider}></span>

      <button
        type="button"
        className={editor.isActive('bold') ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FormatBoldIcon fontSize="small" />
      </button>

      <button
        type="button"
        className={editor.isActive('italic') ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FormatItalicIcon fontSize="small" />
      </button>

      <span className={styles.toolbar_divider}></span>

      <button
        type="button"
        className={editor.isActive('bulletList') ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FormatListBulletedIcon fontSize="small" />
      </button>

      <button
        type="button"
        className={editor.isActive('orderedList') ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <FormatListNumberedIcon fontSize="small" />
      </button>

      <span className={styles.toolbar_divider}></span>

      <button
        type="button"
        className={editor.isActive({ textAlign: 'left' }) ? styles.active : ''}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <FormatAlignLeftIcon fontSize="small" />
      </button>

      <button
        type="button"
        className={
          editor.isActive({ textAlign: 'center' }) ? styles.active : ''
        }
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <FormatAlignCenterIcon fontSize="small" />
      </button>

      <button
        type="button"
        className={editor.isActive({ textAlign: 'right' }) ? styles.active : ''}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <FormatAlignRightIcon fontSize="small" />
      </button>

      <span className={styles.toolbar_divider}></span>

      <button type="button" onClick={addImage}>
        <ImageIcon fontSize="small" />
      </button>

      <span className={styles.toolbar_divider}></span>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <UndoIcon fontSize="small" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <RedoIcon fontSize="small" />
      </button>
    </div>
  );
};

export default BoardTextEditor;
