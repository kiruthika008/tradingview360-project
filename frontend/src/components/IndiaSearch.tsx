"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

interface IndiaStock { ticker: string; name: string; exchange: string; }

interface Props { onSelect: (ticker: string) => void; }

const POPULAR_PREVIEW = [
  { ticker:"RELIANCE.NS",  name:"Reliance Industries",       exchange:"NSE" },
  { ticker:"TCS.NS",       name:"Tata Consultancy Services", exchange:"NSE" },
  { ticker:"INFY.NS",      name:"Infosys",                   exchange:"NSE" },
  { ticker:"HDFCBANK.NS",  name:"HDFC Bank",                 exchange:"NSE" },
  { ticker:"ICICIBANK.NS", name:"ICICI Bank",                exchange:"NSE" },
  { ticker:"SBIN.NS",      name:"State Bank of India",       exchange:"NSE" },
  { ticker:"BAJFINANCE.NS","name":"Bajaj Finance",           exchange:"NSE" },
  { ticker:"WIPRO.NS",     name:"Wipro",                     exchange:"NSE" },
  { ticker:"ZOMATO.NS",    name:"Zomato",                    exchange:"NSE" },
  { ticker:"HCLTECH.NS",   name:"HCL Technologies",          exchange:"NSE" },
];

export default function IndiaSearch({ onSelect }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<IndiaStock[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const debounce                = useRef<NodeJS.Timeout>();
  const containerRef            = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    setOpen(true);
    clearTimeout(debounce.current);
    if (val.trim().length < 1) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.indiaSearch(val.trim());
        setResults(r);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  }

  function select(ticker: string) {
    onSelect(ticker);
    setQuery("");
    setOpen(false);
    setResults([]);
  }

  const displayList = query.trim() ? results : POPULAR_PREVIEW;

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%" }}>
      {/* Search input */}
      <div style={{ position:"relative" }}>
        <span style={{
          position:"absolute", left:11, top:"50%", transform:"translateY(-50%)",
          fontSize:"0.85rem", pointerEvents:"none",
        }}>🇮🇳</span>
        <input
          className="qti-input"
          style={{ paddingLeft:32 }}
          placeholder="Search NSE/BSE: RELIANCE, TCS, INFY…"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
        />
        {loading && (
          <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}>
            <div className="spinner" style={{ width:14, height:14 }} />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:200,
          background:"var(--bg-surface)", border:"1px solid var(--border-bright)",
          borderRadius:"var(--radius-lg)", overflow:"hidden",
          boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
          maxHeight:340, overflowY:"auto",
        }}>
          {/* Header */}
          <div style={{
            padding:"8px 12px",
            background:"var(--bg-elevated)", borderBottom:"1px solid var(--border)",
            fontFamily:"var(--font-mono)", fontSize:"0.62rem",
            color:"var(--gold)", letterSpacing:"0.1em", textTransform:"uppercase",
          }}>
            {query.trim() ? `Results for "${query}"` : "🔥 Popular Indian Stocks — NSE"}
          </div>

          {displayList.length === 0 && !loading && (
            <div style={{
              padding:"20px 16px", textAlign:"center",
              fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--text-muted)",
            }}>
              No results. Try: RELIANCE, TCS, INFY, HDFC, WIPRO
            </div>
          )}

          {displayList.map((s, i) => (
            <button key={i}
              onClick={() => select(s.ticker)}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                width:"100%", padding:"10px 14px",
                background:"transparent", border:"none", borderBottom:"1px solid var(--border)",
                cursor:"pointer", textAlign:"left",
                transition:"background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <span style={{
                  fontFamily:"var(--font-mono)", fontWeight:600, fontSize:"0.82rem",
                  color:"var(--gold)", marginRight:10,
                }}>
                  {s.ticker}
                </span>
                <span style={{
                  fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"var(--text-primary)",
                }}>
                  {s.name}
                </span>
              </div>
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:"0.62rem",
                color: s.exchange === "NSE" ? "var(--green-bright)" : "var(--cyan)",
                background: s.exchange === "NSE" ? "var(--green-dim)" : "var(--cyan-dim)",
                border: `1px solid ${s.exchange === "NSE" ? "rgba(34,197,94,0.25)" : "rgba(14,165,233,0.25)"}`,
                borderRadius:"20px", padding:"2px 8px", flexShrink:0,
              }}>
                {s.exchange}
              </span>
            </button>
          ))}

          {/* Footer hint */}
          <div style={{
            padding:"7px 12px",
            background:"var(--bg-elevated)", borderTop:"1px solid var(--border)",
            fontFamily:"var(--font-mono)", fontSize:"0.62rem", color:"var(--text-muted)",
          }}>
            💡 Tip: Append <span style={{ color:"var(--gold)" }}>.NS</span> for NSE &nbsp;·&nbsp;
            <span style={{ color:"var(--cyan)" }}>.BO</span> for BSE &nbsp;·&nbsp;
            e.g. RELIANCE.NS or RELIANCE.BO
          </div>
        </div>
      )}
    </div>
  );
}
