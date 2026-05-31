export async function apiFetch(path, options = {}) {
  const { body, ...rest } = options
  const isForm = body instanceof FormData

  const res = await fetch(path, {
    credentials: 'include',
    headers: isForm ? {} : { 'Content-Type': 'application/json' },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || res.statusText)
  }
  return res.json()
}
