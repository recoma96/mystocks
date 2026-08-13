const DATA_BASE_URL = import.meta.env.VITE_DATA_BASE_URL ?? '/mock-data';

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
