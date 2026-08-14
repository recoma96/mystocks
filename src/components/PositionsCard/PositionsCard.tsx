import type { PositionData } from '../../types/position';
import { formatPercent, formatSignedUSD, formatUSD } from '../../utils/format';
import { getTickerColor } from '../../utils/tickerColors';
import { getStockLink } from '../../utils/links';
import styles from './PositionsCard.module.css';

interface PositionsCardProps {
  data: PositionData;
}

export function PositionsCard({ data }: PositionsCardProps) {
  const { portfolio, stocks } = data;
  // SGOV는 대기자금으로 취급되어 종목 비중 카드에서 다루므로 보유 종목 목록에서는 제외한다.
  const displayStocks = stocks.filter((stock) => stock.ticker !== 'SGOV');

  return (
    <article className={`card ${styles.positions}`}>
      <div className={styles.cardTitleRow}>
        <div>
          <h2>내 포트폴리오</h2>
          <p className={styles.subcopy}>투자 종목의 현재 평가와 손익</p>
        </div>
        <div className={styles.portfolioTotal}>
          <span>총 평가금액</span>
          <strong>{formatUSD(portfolio.positionsMarketValue)}</strong>
        </div>
      </div>
      <div className={styles.positionList}>
        {displayStocks.map((stock, index) => {
          const color = getTickerColor(index);
          const isGain = stock.profitAmountExcludingFees >= 0;
          return (
            <div className={styles.positionRow} key={stock.ticker}>
              <div className={styles.asset}>
                <span
                  className={styles.tickerBadge}
                  style={
                    {
                      '--badge-bg': color.badgeBg,
                      '--badge-color': color.badgeColor,
                    } as React.CSSProperties
                  }
                >
                  {stock.ticker}
                </span>
                <span className={styles.assetName}>
                  <a
                    className={styles.nameLink}
                    href={getStockLink(stock.ticker)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {stock.name}
                  </a>
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.cellLabel}>보유 수량</span>
                <strong>{stock.quantity}주</strong>
              </div>
              <div className={styles.metric}>
                <span className={styles.cellLabel}>매입 후 평가 가격</span>
                <strong>{formatUSD(stock.marketValueExcludingFees)}</strong>
                <small>평균 매입 {formatUSD(stock.avgPurchasePrice)}</small>
              </div>
              <div className={styles.metric}>
                <span className={styles.cellLabel}>손익</span>
                <strong className={isGain ? styles.gain : styles.loss}>
                  {formatPercent(stock.profitRateExcludingFees)}
                </strong>
                <small className={isGain ? styles.gain : styles.loss}>
                  {formatSignedUSD(stock.profitAmountExcludingFees)}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
