import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { PositionData } from '../../types/position';
import { formatCompactUSD, formatDateDots, formatUSD } from '../../utils/format';
import { CASH_COLOR, getTickerColor } from '../../utils/tickerColors';
import styles from './AllocationCard.module.css';

interface AllocationCardProps {
  data: PositionData;
}

export function AllocationCard({ data }: AllocationCardProps) {
  const { portfolio, stocks, updateDate } = data;

  const slices = [
    ...stocks.map((stock, index) => ({
      key: stock.ticker,
      name: stock.name,
      ticker: stock.ticker as string | undefined,
      value: stock.marketValueExcludingFees,
      color: getTickerColor(index),
    })),
    {
      key: 'CASH',
      name: '보유 현금',
      ticker: undefined as string | undefined,
      value: portfolio.cashBalance,
      color: CASH_COLOR,
    },
  ];

  const reserveBalance = portfolio.cashBalance + portfolio.sgovBalance;
  const reservePercent = (reserveBalance / portfolio.totalValue) * 100;

  return (
    <article className={`card ${styles.allocation}`}>
      <div className={styles.cardTitleRow}>
        <div>
          <h2>종목 비중</h2>
          <p className={styles.subcopy}>보유 현금 및 대기자금 포함</p>
        </div>
        <span className={styles.dateLabel}>{formatDateDots(updateDate)}</span>
      </div>
      <div className={styles.allocationBody}>
        <div
          className={styles.pieWrap}
          role="img"
          aria-label={slices
            .map(
              (s) =>
                `${s.name}${s.ticker ? ` [${s.ticker}]` : ''} ${((s.value / portfolio.totalValue) * 100).toFixed(1)}%`,
            )
            .join(', ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices.map((slice) => ({ ...slice, fill: slice.color.dot }))}
                dataKey="value"
                nameKey="name"
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke="var(--paper)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.pieCenter}>
            <strong>{formatCompactUSD(portfolio.totalValue)}</strong>
            <span>총 보유금액</span>
          </div>
        </div>
        <ul className={styles.legend}>
          {slices.map((slice) => (
            <li key={slice.key}>
              <span className={styles.legendName}>
                <i
                  className={styles.dot}
                  style={{ '--dot': slice.color.dot } as React.CSSProperties}
                />
                <b>{slice.name}</b>
                {slice.ticker && (
                  <span
                    className={styles.tickerTag}
                    style={
                      {
                        '--tag-bg': slice.color.badgeBg,
                        '--tag-color': slice.color.badgeColor,
                      } as React.CSSProperties
                    }
                  >
                    {slice.ticker}
                  </span>
                )}
              </span>
              <b>{((slice.value / portfolio.totalValue) * 100).toFixed(1)}%</b>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.cashSummary}>
        <span>
          대기자금 <small>(현금 + SGOV)</small>
        </span>
        <b>
          {formatUSD(reserveBalance)} · {reservePercent.toFixed(1)}%
        </b>
      </div>
    </article>
  );
}
