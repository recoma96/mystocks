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
  type XAxisTickContentProps,
} from 'recharts';
import type { ProfitHistoryData } from '../../types/profitHistory';
import { formatCompactUSD, formatPercent, formatSignedUSD, formatUSD } from '../../utils/format';
import { CASH_COLOR, getBenchmarkColor, INVESTMENT_COLOR, PORTFOLIO_LINE_COLOR, SGOV_COLOR } from '../../utils/tickerColors';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  data: ProfitHistoryData;
}

type Tab = 'asset' | 'return';
type Period = 'daily' | 'monthly';

function formatTick(date: string) {
  return format(parseISO(date), 'M/d');
}

function formatMonthTick(date: string) {
  return format(parseISO(date), 'M월');
}

function formatTooltipDate(date: string) {
  return format(parseISO(date), 'yyyy/M/d');
}

/** 월별 그래프에서 시작점(첫 기록일)을 추가하는 기준일. 이보다 늦게 시작한 달은 시작점 없이 말일부터 표기한다. */
const MONTHLY_START_MAX_DAY = 20;

/**
 * 날짜순으로 정렬된 일별 데이터에서 각 월의 마지막 기록일만 남긴다.
 * 말일이 휴장일이면 그 달의 마지막 영업일이, 진행 중인 이번 달은 가장 최근 날짜가 선택된다.
 * 첫 기록일이 MONTHLY_START_MAX_DAY 이하이면 그 날짜를 시작점으로 맨 앞에 추가한다.
 */
function pickMonthlyEntries<T extends { date: string }>(entries: T[]): T[] {
  const byMonth = new Map<string, T>();
  entries.forEach((entry) => byMonth.set(entry.date.slice(0, 7), entry));
  const monthly = [...byMonth.values()];

  const first = entries[0];
  if (first && first !== monthly[0] && parseISO(first.date).getDate() <= MONTHLY_START_MAX_DAY) {
    return [first, ...monthly];
  }
  return monthly;
}

/**
 * x축 날짜 후보 중 연도를 함께 표기할 날짜를 고른다.
 * 맨 첫 날짜와, 바로 앞 후보와 연도가 달라지는 날짜(새해의 첫 표기 — 월별에서는 1월)가 대상이다.
 */
function getYearLabelDates(tickDates: string[]): Set<string> {
  return new Set(tickDates.filter((date, i) => i === 0 || date.slice(0, 4) !== tickDates[i - 1].slice(0, 4)));
}

interface DateTickProps {
  x: number | string;
  y: number | string;
  date: string;
  formatLabel: (date: string) => string;
  yearLabelDates: Set<string>;
}

/** x축 날짜 표기. 연도 표기 대상이면 날짜 아래 줄에 "YYYY년"을 함께 그린다. */
function DateTick({ x, y, date, formatLabel, yearLabelDates }: DateTickProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" dy="0.71em" fill="var(--muted)" fontSize={11}>
        {formatLabel(date)}
      </text>
      {yearLabelDates.has(date) && (
        <text textAnchor="middle" y={14} dy="0.71em" fill="var(--muted)" fontSize={10} fontWeight={700}>
          {date.slice(0, 4)}년
        </text>
      )}
    </g>
  );
}

/** 월별 데이터의 첫 두 점이 같은 달이면 첫 점은 pickMonthlyEntries가 추가한 시작점이다. */
function getMonthlyStartDate(entries: { date: string }[]): string | undefined {
  const [first, second] = entries;
  return first && second && first.date.slice(0, 7) === second.date.slice(0, 7) ? first.date : undefined;
}

const DENSE_DAY_THRESHOLD = 30;
const DENSE_TICK_COUNT = 10;

/**
 * 영업일이 많으면 날짜 라벨이 다닥다닥 붙으므로, 첫 날짜와 마지막 날짜를 포함해
 * 일정 간격으로 고른 10개 날짜만 x축에 표기한다. (그래프 데이터는 그대로 유지)
 * 영업일이 적으면 undefined를 반환해 기존처럼 모든 날짜를 표기한다.
 */
function getXAxisTicks(dates: string[]): string[] | undefined {
  if (dates.length < DENSE_DAY_THRESHOLD) {
    return undefined;
  }
  const lastIndex = dates.length - 1;
  return Array.from(
    { length: DENSE_TICK_COUNT },
    (_, i) => dates[Math.round((i * lastIndex) / (DENSE_TICK_COUNT - 1))],
  );
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
  formatLabel,
}: {
  active?: boolean;
  payload?: readonly AssetTooltipPayloadItem[];
  label?: unknown;
  formatLabel: (date: string) => string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipDate}>{formatLabel(String(label))}</div>
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

