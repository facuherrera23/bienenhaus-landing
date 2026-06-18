const BASE_URL: string =
  import.meta.env.VITE_API_BASE || '';

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.message || `API error ${res.status}`);
  }

  return json.data as T;
}
