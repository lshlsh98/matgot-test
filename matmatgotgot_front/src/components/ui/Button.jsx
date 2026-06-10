import styles from './Button.module.css';

const Button = ({ children, className = '', ...props }) => {
  const classList = className.split(' ');
  const classStyles = classList.map((cls) => styles[cls] || cls);

  return (
    <button className={classStyles.join(' ')} {...props}>
      {children}
    </button>
  );
};

export default Button;
