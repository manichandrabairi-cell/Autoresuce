/**
 * AutoRescue Unified API Client
 *
 * Dynamically resolves backend API base URL:
 * 1. import.meta.env.VITE_API_URL (Set in cloud deployment env vars, e.g. https://my-backend.onrender.com)
 * 2. window.__AUTORESCUE_API_URL__ (Runtime injection)
 * 3. localStorage.getItem('autorescue_api_url') (User-configurable backend override)
 * 4. Same-origin relative '/api' (Works for Monorepos, Docker, Render single-service, or Vite proxy)
 * 5. On Localhost only: falls back to 'http://127.0.0.1:8000/api'
 */

export function getApiBaseUrl(): string {
  // Check runtime injection
  if (typeof window !== 'undefined' && (window as any).__AUTORESCUE_API_URL__) {
    const raw = (window as any).__AUTORESCUE_API_URL__.trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // Check user localStorage override
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('autorescue_api_url');
    if (custom && custom.trim().length > 0) {
      const raw = custom.trim().replace(/\/+$/, '');
      return raw.endsWith('/api') ? raw : `${raw}/api`;
    }
  }

  // Check Vite build/runtime environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const raw = envUrl.trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // Default to relative '/api'
  return '/api';
}

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const LOCAL_FALLBACK = 'http://127.0.0.1:8000/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('autorescue_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const primaryBase = getApiBaseUrl();
  const primaryUrl = `${primaryBase}${cleanEndpoint}`;

  try {
    const response = await fetch(primaryUrl, {
      ...options,
      headers,
    });

    if (response.ok) {
      return response.json();
    }

    // If server returned 404/502 on relative /api and we are on localhost, try direct port 8000
    if (isLocalhost && primaryBase === '/api' && [404, 502, 503].includes(response.status)) {
      try {
        const fallbackRes = await fetch(`${LOCAL_FALLBACK}${cleanEndpoint}`, {
          ...options,
          headers,
        });
        if (fallbackRes.ok) {
          return fallbackRes.json();
        }
      } catch {
        // Fallback failed
      }
    }

    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      // Ignore parse failure
    }
    throw new Error(errorMsg);
  } catch (err: any) {
    // If network connection failed (e.g. proxy down on localhost), try local fallback
    if (isLocalhost && primaryBase === '/api') {
      try {
        const fallbackRes = await fetch(`${LOCAL_FALLBACK}${cleanEndpoint}`, {
          ...options,
          headers,
        });
        if (fallbackRes.ok) {
          return fallbackRes.json();
        }
      } catch {
        // Fallback failed
      }
    }

    // Provide helpful user-facing diagnostics if backend is unreachable
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error(
        `Cannot connect to AutoRescue Backend API at "${primaryUrl}". Please verify that your backend service is running and CORS is permitted.`
      );
    }
    throw err;
  }
}
