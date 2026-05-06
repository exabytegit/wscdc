import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config.js';

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw Object.assign(new Error(data.descripcion || `HTTP ${response.status}`), { status: response.status, data });
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export const getHealth = () => apiFetch('/health');
export const getDummy = () => apiFetch('/wscdc/dummy');
export const constatar = (payload) => apiFetch('/wscdc/constatar', {
  method: 'POST',
  body: JSON.stringify(payload),
});
