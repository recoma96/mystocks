import { format, getDay, getDaysInMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactionHistoryData } from '../../queries/useTransactionHistoryData';
import type { TransactionEntry } from '../../types/transactionHistory';
import { formatPercent, formatSignedUSD, formatUSD } from '../../utils/format';
import { getLatestDataDate } from '../../utils/dailyData';
import styles from './ActivityCard.module.css';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDayOfMonth(filledAt: string): number {
  return Number(filledAt.slice(8, 10));
}

export function ActivityCard() {
  const today = getLatestDataDate();
  const [viewedYear, setViewedYear] = useState(today.getFullYear());
  const [viewedMonth, setViewedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const { data, isLoading, isError, error } = useTransactionHistoryData(viewedYear, viewedMonth);

  const isViewingCurrentMonth = viewedYear === today.getFullYear() && viewedMonth === today.getMonth() + 1;

  const byDay = useMemo(() => {
    const map = new Map<number, TransactionEntry[]>();
    (data?.histories ?? []).forEach((entry) => {
      const day = getDayOfMonth(entry.filledAt);
      const list = map.get(day) ?? [];
      list.push(entry);
      map.set(day, list);
    });
    // 같은 날 여러 건이 있을 때(매수+매도 혼합 포함) 체결 시각 순으로 정렬
    map.forEach((list) => list.sort((a, b) => a.filledAt.localeCompare(b.filledAt)));
    return map;
  }, [data]);

  function changeMonth(delta: number) {
    const next = new Date(viewedYear, viewedMonth - 1 + delta, 1);
    setViewedYear(next.getFullYear());
    setViewedMonth(next.getMonth() + 1);
    setSelectedDay(1);
  }

  const canGoNext =
    viewedYear < today.getFullYear() || (viewedYear === today.getFullYear() && viewedMonth < today.getMonth() + 1);

  const firstWeekday = getDay(new Date(viewedYear, viewedMonth - 1, 1));
  const daysInMonth = getDaysInMonth(new Date(viewedYear, viewedMonth - 1, 1));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedDate = new Date(viewedYear, viewedMonth - 1, selectedDay);
  const selectedTrades = byDay.get(selectedDay) ?? [];

  return (
    <section className={`card ${styles.activity}`} aria-label="매수 매도 캘린더">
      <div className={styles.calendarPane}>
        <div className={styles.monthNav}>
          <div>
            <h2>
              {viewedYear}년 {viewedMonth}월
            </h2>
            <p className={styles.subcopy}>거래일을 선택해 상세 내역을 확인하세요</p>
          </div>
          <div className={styles.buttons}>
            <button className={styles.iconButton} aria-label="이전 달" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button
              className={styles.iconButton}
              aria-label="다음 달"
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className={styles.week} aria-hidden="true">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className={styles.dates}>
          {Array.from({ length: firstWeekday }, (_, i) => (
            <div className={`${styles.date} ${styles.blank}`} aria-hidden="true" key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const trades = byDay.get(day) ?? [];
            const buys = trades.filter((t) => t.type === 'buy').length;
            const sells = trades.filter((t) => t.type === 'sell').length;
            const isToday = isViewingCurrentMonth && day === today.getDate();
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                className={`${styles.date} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                aria-label={`${viewedMonth}월 ${day}일${buys ? ` 매수 ${buys}회` : ''}${sells ? ` 매도 ${sells}회` : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className={styles.dateNumber}>{day}</span>
                {(buys > 0 || sells > 0) && (
                  <span className={styles.tradeCounts}>
                    {buys > 0 && <span className={`${styles.tradeCount} ${styles.buy}`}>매수 {buys}회</span>}
                    {sells > 0 && <span className={`${styles.tradeCount} ${styles.sell}`}>매도 {sells}회</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.tradePane}>
        <h2>매수/매도 내역</h2>
        <p className={styles.tradeDate}>{format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</p>

        {isLoading && <p className={styles.emptyDay}>거래 내역을 불러오는 중입니다…</p>}
        {isError && (
          <p className={styles.emptyDay}>
            거래 내역을 불러오지 못했습니다: {error instanceof Error ? error.message : '알 수 없는 오류'}
          </p>
        )}

        {!isLoading && !isError && selectedTrades.length === 0 && (
          <p className={styles.emptyDay}>이 날에는 매수/매도 내역이 없습니다.</p>
        )}

        {!isLoading && !isError && selectedTrades.length > 0 && (
          <ul className={styles.tradeList}>
            {selectedTrades.map((trade, index) => {
              const isGain = (trade.profitAmount ?? 0) >= 0;
              return (
                <li className={styles.tradeItem} key={`${trade.ticker}-${trade.filledAt}-${index}`}>
                  <div>
                    <b>
                      {trade.ticker} {formatUSD(trade.amount)} {trade.type === 'buy' ? '매수' : '매도'}
                    </b>
                    <p>{trade.quantity}주</p>
                  </div>
                  {trade.type === 'sell' && trade.profitRate !== null && trade.profitAmount !== null && (
                    <div className={styles.tradeRight}>
                      <span>매도</span>
                      <strong className={isGain ? styles.gain : styles.loss}>
                        {formatPercent(trade.profitRate)}
                      </strong>
                      <small className={isGain ? styles.gain : styles.loss}>
                        {formatSignedUSD(trade.profitAmount)}
                      </small>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className={styles.bottomNote}>모든 거래 및 평가는 USD 기준입니다.</p>
      </div>
    </section>
  );
}
