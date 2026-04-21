const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  quote:   (sym: string)                  => apiFetch(`/api/quote/${sym}`),
  quotes:  (syms: string)                 => apiFetch(`/api/quotes?symbols=${syms}`),
  news:    (sym: string)                  => apiFetch(`/api/news/${sym}`),
  candles: (sym: string, res = "60")      => apiFetch(`/api/candles/${sym}?resolution=${res}`),
  profile: (sym: string)                  => apiFetch(`/api/profile/${sym}`),
  peers:   (sym: string)                  => apiFetch(`/api/peers/${sym}`),
  fx:      ()                             => apiFetch("/api/fx/usd-cad"),
  chat:    (question: string, stock_info: object) =>
    apiFetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question, stock_info }),
    }),
};
