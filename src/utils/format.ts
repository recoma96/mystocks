export function formatUSD(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCompactUSD(value: number): string {
  if (Math.abs(value) >= 1000) {
    const compact = (value / 1000).toFixed(1).replace(/\.0$/, '');
    return `$${compact}K`;
  }
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

export function formatSignedUSD(value: number): string {
  const sign = value >= 0 ? '+' : '−';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number, digits = 2): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function formatUpdateTimestamp(updateDate: string): string {
  return updateDate.replace(' ', ' · ');
}

export function formatDateDots(updateDate: string): string {
  const [datePart] = updateDate.split(' ');
  return datePart.replaceAll('-', '. ') + '.';
}
