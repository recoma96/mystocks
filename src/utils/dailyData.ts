const UPDATE_HOUR = 5;

/**
 * 매일 오전 5시(로컬 시각)에 갱신되는 데이터 기준으로, 지금 시점에 유효한 데이터 날짜를 구한다.
 * 5시 이전에 접속하면 아직 당일 파일이 안 올라왔을 것이므로 전날 날짜를 반환한다.
 */
export function getLatestDataDate(now: Date = new Date()): Date {
  const date = new Date(now);
  if (date.getHours() < UPDATE_HOUR) {
    date.setDate(date.getDate() - 1);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}
