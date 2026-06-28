const STORAGE_KEY = 'auth-storage';

export const readAuthStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export const writeAuthStorage = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state }));
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
