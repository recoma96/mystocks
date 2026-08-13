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
