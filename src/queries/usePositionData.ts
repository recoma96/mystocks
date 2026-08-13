import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchJson } from '../api/client';
import { getPositionPath } from '../api/paths';
import type { PositionData } from '../types/position';
import { getLatestDataDate } from '../utils/dailyData';

export function usePositionData() {
  const dataDate = getLatestDataDate();
  const dateKey = format(dataDate, 'yyyy-MM-dd');

  return useQuery({
    // 데이터가 유효한 날짜를 쿼리 키에 포함시켜, 같은 날짜의 데이터는 다시 불러오지 않고
    // 다음날 오전 5시가 지나 날짜 키가 바뀔 때만 자동으로 새로 fetch 하도록 한다.
    queryKey: ['position', dateKey],
    queryFn: () => fetchJson<PositionData>(getPositionPath(dataDate)),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 3,
  });
}
