import { subDays } from 'date-fns';
import { fetchJson, HttpError } from './client';

export const MAX_DATE_FALLBACK_ATTEMPTS = 15;

export class NoDataFoundError extends Error {
  constructor(attempts: number) {
    super(`최근 ${attempts}일 동안 데이터를 찾지 못했습니다.`);
    this.name = 'NoDataFoundError';
  }
}

/**
 * 휴장일 등으로 특정 날짜의 파일이 없을 수 있으므로(404), 하루씩 거슬러 올라가며 데이터를 찾는다.
 * 최대 maxAttempts일 시도하고 모두 실패하면 NoDataFoundError를 던진다.
 * 404가 아닌 에러(네트워크 오류 등)는 재시도하지 않고 즉시 그대로 던진다.
 */
export async function fetchJsonWithDateFallback<T>(
  startDate: Date,
  pathBuilder: (date: Date) => string,
  maxAttempts: number = MAX_DATE_FALLBACK_ATTEMPTS,
): Promise<{ data: T; date: Date }> {
  let date = startDate;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fetchJson<T>(pathBuilder(date));
      return { data, date };
    } catch (error) {
      const isNotFound = error instanceof HttpError && error.status === 404;
      if (!isNotFound) {
        throw error;
      }
      if (attempt === maxAttempts) {
        throw new NoDataFoundError(maxAttempts);
      }
      date = subDays(date, 1);
    }
  }

  throw new NoDataFoundError(maxAttempts);
}
