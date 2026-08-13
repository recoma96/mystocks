export type TransactionType = 'buy' | 'sell';

export interface TransactionEntry {
  /** buy or sell */
  type: TransactionType;
  /** 티커명 */
  ticker: string;
  /** 수량 (20주, 0.2주 등) */
  quantity: number;
  /** 판매/구매금액 */
  amount: number;
  /** 수수료를 제외한 수익비율, buy시 null */
  profitRate: number | null;
  /** 수수료를 제외한 수익금, buy시 null */
  profitAmount: number | null;
  /** 최종 체결 시각 "YYYY-MM-DD HH:mm:ss" */
  filledAt: string;
}

export interface TransactionHistoryData {
  /** 년-월 "YYYY-MM" */
  date: string;
  histories: TransactionEntry[];
}
