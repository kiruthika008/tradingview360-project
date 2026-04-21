"use client";
import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: string;
  style?: React.CSSProperties;
}

export default function AdBanner({ slot, format = "auto", style }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div style={{ textAlign: "center", ...style }}>
      <p style={{
        fontFamily:"'DM Mono',monospace", fontSize:"0.62rem",
        color:"var(--text-muted)", letterSpacing:"0.1em",
        textTransform:"uppercase", marginBottom:8,
      }}>
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9965583211535412"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
