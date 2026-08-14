import { formatUpdateTimestamp } from '../../utils/format';
import styles from './Header.module.css';

interface HeaderProps {
  updateDate?: string;
}

export function Header({ updateDate }: HeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <div className={styles.brandMark} aria-hidden="true">
          M
        </div>
        <div>
          <strong className={styles.brandName}>My Stocks</strong>
          <small className={styles.brandSub}>recoma님의 포트폴리오</small>
        </div>
      </div>
      <div className={styles.topActions}>
        <span className={styles.marketPill}>미국 시장 · USD</span>
        <div className={styles.timestamp}>
          {updateDate ? `${formatUpdateTimestamp(updateDate)} 업데이트` : '업데이트 정보 없음'}
        </div>
      </div>
    </header>
  );
}
