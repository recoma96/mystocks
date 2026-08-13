import { format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProfitHistoryData } from '../../types/profitHistory';
import { formatCompactUSD, formatPercent, formatSignedUSD, formatUSD } from '../../utils/format';
import { CASH_COLOR, getBenchmarkColor, INVESTMENT_COLOR, PORTFOLIO_LINE_COLOR, SGOV_COLOR } from '../../utils/tickerColors';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  data: ProfitHistoryData;
}

type Tab = 'asset' | 'return';

function formatTick(date: string) {
  return format(parseISO(date), 'M/d');
}

interface AssetTooltipPayloadItem {
  dataKey?: unknown;
  name?: React.ReactNode;
  value?: unknown;
  color?: string;
}

function AssetTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly AssetTooltipPayloadItem[];
  label?: unknown;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipDate}>{formatTick(String(label))}</div>
      <ul className={styles.tooltipList}>
        {payload.map((item) => (
          <li key={String(item.dataKey)}>
            <span>
              <i style={{ '--key': item.color } as React.CSSProperties} />
              {item.name}
            </span>
            <b>{formatUSD(Number(item.value ?? 0))}</b>
          </li>
        ))}
        <li className={styles.tooltipTotal}>
          <span>합계</span>
          <b>{formatUSD(total)}</b>
        </li>
      </ul>
    </div>
  );
}

function buildReturnSeries(data: ProfitHistoryData) {
  const benchmarkMaps = data.benchMarks.map((bm) => ({
    ticker: bm.ticker,
    map: new Map(bm.histories.map((h) => [h.date, h.profitRate])),
  }));

  return data.myPortfolio.histories.map((h) => {
    const point: Record<string, number | string> = {
      date: h.date,
      portfolio: h.profitRateExcludingFees,
    };
    benchmarkMaps.forEach(({ ticker, map }) => {
      const value = map.get(h.date);
      if (value !== undefined) {
        point[ticker] = value;
      }
    });
    return point;
  });
}

export function ChartCard({ data }: ChartCardProps) {
  const [tab, setTab] = useState<Tab>('asset');
  const { current, histories } = data.myPortfolio;
  const isGain = current.profitAmountExcludingFees >= 0;
  const dayCount = histories.length;
  const returnSeries = useMemo(() => buildReturnSeries(data), [data]);

  return (
    <section className={`card ${styles.chartCard}`} aria-label="포트폴리오 추이">
      <div className={styles.chartHead}>
        <div className={styles.tabs} role="tablist" aria-label="차트 보기">
          <button
            className={`${styles.tab} ${tab === 'asset' ? styles.active : ''}`}
            role="tab"
            aria-selected={tab === 'asset'}
            onClick={() => setTab('asset')}
          >
            보유 총 금액
          </button>
          <button
            className={`${styles.tab} ${tab === 'return' ? styles.active : ''}`}
            role="tab"
            aria-selected={tab === 'return'}
            onClick={() => setTab('return')}
          >
            수익률 비교
          </button>
        </div>
        <span className={styles.range}>최근 {dayCount} 영업일</span>
      </div>

      {tab === 'asset' ? (
        <>
          <div className={styles.chartInfo}>
            <strong>{formatUSD(current.totalValue)}</strong>
            <span>보유 현금 포함</span>
            <em className={isGain ? styles.gain : styles.loss}>
              {formatSignedUSD(current.profitAmountExcludingFees)} · {formatPercent(current.profitRateExcludingFees)}
            </em>
          </div>
          <div className={styles.chartStage}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={histories} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  interval="preserveStartEnd"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--line)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCompactUSD(v)}
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={(props) => <AssetTooltipContent {...props} />} />
                <Area type="monotone" dataKey="cash" name="보유 현금" stackId="assets" stroke={CASH_COLOR.dot} fill={CASH_COLOR.dot} fillOpacity={0.76} strokeWidth={1.3} />
                <Area type="monotone" dataKey="sgov" name="SGOV" stackId="assets" stroke={SGOV_COLOR.dot} fill={SGOV_COLOR.dot} fillOpacity={0.76} strokeWidth={1.3} />
                <Area type="monotone" dataKey="investments" name="투자금액" stackId="assets" stroke={INVESTMENT_COLOR} fill={INVESTMENT_COLOR} fillOpacity={0.76} strokeWidth={1.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartKey}>
            <span>
              <i style={{ '--key': CASH_COLOR.dot } as React.CSSProperties} />
              보유 현금
            </span>
            <span>
              <i style={{ '--key': SGOV_COLOR.dot } as React.CSSProperties} />
              SGOV
            </span>
            <span>
              <i style={{ '--key': INVESTMENT_COLOR } as React.CSSProperties} />
              투자금액
            </span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.chartInfo}>
            <strong className={styles.gain}>{formatPercent(current.profitRateExcludingFees)}</strong>
            <span>총 보유금액 기준 수익률</span>
            <em>최근 {dayCount} 영업일</em>
          </div>
          <div className={styles.chartStage}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={returnSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  interval="preserveStartEnd"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--line)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatPercent(v, 0)}
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <ReferenceLine y={0} stroke="#b5bac8" strokeDasharray="4 4" />
                <Tooltip
                  formatter={(value, name) => [formatPercent(Number(value)), String(name)]}
                  labelFormatter={(label) => formatTick(String(label))}
                />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="총 보유금액 기준 수익률"
                  stroke={PORTFOLIO_LINE_COLOR}
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {data.benchMarks.map((bm, index) => (
                  <Line
                    key={bm.ticker}
                    type="monotone"
                    dataKey={bm.ticker}
                    name={`${bm.name} [${bm.ticker}]`}
                    stroke={getBenchmarkColor(index)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartKey}>
            <span>
              <i style={{ '--key': PORTFOLIO_LINE_COLOR } as React.CSSProperties} />
              총 보유금액 기준 수익률
            </span>
            {data.benchMarks.map((bm, index) => (
              <span key={bm.ticker}>
                <i style={{ '--key': getBenchmarkColor(index) } as React.CSSProperties} />
                {bm.name} [{bm.ticker}]
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
