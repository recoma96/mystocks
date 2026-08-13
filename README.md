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

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

개발 서버가 실행되면 `http://localhost:5173`에서 확인할 수 있습니다.

## 기타 명령어

```bash
npm run build    # 타입 체크 후 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```
