const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

if (!BASE && typeof window !== "undefined") {
  console.warn("[QTI] NEXT_PUBLIC_API_URL is not set. Set it in Vercel → Settings → Environment Variables.");
}

export async function apiFetch(path: string, options?: RequestInit) {
  if (!BASE) throw new Error("Backend URL not configured. Set NEXT_PUBLIC_API_URL in Vercel environment variables.");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  } catch (networkErr: any) {
    throw new Error(`Cannot reach backend at ${BASE}. Check Render service is running and CORS is enabled. (${networkErr?.message})`);
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const body = await res.json(); detail = body.detail || body.message || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  quote:        (sym: string)                        => apiFetch(`/api/quote/${sym}`),
  quotes:       (syms: string)                       => apiFetch(`/api/quotes?symbols=${syms}`),
  news:         (sym: string)                        => apiFetch(`/api/news/${sym}`),
  candles:      (sym: string, resolution = "60")     => apiFetch(`/api/candles/${sym}?resolution=${resolution}`),
  profile:      (sym: string)                        => apiFetch(`/api/profile/${sym}`),
  peers:        (sym: string)                        => apiFetch(`/api/peers/${sym}`),
  fxRates:      ()                                   => apiFetch("/api/fx/rates"),
  // Indian market
  indiaSearch:  (q: string)                          => apiFetch(`/api/india/search?q=${encodeURIComponent(q)}`),
  indiaPopular: ()                                   => apiFetch("/api/india/popular"),
  chat:         (question: string, stock_info: object) =>
    apiFetch("/api/chat", { method: "POST", body: JSON.stringify({ question, stock_info }) }),
};

// Detect which market a symbol belongs to
export function detectMarket(symbol: string): "US" | "CA" | "IN_NSE" | "IN_BSE" {
  const s = symbol.toUpperCase();
  if (s.endsWith(".NS")) return "IN_NSE";
  if (s.endsWith(".BO")) return "IN_BSE";
  if (s.endsWith(".TO") || s.endsWith(".V") || s.endsWith(".TSX")) return "CA";
  return "US";
}

export function isIndianStock(symbol: string) {
  return symbol.toUpperCase().endsWith(".NS") || symbol.toUpperCase().endsWith(".BO");
}
