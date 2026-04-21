"use client";
import LegalPage from "@/components/LegalPage";


const sections = [
  {
    heading: "Investment Risk Disclosure",
    body: "Investing in stocks, ETFs, and other securities involves substantial risk of loss, including the possible loss of all capital invested. The value of investments can go down as well as up. Past performance of any security, portfolio, or investment strategy is not indicative of future results. You should carefully consider whether investing is appropriate for your financial situation.",
  },
  {
    heading: "AI-Generated Analysis",
    body: "BUY, SELL, and HOLD signals displayed on QTI are generated algorithmically using price momentum data (specifically short-term percentage change thresholds). These signals are simplistic by design and do not account for fundamental analysis, macroeconomic factors, earnings, sector trends, management quality, or any other qualitative factors that professional analysts consider. AI analysis via Claude is generated based on limited context and should be treated as a starting point for research, not a definitive recommendation.",
  },
  {
    heading: "Market Data Accuracy",
    body: "Market data is sourced from Finnhub and may be delayed by up to 15 minutes or more. Data may contain errors, omissions, or inaccuracies. QTI makes no representations regarding the accuracy, timeliness, or completeness of any market data. Do not rely on this data for time-sensitive trading decisions.",
  },
  {
    heading: "No Regulatory Registration",
    body: "Quantum Trade Intelligence is not registered as an investment advisor, broker-dealer, or financial planning firm with the SEC, FINRA, OSC, IIROC, or any other regulatory body. Nothing on this platform creates a client relationship or imposes any fiduciary duty.",
  },
  {
    heading: "Technical Indicator Limitations",
    body: "Technical indicators such as RSI, MACD, and Bollinger Bands are mathematical tools based on historical price data. They do not predict the future. Many professional traders use these tools as one of many inputs in a broader analytical framework. Using any single indicator in isolation is generally considered poor practice.",
  },
  {
    heading: "Canadian Market Note",
    body: "CAD/USD conversion rates are provided for informational purposes and are sourced from a third-party API. The rate may not reflect the exact rate you would receive from a financial institution. TSX-listed securities (e.g., BNS.TO) are quoted in their native currency (CAD) by default on Finnhub; the conversion shown on QTI is an approximation.",
  },
  {
    heading: "Seek Professional Advice",
    body: (
      <span>
        Before making any investment decision, we strongly encourage you to consult with a licensed financial advisor, tax professional, or legal counsel as appropriate for your situation. In Canada, you can verify advisor registration at{" "}
        <a href="https://www.aretheyregistered.ca" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>aretheyregistered.ca</a>.
        In the US, verify at{" "}
        <a href="https://www.brokercheck.finra.org" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>brokercheck.finra.org</a>.
      </span>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Investment Disclaimer"
      eyebrow="Legal · Disclaimer"
      lastUpdated="April 2025"
      sections={sections}
    />
  );
}
