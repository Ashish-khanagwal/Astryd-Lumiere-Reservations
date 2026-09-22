const BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${BASE_URL}/api/v1${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const rawBody = body as unknown as {
      error?: string | { code?: string; message?: string; fields?: Record<string, string> };
      message?: string;
    } | null;
    const nestedError = rawBody?.error && typeof rawBody.error === 'object' ? rawBody.error : undefined;
    throw new ApiError(
      res.status,
      typeof rawBody?.error === 'string' ? rawBody.error : nestedError?.code ?? 'unknown',
      rawBody?.message ?? nestedError?.message ?? res.statusText,
      nestedError?.fields,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};
