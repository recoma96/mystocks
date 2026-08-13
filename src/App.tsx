import styles from './App.module.css';
import { AllocationCard } from './components/AllocationCard/AllocationCard';
import { ChartCard } from './components/ChartCard/ChartCard';
import { Header } from './components/Header/Header';
import { PositionsCard } from './components/PositionsCard/PositionsCard';
import { usePositionData } from './queries/usePositionData';
import { useProfitHistoryData } from './queries/useProfitHistoryData';

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
        <section className={`card ${styles.stateCard} ${styles.errorCard}`}>
          데이터를 불러오지 못했습니다: {error instanceof Error ? error.message : '알 수 없는 오류'}
        </section>
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
          추이 데이터를 불러오지 못했습니다:{' '}
          {profitHistoryError instanceof Error ? profitHistoryError.message : '알 수 없는 오류'}
        </section>
      )}

      {profitHistory && <ChartCard data={profitHistory} />}
    </main>
  );
}

export default App;
