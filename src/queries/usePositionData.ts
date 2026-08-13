import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '../api/client';
import { getPositionPath } from '../api/paths';
import type { PositionData } from '../types/position';

export function usePositionData() {
  return useQuery({
    queryKey: ['position'],
    queryFn: () => fetchJson<PositionData>(getPositionPath()),
    staleTime: 5 * 60 * 1000,
  });
}
