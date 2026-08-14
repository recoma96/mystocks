import { NoDataFoundError } from './api/fetchWithDateFallback';
import styles from './App.module.css';
import { ActivityCard } from './components/ActivityCard/ActivityCard';
import { AllocationCard } from './components/AllocationCard/AllocationCard';
import { ChartCard } from './components/ChartCard/ChartCard';
import { Header } from './components/Header/Header';
import { PositionsCard } from './components/PositionsCard/PositionsCard';
import { usePositionData } from './queries/usePositionData';
import { useProfitHistoryData } from './queries/useProfitHistoryData';

function toErrorMessage(error: unknown): string {
  if (error instanceof NoDataFoundError) {
    return `데이터가 없습니다. (${error.message})`;
  }
  return `데이터를 불러오지 못했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
}

function App() {
  const { data, isLoading, isError, error } = usePositionData();
  const {
    data: profitHistory,
    isLoading: isProfitHistoryLoading,
    isError: isProfitHistoryError,
    error: profitHistoryError,
  } = useProfitHistoryData();

  return (
    <main className="shell">
      <Header updateDate={data?.updateDate} />

      {isLoading && (
        <section className={`card ${styles.stateCard}`}>포트폴리오 데이터를 불러오는 중입니다…</section>
      )}

      {isError && (
        <section className={`card ${styles.stateCard} ${styles.errorCard}`}>{toErrorMessage(error)}</section>
      )}

      {data && (
        <section className={styles.overview} aria-label="포트폴리오 요약">
          <AllocationCard data={data} />
          <PositionsCard data={data} />
        </section>
      )}

      {isProfitHistoryLoading && (
        <section className={`card ${styles.stateCard}`}>추이 데이터를 불러오는 중입니다…</section>
      )}

      {isProfitHistoryError && (
        <section className={`card ${styles.stateCard} ${styles.errorCard}`}>
          {toErrorMessage(profitHistoryError)}
        </section>
      )}

      {profitHistory && <ChartCard data={profitHistory} />}

      <ActivityCard />
    </main>
  );
}

export default App;
