/**
 * NEXUS — API client.
 * Centralized HTTP client for all backend communication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

interface ApiError {
  detail: any;
}

export class ApiClientError extends Error {
  status: number;
  detail: any;
  constructor(status: number, detail: any) {
    super(typeof detail === "string" ? detail : JSON.stringify(detail));
    this.status = status;
    this.detail = detail;
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, token } = options;

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const stored = localStorage.getItem("nexus_token");
    if (stored) {
      fetchHeaders["Authorization"] = `Bearer ${stored}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiClientError(0, "Network error: Failed to connect to the server.");
  }

  if (!res.ok) {
    let detail: any = "An error occurred";
    try {
      const err: any = await res.json();
      detail = err.detail || err.message || detail;
    } catch {
      // ignore parse error
    }
    throw new ApiClientError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
