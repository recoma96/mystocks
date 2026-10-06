# 목업 데이터 포맷

`VITE_DATA_BASE_URL`이 없으면 앱은 `public/mock-data`의 JSON 파일을 읽습니다. 이 문서는 각 파일의 위치와 필드, 값을 만들 때 지켜야 할 관계를 정리합니다. 타입 정의 원본은 `src/types/`에 있습니다.

```
public/mock-data/
├── position.json            # 보유 종목·포트폴리오 요약
├── profit-history.json      # 보유 총 금액 추이·수익률 비교
└── transactions/
    ├── 2026-07.json         # 월별 매수/매도 내역 (YYYY-MM.json)
    └── 2026-08.json
```

공통 규칙:

- 금액은 모두 USD 숫자입니다(예: `14842.60`).
- 수익률은 퍼센트 값입니다. `5.05`는 5.05%를 뜻합니다.
- 날짜와 시각은 문자열이며, 필드마다 정해진 형식을 따릅니다.

## position.json

보유 종목 비중, 내 포트폴리오, 상단 업데이트 시각에 쓰입니다. 타입은 `src/types/position.ts`의 `PositionData`입니다.

```json
{
  "updateDate": "2026-08-12 05:01",
  "portfolio": {
    "totalValue": 42838.92,
    "positionsCostBasis": 34980.00,
    "positionsMarketValue": 36104.70,
    "cashBalance": 6734.22,
    "sgovBalance": 2886.09,
    "profitAmountExcludingFees": 1124.70
  },
  "stocks": [
    {
      "ticker": "VOO",
      "name": "Vanguard S&P 500",
      "quantity": 20,
      "costBasis": 14129.00,
      "marketValueExcludingFees": 14842.60,
      "avgPurchasePrice": 706.45,
      "profitAmountExcludingFees": 713.60,
      "profitRateExcludingFees": 5.05
    },
    {
      "ticker": "SGOV",
      "name": "초단기 미국채 ETF",
      "quantity": 28.72,
      "costBasis": 2887.00,
      "marketValueExcludingFees": 2886.09,
      "avgPurchasePrice": 100.52,
      "profitAmountExcludingFees": -0.91,
      "profitRateExcludingFees": -0.03
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `updateDate` | string | 마지막 갱신 시각, `YYYY-MM-DD HH:mm` |
| `portfolio.totalValue` | number | 총 평가금액. `cashBalance + positionsMarketValue` |
| `portfolio.positionsCostBasis` | number | 투자원금. `stocks[].costBasis`의 합 (SGOV 포함) |
| `portfolio.positionsMarketValue` | number | 투자평가금(수수료 제외). `stocks[].marketValueExcludingFees`의 합 (SGOV 포함) |
| `portfolio.cashBalance` | number | 순수 보유 현금 (SGOV 제외) |
| `portfolio.sgovBalance` | number | SGOV 평가금. SGOV 종목의 `marketValueExcludingFees`와 같은 값 |
| `portfolio.profitAmountExcludingFees` | number | 투자손익금. `positionsMarketValue - positionsCostBasis` |
| `stocks[].ticker` | string | 티커 |
| `stocks[].name` | string | 종목명 (화면에 그대로 표시) |
| `stocks[].quantity` | number | 보유 수량. 소수 가능 (예: `28.72`) |
| `stocks[].costBasis` | number | 매수 금액 |
| `stocks[].marketValueExcludingFees` | number | 평가금(수수료 제외) |
| `stocks[].avgPurchasePrice` | number | 매입 평단가 |
| `stocks[].profitAmountExcludingFees` | number | 손익금(수수료 제외) |
| `stocks[].profitRateExcludingFees` | number | 손익률(%) |

주의할 점:

- **SGOV는 대기자금으로 취급합니다.** 티커가 `SGOV`인 종목은 내 포트폴리오 목록에서 빠지고, 종목 비중에서는 보유 현금과 함께 대기자금으로 묶입니다. 그래서 `sgovBalance`를 SGOV 종목의 평가금과 맞춰야 합니다. SGOV가 없으면 `stocks`에서 빼고 `sgovBalance`를 `0`으로 둡니다.
- **합계 필드는 직접 계산해서 넣어야 합니다.** 앱은 `portfolio`의 합계 값을 다시 계산하지 않고 그대로 표시합니다. 위 표의 관계가 어긋나면 카드마다 금액이 다르게 보입니다.
- 종목 색상은 `stocks` 순서대로 정해지고, 종목 비중 도넛은 평가금이 큰 순서로 표시됩니다.

## profit-history.json

보유 총 금액 그래프와 수익률 비교 그래프에 쓰입니다. 타입은 `src/types/profitHistory.ts`의 `ProfitHistoryData`입니다.

```json
{
  "myPortfolio": {
    "current": {
      "totalValue": 42838.92,
      "profitAmountExcludingFees": 1228.31,
      "profitRateExcludingFees": 2.95
    }
  },
  "histories": [
    { "date": "2026-07-27", "cash": 9050, "sgov": 3970, "investments": 28600, "profitRateExcludingFees": 0 },
    { "date": "2026-07-28", "cash": 9050, "sgov": 3974, "investments": 28850, "profitRateExcludingFees": 0.35 }
  ],
  "benchMarks": [
    {
      "ticker": "VOO",
      "name": "S&P 500",
      "histories": [
        { "date": "2026-07-27", "price": 700.00, "profitRate": 0 },
        { "date": "2026-07-28", "price": 703.08, "profitRate": 0.44 }
      ]
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `myPortfolio.current.totalValue` | number | 그래프 상단에 표시하는 현재 총 평가금액 |
| `myPortfolio.current.profitAmountExcludingFees` | number | 현재 투자손익금(수수료 제외). 0 이상이면 손익과 수익률을 빨간색, 음수면 파란색으로 표시 |
| `myPortfolio.current.profitRateExcludingFees` | number | 현재 수익률(%) |
| `histories[].date` | string | 기록 날짜, `YYYY-MM-DD` |
| `histories[].cash` | number | 보유 현금 |
| `histories[].sgov` | number | SGOV 평가금 |
| `histories[].investments` | number | 투자평가금(수수료 제외) |
| `histories[].profitRateExcludingFees` | number | 첫날 대비 누적 수익률(%). 수익률 비교 그래프의 내 수익률 선 |
| `benchMarks[].ticker` | string | 비교 대상 티커 |
| `benchMarks[].name` | string | 비교 대상 이름. 범례에 `이름 [티커]`로 표시 |
| `benchMarks[].histories[].date` | string | 날짜, `YYYY-MM-DD` |
| `benchMarks[].histories[].price` | number | 종가 |
| `benchMarks[].histories[].profitRate` | number | 첫날 대비 수익률(%) |

주의할 점:

- `histories`는 날짜 오름차순으로, 영업일(주말·휴장일 제외)만 넣습니다. "최근 N 영업일" 표시는 `histories` 개수입니다.
- 보유 총 금액 그래프는 `cash`, `sgov`, `investments`를 쌓아서 그립니다.
- 수익률 비교 그래프의 x축은 `histories`의 날짜를 기준으로 합니다. 벤치마크는 같은 날짜의 값만 이어 그리므로, 벤치마크 날짜도 `histories`와 맞춥니다.
- 첫날의 `profitRateExcludingFees`와 벤치마크 `profitRate`는 `0`으로 두는 것이 자연스럽습니다(누적 수익률의 기준점).
- `myPortfolio.current`는 보통 `histories`의 마지막 날 값과 맞춥니다. `current.totalValue`는 마지막 날 `cash + sgov + investments`와 같게 둡니다.

## transactions/YYYY-MM.json

매수/매도 캘린더에 쓰입니다. 한 달에 파일 하나이며, 파일 이름이 `2026-08.json`이면 2026년 8월 내역입니다. 타입은 `src/types/transactionHistory.ts`의 `TransactionHistoryData`입니다.

```json
{
  "date": "2026-08",
  "histories": [
    {
      "type": "buy",
      "ticker": "VOO",
      "quantity": 1,
      "amount": 741.13,
      "profitRate": null,
      "profitAmount": null,
      "filledAt": "2026-08-06 14:22:51"
    },
    {
      "type": "sell",
      "ticker": "AAPL",
      "quantity": 16,
      "amount": 3284.60,
      "profitRate": 14.60,
      "profitAmount": 418.60,
      "filledAt": "2026-08-11 10:02:14"
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `date` | string | 연-월, `YYYY-MM`. 파일 이름과 같게 둡니다 |
| `histories[].type` | `"buy"` \| `"sell"` | 매수 또는 매도 |
| `histories[].ticker` | string | 티커 |
| `histories[].quantity` | number | 수량. 소수 가능 (예: `0.2`) |
| `histories[].amount` | number | 체결 금액(매수 금액 또는 매도 금액) |
| `histories[].profitRate` | number \| null | 매도 수익률(%), 수수료 제외. 매수는 `null` |
| `histories[].profitAmount` | number \| null | 매도 수익금, 수수료 제외. 매수는 `null` |
| `histories[].filledAt` | string | 체결 시각, `YYYY-MM-DD HH:mm:ss` |

주의할 점:

- **캘린더의 날짜는 `filledAt`에서 가져옵니다.** 그래서 `filledAt`은 반드시 `YYYY-MM-DD HH:mm:ss` 형식이어야 하고, 파일과 같은 달이어야 합니다. 데이터 갱신 기준(오전 5시)은 적용되지 않으므로, `2026-08-07 04:10:00`에 체결된 거래는 8월 7일 칸에 표시됩니다.
- 같은 날의 거래는 `filledAt` 순서로 정렬되므로, 파일 안의 순서는 상관없습니다.
- 매도 수익률과 수익금은 `profitRate`와 `profitAmount`가 둘 다 숫자일 때만 표시됩니다. 매도라도 두 필드를 빼거나 `null`로 둘 수 있습니다.
- 거래가 없는 달은 `"histories": []`로 둡니다.
- **조회할 달의 파일이 반드시 있어야 합니다.** 개발 서버는 없는 파일을 요청하면 404 대신 `index.html`을 돌려주기 때문에, 파일이 없으면 캘린더에 "거래 내역을 불러오지 못했습니다" 오류가 표시됩니다.
