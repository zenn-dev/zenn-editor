import styles from './index.module.css';

export default () => {
  return (
    <div className={styles.loadingCard}>
      <div className={styles.point}></div>
      <div className={styles.point}></div>
      <div className={styles.point}></div>
    </div>
  );
};
