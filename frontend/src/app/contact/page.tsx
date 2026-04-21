"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const TOPICS = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Data Accuracy Issue",
  "Privacy / Data Request",
  "Partnership / Press",
  "Other",
];

const CONTACT_CARDS = [
  {
    icon:"📧",
    title:"General Inquiries",
    detail:"hello@quantumtradeintelligence.com",
    href:"mailto:hello@quantumtradeintelligence.com",
    desc:"For general questions, feedback, and anything else.",
  },
  {
    icon:"🛡️",
    title:"Privacy & Legal",
    detail:"privacy@quantumtradeintelligence.com",
    href:"mailto:privacy@quantumtradeintelligence.com",
    desc:"Data requests, GDPR/CCPA, legal notices.",
  },
  {
    icon:"🐛",
    title:"Bug Reports",
    detail:"bugs@quantumtradeintelligence.com",
    href:"mailto:bugs@quantumtradeintelligence.com",
    desc:"Found something broken? Let us know.",
  },
  {
    icon:"🤝",
    title:"Partnerships & Press",
    detail:"partners@quantumtradeintelligence.com",
    href:"mailto:partners@quantumtradeintelligence.com",
    desc:"Business inquiries, press mentions, collaborations.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", topic: TOPICS[0], message:"" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    // In production: POST to /api/contact or a form service like Formspree
    setSent(true);
  }

  return (
    <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto", padding:"24px 20px" }}>
      <Navbar />

      <div style={{ maxWidth:860, margin:"0 auto" }}>
        {/* Breadcrumb */}
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:"0.7rem",
          color:"var(--text-muted)", marginBottom:24, display:"flex", gap:8, alignItems:"center",
        }}>
          <Link href="/" style={{ color:"var(--gold)", textDecoration:"none" }}>Home</Link>
          <span>›</span>
          <span>Contact Us</span>
        </div>

        {/* Header */}
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:18, padding:"36px 40px", marginBottom:28,
          position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-50, right:-50, width:240, height:240, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%)",
            pointerEvents:"none",
          }} />
          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"0.65rem",
            color:"var(--gold)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12,
          }}>
            Get In Touch
          </div>
          <h1 style={{
            fontFamily:"var(--font-sans)", fontWeight:800, fontSize:"2rem",
            letterSpacing:"-1px", color:"var(--text-primary)", marginBottom:12,
          }}>
            Contact Us
          </h1>
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:"0.82rem",
            color:"var(--text-secondary)", lineHeight:1.7, maxWidth:520,
          }}>
            Have a question, found a bug, or want to suggest a feature?
            We'd love to hear from you. We typically respond within 1–2 business days.
          </p>
        </div>

        {/* Contact cards grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:28 }}>
          {CONTACT_CARDS.map(c => (
            <a key={c.title} href={c.href} style={{
              background:"var(--bg-card)", border:"1px solid var(--border)",
              borderLeft:"3px solid var(--gold)", borderRadius:12,
              padding:"18px 20px", textDecoration:"none",
              display:"flex", gap:14, alignItems:"flex-start",
              transition:"background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,168,67,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
            >
              <span style={{ fontSize:"1.4rem", flexShrink:0 }}>{c.icon}</span>
              <div>
                <div style={{
                  fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"0.88rem",
                  color:"var(--text-primary)", marginBottom:4,
                }}>{c.title}</div>
                <div style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.76rem",
                  color:"var(--gold)", marginBottom:6,
                }}>{c.detail}</div>
                <div style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.72rem",
                  color:"var(--text-muted)", lineHeight:1.5,
                }}>{c.desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <div style={{
          background:"var(--bg-card)", border:"1px solid var(--border)",
          borderRadius:16, padding:"32px 36px", marginBottom:40,
        }}>
          <div className="section-label" style={{ marginBottom:24 }}>✉️ Send a Message</div>

          {sent ? (
            <div style={{
              textAlign:"center", padding:"48px 20px",
              background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)",
              borderRadius:12,
            }}>
              <div style={{ fontSize:"2.5rem", marginBottom:16 }}>✅</div>
              <div style={{
                fontFamily:"var(--font-sans)", fontWeight:700, fontSize:"1.1rem",
                color:"var(--green)", marginBottom:10,
              }}>
                Message Sent!
              </div>
              <p style={{
                fontFamily:"var(--font-mono)", fontSize:"0.8rem",
                color:"var(--text-secondary)", lineHeight:1.6,
              }}>
                Thanks for reaching out, {form.name}. We'll get back to you at {form.email} within 1–2 business days.
              </p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {error && (
                <div style={{
                  background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                  borderRadius:8, padding:"10px 14px",
                  fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"#fca5a5",
                }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={{
                    fontFamily:"var(--font-mono)", fontSize:"0.67rem",
                    color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase",
                    display:"block", marginBottom:6,
                  }}>
                    Your Name *
                  </label>
                  <input
                    className="qti-input"
                    name="name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily:"var(--font-mono)", fontSize:"0.67rem",
                    color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase",
                    display:"block", marginBottom:6,
                  }}>
                    Email Address *
                  </label>
                  <input
                    className="qti-input"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.67rem",
                  color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase",
                  display:"block", marginBottom:6,
                }}>
                  Topic
                </label>
                <select
                  className="qti-input"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  style={{ appearance:"none", cursor:"pointer" }}
                >
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.67rem",
                  color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase",
                  display:"block", marginBottom:6,
                }}>
                  Message *
                </label>
                <textarea
                  className="qti-input"
                  name="message"
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  value={form.message}
                  onChange={handleChange}
                  style={{ resize:"vertical", minHeight:120 }}
                />
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button className="qti-btn" onClick={handleSubmit} style={{ padding:"12px 32px" }}>
                  Send Message →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Response time note */}
        <div style={{
          background:"var(--bg-elevated)", border:"1px solid var(--border)",
          borderRadius:10, padding:"14px 18px", marginBottom:40,
          fontFamily:"var(--font-mono)", fontSize:"0.74rem",
          color:"var(--text-muted)", lineHeight:1.6,
        }}>
          💡 <strong style={{ color:"var(--text-secondary)" }}>Response times:</strong>{" "}
          General inquiries → 1–2 business days.
          Bug reports → we aim for 24 hours.
          Privacy requests (GDPR/CCPA) → 5–7 business days as required by law.
        </div>
      </div>

      <Footer />
    </div>
  );
}
