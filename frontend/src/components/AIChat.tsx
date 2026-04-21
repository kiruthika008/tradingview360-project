"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface Message { role: "user" | "assistant"; content: string; }

export default function AIChat({ stockInfo }: { stockInfo: object }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role:"user", content:q }]);
    setLoading(true);
    try {
      const res = await api.chat(q, stockInfo);
      setMessages(prev => [...prev, { role:"assistant", content:res.answer }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role:"assistant", content:`Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom:16 }}>
      <div className="section-label">🤖 Claude AI Assistant</div>

      {/* Message thread */}
      <div style={{
        minHeight:100, maxHeight:320, overflowY:"auto",
        display:"flex", flexDirection:"column", gap:10,
        marginBottom:14, paddingRight:4,
      }}>
        {messages.length === 0 && (
          <p style={{ color:"var(--text-muted)", fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", textAlign:"center", padding:"24px 0" }}>
            Ask about this stock — BUY / SELL / HOLD analysis, risk, earnings…
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth:"88%",
            background: m.role === "user" ? "var(--gold-dim)" : "var(--bg-elevated)",
            border: m.role === "user"
              ? "1px solid rgba(212,168,67,0.3)"
              : "1px solid var(--border-bright)",
            borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            padding:"10px 14px",
            fontFamily:"'DM Mono',monospace", fontSize:"0.82rem",
            color: m.role === "user" ? "var(--gold-light)" : "var(--text-primary)",
            lineHeight:1.6, whiteSpace:"pre-wrap",
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf:"flex-start",
            background:"var(--bg-elevated)", border:"1px solid var(--border-bright)",
            borderRadius:"12px 12px 12px 2px", padding:"10px 16px",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div className="spinner" style={{ width:14, height:14, borderWidth:2 }} />
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color:"var(--text-muted)" }}>
              Analysing…
            </span>
          </div>
        )}
      </div>

      {/* Input row */}
      <div style={{ display:"flex", gap:8 }}>
        <input
          className="qti-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about this stock…"
          disabled={loading}
        />
        <button className="qti-btn" onClick={send} disabled={loading} style={{ flexShrink:0 }}>
          Send
        </button>
      </div>
    </div>
  );
}
