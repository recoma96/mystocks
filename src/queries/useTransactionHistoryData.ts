import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchJson } from '../api/client';
import { getTransactionHistoryPath } from '../api/paths';
import type { TransactionHistoryData } from '../types/transactionHistory';
import { getLatestDataDate } from '../utils/dailyData';

/**
 * 지나간 달의 매수/매도 내역은 다시 바뀌지 않으므로 영구 캐싱(월 단위 쿼리 키)하고,
 * 조회 중인 달이 "현재 유효한 달"과 같을 때만 오늘 날짜를 키에 포함시켜
 * 다음날 오전 5시가 지나면 자동으로 새로 fetch 하도록 한다.
 */
export function useTransactionHistoryData(year: number, month: number) {
  const latestDataDate = getLatestDataDate();
  const isCurrentMonth = latestDataDate.getFullYear() === year && latestDataDate.getMonth() + 1 === month;
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
  const dateKey = format(latestDataDate, 'yyyy-MM-dd');

  return useQuery({
    queryKey: isCurrentMonth
      ? ['transactionHistory', yearMonth, dateKey]
      : ['transactionHistory', yearMonth],
    queryFn: () => fetchJson<TransactionHistoryData>(getTransactionHistoryPath(year, month)),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 3,
  });
}
