import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchJsonWithDateFallback } from '../api/fetchWithDateFallback';
import { getProfitHistoryPath } from '../api/paths';
import type { ProfitHistoryData } from '../types/profitHistory';
import { getLatestDataDate } from '../utils/dailyData';

export function useProfitHistoryData() {
  const dataDate = getLatestDataDate();
  const dateKey = format(dataDate, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['profitHistory', dateKey],
    queryFn: async () => {
      const { data } = await fetchJsonWithDateFallback<ProfitHistoryData>(dataDate, getProfitHistoryPath);
      return data;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 3,
  });
}
