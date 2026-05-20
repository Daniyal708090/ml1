const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  user: {
    me: () => request<unknown>('/api/users/me'),
    progress: () => request<unknown>('/api/users/progress'),
    update: (body: Record<string, unknown>) =>
      request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  },
  interviews: {
    start: (body: { track: string; mode: string; companySimulationId?: string }) =>
      request('/api/interviews/start', { method: 'POST', body: JSON.stringify(body) }),
    answer: (id: string, body: { content: string; codeSnippet?: string }) =>
      request(`/api/interviews/${id}/answer`, { method: 'POST', body: JSON.stringify(body) }),
    complete: (id: string) =>
      request(`/api/interviews/${id}/complete`, { method: 'POST' }),
    history: () => request<unknown[]>('/api/interviews/history'),
    get: (id: string) => request(`/api/interviews/${id}`),
  },
  companies: () => request<unknown[]>('/api/companies'),
};

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
