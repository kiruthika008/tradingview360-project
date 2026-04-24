"use client";
import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  style?: React.CSSProperties;
}

export default function AdBanner({ slot, format = "auto", style }: AdBannerProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  return (
    <div style={{
      textAlign:"center", overflow:"hidden",
      minHeight: format === "horizontal" ? 90 : 100,
      ...style,
    }}>
      <p style={{
        fontFamily:"var(--font-mono)", fontSize:"0.58rem",
        color:"var(--text-muted)", letterSpacing:"0.1em",
        textTransform:"uppercase", marginBottom:4, opacity:0.6,
      }}>
        Advertisement
      </p>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display:"block" }}
        data-ad-client="ca-pub-9965583211535412"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
