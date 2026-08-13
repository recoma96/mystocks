import { format } from 'date-fns';
import { getLatestDataDate } from '../utils/dailyData';

const IS_MOCK_DATA_SOURCE = !import.meta.env.VITE_DATA_BASE_URL;

/**
 * position 데이터는 매일 한 번(오전 5시) 갱신되어 S3에 날짜별 파일로 쌓인다.
 * 목업(로컬 /mock-data)일 때만 고정 파일명을 쓰고, 실제 CDN에서는 날짜별 경로를 사용한다.
 */
export function getPositionPath(date: Date = getLatestDataDate()): string {
  if (IS_MOCK_DATA_SOURCE) {
    return '/position.json';
  }
  return `/positions/${format(date, 'yyyy-MM-dd')}.json`;
}

/**
 * 보유 총 금액/수익률 비교 추이 데이터도 position과 동일하게 매일 한 번(오전 5시) 갱신된다.
 */
export function getProfitHistoryPath(date: Date = getLatestDataDate()): string {
  if (IS_MOCK_DATA_SOURCE) {
    return '/profit-history.json';
  }
  return `/histories/${format(date, 'yyyy-MM-dd')}.json`;
}

/**
 * 매수/매도 내역은 년-월 단위 파일로 나뉜다 (예: 2026년 8월 -> /transactions/2026-08.json).
 * 목업 모드에서도 월 이동 캐싱을 확인할 수 있도록 동일하게 월별 파일을 둔다.
 */
export function getTransactionHistoryPath(year: number, month: number): string {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
  return `/transactions/${yearMonth}.json`;
}
