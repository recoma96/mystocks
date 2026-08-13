export interface PortfolioSummary {
  /** 총 평가금액 (보유현금 + 투자평가금(수수료 제외)) */
  totalValue: number;
  /** 보유현금을 포함하지 않은 투자원금 */
  positionsCostBasis: number;
  /** 수수료를 제외한 투자평가금 */
  positionsMarketValue: number;
  /** 순수 보유 현금 (SGOV 제외) */
  cashBalance: number;
  /** 보유 SGOV 평가금 (대기자금의 일부) */
  sgovBalance: number;
  /** 수수료를 제외한 투자손익금 */
  profitAmountExcludingFees: number;
}

export interface StockPosition {
  /** 티커명 */
  ticker: string;
  /** 종목명 */
  name: string;
  /** 수량 (몇 주를 샀는지) */
  quantity: number;
  /** 매수 금액 */
  costBasis: number;
  /** 수수료를 제외한 평가금 */
  marketValueExcludingFees: number;
  /** 매입 평단가 */
  avgPurchasePrice: number;
  /** 수수료를 제외한 투자 손익금 */
  profitAmountExcludingFees: number;
  /** 수수료를 제외한 손익률(%) */
  profitRateExcludingFees: number;
}

export interface PositionData {
  /** 마지막 데이터 갱신 시각, "YYYY-MM-DD HH:mm" */
  updateDate: string;
  portfolio: PortfolioSummary;
  stocks: StockPosition[];
}
