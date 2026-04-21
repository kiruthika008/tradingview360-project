import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "QTI — Free AI Stock Terminal | Real-Time US & Canadian Market Analysis",
  description: "Free AI-powered stock terminal. Real-time quotes, Claude AI signals, RSI/MACD/Bollinger charts, portfolio tracker and price alerts for NYSE, NASDAQ & TSX.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9965583211535412"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
