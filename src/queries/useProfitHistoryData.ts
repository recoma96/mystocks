import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchJson } from '../api/client';
import { getProfitHistoryPath } from '../api/paths';
import type { ProfitHistoryData } from '../types/profitHistory';
import { getLatestDataDate } from '../utils/dailyData';

export function useProfitHistoryData() {
  const dataDate = getLatestDataDate();
  const dateKey = format(dataDate, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['profitHistory', dateKey],
    queryFn: () => fetchJson<ProfitHistoryData>(getProfitHistoryPath(dataDate)),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 3,
  });
}