type ReturnPoint = { date: string } & Record<string, number | string>;

function buildReturnSeries(data: ProfitHistoryData): ReturnPoint[] {
  const benchmarkMaps = data.benchMarks.map((bm) => ({
    ticker: bm.ticker,
    map: new Map(bm.histories.map((h) => [h.date, h.profitRate])),
  }));

  return data.histories.map((h) => {
    const point: ReturnPoint = {
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
  const [period, setPeriod] = useState<Period>('daily');
  const { current } = data.myPortfolio;
  const isGain = current.profitAmountExcludingFees >= 0;
  const isMonthly = period === 'monthly';

  const dailyReturnSeries = useMemo(() => buildReturnSeries(data), [data]);
  const histories = useMemo(
    () => (isMonthly ? pickMonthlyEntries(data.histories) : data.histories),
    [data.histories, isMonthly],
  );
  const returnSeries = useMemo(
    () => (isMonthly ? pickMonthlyEntries(dailyReturnSeries) : dailyReturnSeries),
    [dailyReturnSeries, isMonthly],
  );
  // 월별은 개수가 적어 모든 월을 표기하고, 일별만 영업일이 많을 때 날짜 표기를 간추린다.
  const xAxisTicks = useMemo(
    () => (isMonthly ? undefined : getXAxisTicks(histories.map((h) => h.date))),
    [histories, isMonthly],
  );
  const monthlyStartDate = isMonthly ? getMonthlyStartDate(histories) : undefined;
  const monthCount = new Set(histories.map((h) => h.date.slice(0, 7))).size;
  const rangeLabel = isMonthly ? `최근 ${monthCount}개월` : `최근 ${histories.length} 영업일`;

  // 월별에서도 시작점은 "x월"이 아니라 실제 날짜로 표기해 바로 옆 월 표기와 겹치지 않게 한다.
  const xAxisTickFormatter = (date: string) =>
    isMonthly && date !== monthlyStartDate ? formatMonthTick(date) : formatTick(date);
  const formatTooltipLabel = (date: string) =>
    isMonthly && date !== monthlyStartDate
      ? `${formatMonthTick(date)} (${formatTooltipDate(date)} 기준)`
      : formatTooltipDate(date);

  // 직접 고른 날짜(xAxisTicks)는 모두 표기하고, 그 외에는 겹치는 표기를 recharts가 건너뛰게 한다.
  const xAxisInterval = xAxisTicks ? 0 : 'preserveStartEnd';
  const yearLabelDates = useMemo(
    () => getYearLabelDates(xAxisTicks ?? histories.map((h) => h.date)),
    [xAxisTicks, histories],
  );
  const renderXAxisTick = ({ x, y, payload }: XAxisTickContentProps) => (
    <DateTick
      x={x}
      y={y}
      date={String(payload.value)}
      formatLabel={xAxisTickFormatter}
      yearLabelDates={yearLabelDates}
    />
  );

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
        <div className={styles.headRight}>
          <span className={styles.range}>{rangeLabel}</span>
          <div className={styles.periodToggle} role="group" aria-label="기간 단위">
            <button
              type="button"
              className={`${styles.periodButton} ${!isMonthly ? styles.periodActive : ''}`}
              aria-pressed={!isMonthly}
              onClick={() => setPeriod('daily')}
            >
              일별
            </button>
            <button
              type="button"
              className={`${styles.periodButton} ${isMonthly ? styles.periodActive : ''}`}
              aria-pressed={isMonthly}
              onClick={() => setPeriod('monthly')}
            >
              월별
            </button>
          </div>
        </div>
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
              <AreaChart data={histories} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  ticks={xAxisTicks}
                  tickFormatter={xAxisTickFormatter}
                  interval={xAxisInterval}
                  tick={renderXAxisTick}
                  fontSize={11}
                  height={44}
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
                <Tooltip content={(props) => <AssetTooltipContent {...props} formatLabel={formatTooltipLabel} />} />
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
            <strong className={isGain ? styles.gain : styles.loss}>{formatPercent(current.profitRateExcludingFees)}</strong>
            <span>총 보유금액 기준 수익률</span>
            <em>{rangeLabel}</em>
          </div>
          <div className={styles.chartStage}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={returnSeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  ticks={xAxisTicks}
                  tickFormatter={xAxisTickFormatter}
                  interval={xAxisInterval}
                  tick={renderXAxisTick}
                  fontSize={11}
                  height={44}
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
                  labelFormatter={(label) => formatTooltipLabel(String(label))}
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
