"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell
} from "recharts";
import { api } from "@/lib/api";

interface Profile {
  name?: string; finnhubIndustry?: string; exchange?: string;
  country?: string; marketCapitalization?: number; weburl?: string;
}
interface PeerQuote { ticker: string; price: number; change: number; signal: string; }

export default function SectorPeers({
  symbol, formatPrice,
}: { symbol: string; formatPrice: (v: number) => string }) {
  const [profile, setProfile] = useState<Profile>({});
  const [peers, setPeers] = useState<PeerQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.profile(symbol), api.peers(symbol)])
      .then(async ([prof, peerList]) => {
        setProfile(prof);
        const filtered: string[] = (peerList as string[]).filter((p: string) => p !== symbol).slice(0, 5);
        if (filtered.length) {
          const qs = await api.quotes(filtered.join(","));
          setPeers(qs);
        } else {
          setPeers([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbol]);

  const chartData = peers.map(p => ({ ticker: p.ticker, price: p.price, change: p.change }));

  return (
    <div className="card" style={{ marginBottom:16 }}>
      <div className="section-label">🏢 Sector & Peer Comparison</div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"32px 0" }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Profile grid */}
          {profile.name && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
              <div className="metric-card">
                <div className="metric-label">Company</div>
                <div style={{ fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginTop:4 }}>
                  {profile.name}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Sector</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.82rem", color:"var(--gold)", marginTop:4 }}>
                  {profile.finnhubIndustry || "N/A"}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Market Cap</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.88rem", color:"var(--text-primary)", marginTop:4 }}>
                  ${((profile.marketCapitalization || 0) / 1000).toFixed(1)}B
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Exchange</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.82rem", color:"var(--text-primary)", marginTop:4 }}>
                  {profile.exchange || "N/A"}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Country</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.82rem", color:"var(--text-primary)", marginTop:4 }}>
                  {profile.country || "N/A"}
                </div>
              </div>
              {profile.weburl && (
                <div className="metric-card" style={{ display:"flex", alignItems:"center" }}>
                  <a href={profile.weburl} target="_blank" rel="noopener noreferrer"
                    style={{ color:"var(--gold)", fontFamily:"var(--font-mono)", fontSize:"0.78rem" }}>
                    🌐 Website ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Peers table + chart */}
          {peers.length > 0 ? (
            <>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--text-secondary)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                🤝 Peer Companies
              </p>
              <div style={{ overflowX:"auto", marginBottom:20 }}>
                <table className="qti-table">
                  <thead>
                    <tr><th>Ticker</th><th>Price</th><th>Change %</th><th>Signal</th></tr>
                  </thead>
                  <tbody>
                    {peers.map(p => (
                      <tr key={p.ticker}>
                        <td style={{ color:"var(--gold)", fontWeight:700 }}>{p.ticker}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td style={{ color: p.change >= 0 ? "var(--green)" : "var(--red)" }}>
                          {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
                        </td>
                        <td style={{ color: p.signal === "BUY" ? "var(--green)" : p.signal === "SELL" ? "var(--red)" : "var(--gold)" }}>
                          {p.signal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="ticker" tick={{ fill:"var(--text-muted)", fontSize:10, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"var(--text-muted)", fontSize:10, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} width={52} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background:"var(--bg-elevated)", border:"1px solid var(--border-bright)", borderRadius:8, fontFamily:"var(--font-mono)", fontSize:"0.75rem" }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Price"]}
                  />
                  <Bar dataKey="price" radius={[4,4,0,0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.change >= 0 ? "var(--green)" : "var(--red)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:"0.8rem" }}>
              No peer data available.
            </p>
          )}
        </>
      )}
    </div>
  );
}
