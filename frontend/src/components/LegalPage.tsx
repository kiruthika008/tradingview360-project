"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Section { heading: string; body: React.ReactNode; }

interface Props {
  title: string;
  eyebrow: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPage({ title, eyebrow, lastUpdated, sections }: Props) {
  const [showAuth, setShowAuth] = useState(false);
  return (
    <div className="page-wrap">
      {/* ✅ FIXED NAVBAR */}
      <Navbar onShowAuth={() => setShowAuth(true)} />

      <div style={{ maxWidth:780, margin:"0 auto" }}>
        {/* Breadcrumb */}
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:"0.7rem",
          color:"var(--text-muted)", marginBottom:24, display:"flex", gap:8, alignItems:"center",
        }}>
          <Link href="/" style={{ color:"var(--gold)", textDecoration:"none" }}>Home</Link>
          <span>›</span>
          <span>{title}</span>
        </div>

        {/* Header card */}
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:18, padding:"36px 40px", marginBottom:28,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-40, right:-40, width:200, height:200,
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%)",
            pointerEvents:"none",
          }} />
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.65rem",
            color:"var(--gold)", letterSpacing:"0.12em", textTransform:"uppercase",
            marginBottom:12,
          }}>
            {eyebrow}
          </div>
          <h1 style={{
            fontFamily:"var(--font-sans)", fontWeight:800,
            fontSize:"2rem", letterSpacing:"-1px",
            color:"var(--text-primary)", marginBottom:12,
          }}>
            {title}
          </h1>
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.72rem",
            color:"var(--text-muted)",
          }}>
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:40 }}>
          {sections.map((s, i) => (
            <div key={i} style={{
              background:"var(--bg-card)", border:"1px solid var(--border)",
              borderLeft:"3px solid var(--gold)", borderRadius:12,
              padding:"22px 26px",
            }}>
              <h2 style={{
                fontFamily:"var(--font-sans)", fontWeight:700,
                fontSize:"1rem", color:"var(--text-primary)", marginBottom:12,
              }}>
                {s.heading}
              </h2>
              <div style={{
                fontFamily:"var(--font-mono)", fontSize:"0.8rem",
                color:"var(--text-secondary)", lineHeight:1.8,
              }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
