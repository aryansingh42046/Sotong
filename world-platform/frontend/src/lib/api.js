import { readAuthStorage, writeAuthStorage, clearAuthStorage } from './authStorage.js';

const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => {
  return readAuthStorage()?.state?.accessToken || null;
};

const getRefreshToken = () => readAuthStorage()?.state?.refreshToken || null;

let refreshPromise = null;

const updateTokens = (data) => {
  const current = readAuthStorage()?.state || {};
  const nextState = {
    ...current,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user ?? current.user,
  };
  writeAuthStorage(nextState);
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    const res = await fetch(`${BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    updateTokens(data);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const request = async (method, path, body, retry = true) => {
  const isAuthEndpoint = path.startsWith('/auth/');
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 401 && retry && !isAuthEndpoint) {
      const newToken = await refreshAccessToken();
      if (newToken) return request(method, path, body, false);
      clearAuthStorage();
    }
    throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status, data: err });
  }

  return res.json();
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};
