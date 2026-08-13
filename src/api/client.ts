const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1"
let token = sessionStorage.getItem("marketops.token")

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({
        error: { code: "HTTP_ERROR", message: response.statusText },
      }))
    throw new ApiClientError(
      response.status,
      payload.error?.code,
      payload.error?.message,
    )
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export const jsonBody = (value: unknown) => JSON.stringify(value)

export async function upload<T>(path: string, file: File): Promise<T> {
  const form = new FormData()
  form.append("arquivo", file)
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  })
  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({
        error: { code: "HTTP_ERROR", message: response.statusText },
      }))
    throw new ApiClientError(
      response.status,
      payload.error?.code,
      payload.error?.message,
    )
  }
  return response.json()
}

export function setToken(value: string | null) {
  token = value
  if (value) sessionStorage.setItem("marketops.token", value)
  else sessionStorage.removeItem("marketops.token")
}

export function hasToken() {
  return Boolean(token)
}
