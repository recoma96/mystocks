# My Stocks

내 주식 포트폴리오를 모니터링하고 분석하기 위한 웹 애플리케이션입니다. 보유 종목 비중, 평가손익, 자산 추이, 매매 내역 등을 대시보드 형태로 보여줍니다.

## 기술 스택

- React 19 + TypeScript + Vite
- [TanStack Query](https://tanstack.com/query) — 데이터 fetching 및 캐싱 (localStorage 영속화 포함)
- [Recharts](https://recharts.org/) — 차트
- [date-fns](https://date-fns.org/) — 날짜 처리
- CSS Modules — 스타일링

## 데이터 소스

포트폴리오 데이터는 매일 오전 5시에 갱신되어 S3/CloudFront에 날짜별 JSON 파일(`/positions/{yyyy}-{MM}-{dd}.json`)로 저장됩니다.

- `VITE_DATA_BASE_URL` 환경변수가 없으면 `public/mock-data`의 목업 데이터를 사용합니다.
- 실제 CDN을 연동하려면 `.env.example`을 참고해 `.env` 파일에 `VITE_DATA_BASE_URL`을 설정하세요.

## 기술적 의사결정

### 캐싱 전략

CloudFront로 S3 파일을 읽어 오는 횟수를 줄이기 위해, 별도의 캐시 정책을 설계했습니다. 자세한 내용은 [API 응답 캐싱 전략](docs/caching.md)을 참고하세요.

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

개발 서버가 실행되면 `http://localhost:5173`에서 확인할 수 있습니다.

## 목업 데이터로 테스트하기

실제 데이터(CloudFront/S3) 없이 `public/mock-data`의 JSON 파일만으로 화면을 확인할 수 있습니다.

1. `.env`에서 `VITE_DATA_BASE_URL`을 비우거나 주석 처리합니다. `.env` 파일이 없어도 목업 데이터를 사용합니다.
2. `public/mock-data`에 아래 파일을 준비합니다. 각 파일의 필드와 작성 규칙은 [목업 데이터 포맷](docs/mock-data.md)을 참고하세요.

   ```
   public/mock-data/
   ├── position.json            # 보유 종목·포트폴리오 요약
   ├── profit-history.json      # 보유 총 금액 추이·수익률 비교
   └── transactions/
       └── YYYY-MM.json         # 월별 매수/매도 내역 (예: 2026-08.json)
   ```

3. `npm run dev`로 개발 서버를 실행합니다.

테스트할 때 알아 둘 점:

- **매수/매도 캘린더는 현재 날짜의 달에서 시작합니다.** 처음 선택되는 날짜는 데이터 갱신 시각(오전 5시)을 기준으로 정해지므로, 오전 5시 이전에 접속하면 전날이 선택됩니다. 거래가 표시되는 날짜는 이와 상관없이 `filledAt`의 날짜를 그대로 따르므로, 오전 4시에 체결된 거래도 체결된 당일에 표시됩니다. 미래의 달로는 이동할 수 없으므로, 이번 달과 확인하려는 지난 달의 `transactions/YYYY-MM.json`을 만들어 두세요. 파일이 없는 달을 열면 오류가 표시되고, 거래가 없는 달은 `"histories": []`로 두면 됩니다.
- **`position.json`과 `profit-history.json`은 파일 이름이 고정입니다.** 프로덕션에서는 날짜별 파일을 읽지만 목업에서는 항상 같은 파일을 읽으므로, 현재 날짜와 상관없이 표시됩니다.
- **목업 파일을 고쳐도 화면이 바뀌지 않으면** 응답이 localStorage에 캐싱되어 있는 것입니다. 브라우저 개발자 도구에서 localStorage의 `mystocks-query-cache`를 지우고 새로고침하세요. 캐싱 방식은 [API 응답 캐싱 전략](docs/caching.md)에 정리되어 있습니다.

## 기타 명령어

```bash
npm run build    # 타입 체크 후 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```
