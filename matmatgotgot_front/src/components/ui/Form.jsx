import styles from './Form.module.css';

const Input = (props) => {
  const safeValue = props.value ?? "";
  return <input
      className={styles.input}
      {...props}
      value={safeValue}
  />;
};

const TextArea = (props) => {
  const safeValue = props.value ?? "";
  return <textarea
      className={styles.textarea}
      {...props}
      value={safeValue}
  />;
};

export { Input, TextArea };
