export interface TickerColor {
  dot: string;
  badgeBg: string;
  badgeColor: string;
}

const PALETTE: TickerColor[] = [
  { dot: '#e84b5f', badgeBg: '#fff0f2', badgeColor: '#d84155' },
  { dot: '#5978d7', badgeBg: '#eef3ff', badgeColor: '#4168cb' },
  { dot: '#f2ad3d', badgeBg: '#fff7e9', badgeColor: '#c98b22' },
  { dot: '#8a63de', badgeBg: '#f4efff', badgeColor: '#7755c6' },
  { dot: '#20a76c', badgeBg: '#eafbf3', badgeColor: '#1c8a5b' },
];

export const CASH_COLOR: TickerColor = {
  dot: '#9ba2b8',
  badgeBg: '#f2f3f7',
  badgeColor: '#6b7186',
};

export const SGOV_COLOR: TickerColor = {
  dot: '#20a76c',
  badgeBg: '#eafbf3',
  badgeColor: '#1c8a5b',
};

/** 대기자금(현금) 계열과 같은 톤이되 조금 더 진한 회색 — 종목 비중 카드에서 SGOV를 현금과 같은 그룹으로 표현할 때 사용 */
export const SGOV_RESERVE_COLOR: TickerColor = {
  dot: '#6b7186',
  badgeBg: '#eceef2',
  badgeColor: '#3f4557',
};

export function getTickerColor(index: number): TickerColor {
  return PALETTE[index % PALETTE.length];
}

export const INVESTMENT_COLOR = '#e84b5f';
export const PORTFOLIO_LINE_COLOR = '#20a76c';

const BENCHMARK_LINE_PALETTE = ['#e84b5f', '#3779df', '#8a63de', '#f2ad3d', '#20a76c'];

export function getBenchmarkColor(index: number): string {
  return BENCHMARK_LINE_PALETTE[index % BENCHMARK_LINE_PALETTE.length];
}
