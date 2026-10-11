const PRIMARY_API_BASE = '/api';
const DIRECT_BACKEND_FALLBACK = 'http://127.0.0.1:8000/api';

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

  // Try primary proxy first
  try {
    const response = await fetch(`${PRIMARY_API_BASE}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    if (response.ok) {
      return response.json();
    }

    // If server returned 404 / 403 / 502 (e.g. hitting static server without proxy), try direct fallback
    if ([403, 404, 502, 503].includes(response.status)) {
      try {
        const fallbackRes = await fetch(`${DIRECT_BACKEND_FALLBACK}${cleanEndpoint}`, {
          ...options,
          headers,
        });
        if (fallbackRes.ok) {
          return fallbackRes.json();
        }
      } catch {
        // Fallback also failed, proceed with original error extraction
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
    // If network failure on primary proxy (e.g. refused connection), attempt direct backend
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      try {
        const fallbackRes = await fetch(`${DIRECT_BACKEND_FALLBACK}${cleanEndpoint}`, {
          ...options,
          headers,
        });
        if (fallbackRes.ok) {
          return fallbackRes.json();
        }
      } catch {
        // Fallback also failed
      }
    }
    throw err;
  }
}
