"use client";
import LegalPage from "@/components/LegalPage";


const sections = [
  {
    heading: "1. Information We Collect",
    body: (
      <>
        <p>QTI is designed with minimal data collection as a core principle. We collect:</p>
        <ul style={{ marginTop:10, paddingLeft:20, display:"flex", flexDirection:"column", gap:6 }}>
          <li><strong style={{ color:"#f0f4ff" }}>Email address</strong> — only if you voluntarily subscribe to market updates. We never sell or share this.</li>
          <li><strong style={{ color:"#f0f4ff" }}>Usage analytics</strong> — anonymous page view data through Vercel Analytics (no personal identifiers).</li>
          <li><strong style={{ color:"#f0f4ff" }}>Search queries</strong> — ticker symbols you enter are sent to our backend to fetch market data. We do not store these long-term.</li>
          <li><strong style={{ color:"#f0f4ff" }}>AI chat messages</strong> — questions sent to the Claude AI assistant are processed by Anthropic's API and are subject to Anthropic's privacy policy. We do not store conversation history.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "2. How We Use Your Information",
    body: (
      <p>
        Email addresses are used exclusively to send the market update newsletter you requested.
        You can unsubscribe at any time by replying "unsubscribe" to any email.
        Anonymous analytics data is used to improve the platform's performance and user experience.
        We do not use your data for advertising profiling or sell it to any third parties.
      </p>
    ),
  },
  {
    heading: "3. Third-Party Services",
    body: (
      <>
        <p style={{ marginBottom:10 }}>QTI integrates with the following third-party services, each with their own privacy policies:</p>
        <ul style={{ paddingLeft:20, display:"flex", flexDirection:"column", gap:6 }}>
          <li><strong style={{ color:"#f0f4ff" }}>Finnhub</strong> — provides market data. See <a href="https://finnhub.io/privacy" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>finnhub.io/privacy</a>.</li>
          <li><strong style={{ color:"#f0f4ff" }}>Anthropic Claude</strong> — powers AI analysis. See <a href="https://anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>anthropic.com/privacy</a>.</li>
          <li><strong style={{ color:"#f0f4ff" }}>Google AdSense</strong> — displays advertisements. Google may use cookies to serve relevant ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>Google's Privacy Policy</a>.</li>
          <li><strong style={{ color:"#f0f4ff" }}>Vercel</strong> — hosts our frontend. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>vercel.com/legal/privacy-policy</a>.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "4. Cookies",
    body: (
      <p>
        QTI itself does not set tracking cookies. However, Google AdSense may set cookies on your browser
        to serve personalized or non-personalized ads. You can opt out of personalized advertising by
        visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color:"var(--gold)" }}>adssettings.google.com</a>.
        Portfolio positions and price alerts you set are stored only in your browser's memory for the
        current session and are not transmitted to our servers.
      </p>
    ),
  },
  {
    heading: "5. Data Security",
    body: (
      <p>
        All data in transit is encrypted via HTTPS/TLS. We do not maintain a user account database,
        which means there is no database of personal profiles that could be breached.
        API keys for market data and AI services are stored as server-side environment variables
        and are never exposed to the client.
      </p>
    ),
  },
  {
    heading: "6. Your Rights",
    body: (
      <p>
        If you have subscribed to our newsletter and wish to have your email address removed from
        our records, please contact us at the address below and we will delete it within 7 business days.
        If you are located in the EU (GDPR) or California (CCPA), you have additional rights regarding
        your personal data. Please contact us to exercise those rights.
      </p>
    ),
  },
  {
    heading: "7. Contact",
    body: (
      <p>
        Privacy-related inquiries can be sent to:{" "}
        <a href="mailto:privacy@quantumtradeintelligence.com" style={{ color:"var(--gold)" }}>
          privacy@quantumtradeintelligence.com
        </a>
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      eyebrow="Legal · Privacy"
      lastUpdated="April 2025"
      sections={sections}
    />
  );
}
