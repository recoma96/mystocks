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

export function getTickerColor(index: number): TickerColor {
  return PALETTE[index % PALETTE.length];
}
