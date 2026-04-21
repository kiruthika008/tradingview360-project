// ─── IMPORTANT: Set NEXT_PUBLIC_API_URL in Vercel → Settings → Environment Variables
// Value should be your Render backend URL e.g. https://qti-backend.onrender.com
// For local dev create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000
const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

if (!BASE && typeof window !== "undefined") {
  console.warn(
    "[QTI] NEXT_PUBLIC_API_URL is not set. " +
    "Add it in Vercel → Project → Settings → Environment Variables. " +
    "Value: https://your-backend.onrender.com"
  );
}

export async function apiFetch(path: string, options?: RequestInit) {
  if (!BASE) {
    throw new Error(
      "Backend URL not configured. Set NEXT_PUBLIC_API_URL in Vercel environment variables."
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr: any) {
    throw new Error(
      `Cannot reach backend at ${BASE}. ` +
      "Check that your Render service is running and CORS is enabled. " +
      `(${networkErr?.message || networkErr})`
    );
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || body.message || detail;
    } catch {}
    throw new Error(detail);
  }

  return res.json();
}

export const api = {
  quote:   (sym: string)                       => apiFetch(`/api/quote/${sym}`),
  quotes:  (syms: string)                      => apiFetch(`/api/quotes?symbols=${syms}`),
  news:    (sym: string)                        => apiFetch(`/api/news/${sym}`),
  candles: (sym: string, resolution = "60")    => apiFetch(`/api/candles/${sym}?resolution=${resolution}`),
  profile: (sym: string)                        => apiFetch(`/api/profile/${sym}`),
  peers:   (sym: string)                        => apiFetch(`/api/peers/${sym}`),
  fx:      ()                                   => apiFetch("/api/fx/usd-cad"),
  chat:    (question: string, stock_info: object) =>
    apiFetch("/api/chat", {
      method:  "POST",
      body:    JSON.stringify({ question, stock_info }),
    }),
};
