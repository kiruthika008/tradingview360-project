"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface NewsItem {
  headline: string; url: string; source: string;
  datetime: string; sentiment: "positive" | "negative" | "neutral";
}

const sentimentIcon = { positive:"🟢", negative:"🔴", neutral:"🟡" };
const sentimentColor = { positive:"var(--green)", negative:"var(--red)", neutral:"var(--gold)" };

export default function NewsPanel({ symbol }: { symbol: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.news(symbol)
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-label">📰 Latest News — {symbol}</div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"32px 0" }}>
          <div className="spinner" />
        </div>
      ) : news.length === 0 ? (
        <p style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem", textAlign:"center", padding:"24px 0" }}>
          No recent news found.
        </p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {news.map((n, i) => (
            <div key={i} className="news-card">
              <a href={n.url} target="_blank" rel="noopener noreferrer" style={{
                fontFamily:"var(--font-sans)", fontWeight:600, fontSize:"0.88rem",
                color:"var(--text-primary)", lineHeight:1.45, display:"block", marginBottom:8,
              }}>
                {n.headline}
              </a>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:sentimentColor[n.sentiment] }}>
                  {sentimentIcon[n.sentiment]} {n.sentiment.charAt(0).toUpperCase() + n.sentiment.slice(1)}
                </span>
                {n.source && (
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--text-muted)" }}>
                    📡 {n.source}
                  </span>
                )}
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.68rem", color:"var(--text-muted)" }}>
                  🕒 {n.datetime}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
