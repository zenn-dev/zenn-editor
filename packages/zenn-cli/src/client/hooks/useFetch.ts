import useSWR, { SWRConfiguration } from 'swr';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const data = await res.json();
    error.message = data.message;
    throw error;
  }
  return res.json();
}

export function useFetch<T>(apiPath: string, configuration?: SWRConfiguration) {
  const result = useSWR<T, { message: string }>(
    apiPath,
    fetcher,
    configuration
  );
  return result;
}
