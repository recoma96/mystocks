export interface PortfolioCurrentStats {
  /** 총 평가금액 (보유현금 + SGOV평가금 + 투자평가금(수수료 제외)) */
  totalValue: number;
  /** 수수료를 제외한 투자손익금 */
  profitAmountExcludingFees: number;
  /** 수수료를 제외한 투자이익률 */
  profitRateExcludingFees: number;
}

export interface PortfolioHistoryEntry {
  /** 기록 날짜 (YYYY-MM-DD) */
  date: string;
  /** 보유 현금 */
  cash: number;
  /** SGOV 보유 달러 */
  sgov: number;
  /** 현재 투자평가금 (수수료를 제외한 투자평가금) */
  investments: number;
  /** 투자금+현금에 대한 전체 이익률 (수익률 비교에서 사용) */
  profitRateExcludingFees: number;
}

export interface BenchmarkHistoryEntry {
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 종가 */
  price: number;
  /** 이익률 */
  profitRate: number;
}

export interface Benchmark {
  /** 티커명 */
  ticker: string;
  /** 이름 */
  name: string;
  histories: BenchmarkHistoryEntry[];
}

export interface ProfitHistoryData {
  myPortfolio: {
    current: PortfolioCurrentStats;
  };
  histories: PortfolioHistoryEntry[];
  /** 비교군 */
  benchMarks: Benchmark[];
}
