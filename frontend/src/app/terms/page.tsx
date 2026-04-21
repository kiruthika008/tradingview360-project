"use client";
import LegalPage from "@/components/LegalPage";


const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: "By accessing or using Quantum Trade Intelligence (\"QTI\", \"we\", \"our\", \"the platform\"), you agree to be bound by these Terms of Use. If you do not agree, please discontinue use of the platform immediately. These terms apply to all visitors, users, and others who access the service.",
  },
  {
    heading: "2. Description of Service",
    body: "QTI provides a free, web-based platform for accessing stock market data, AI-generated analysis, technical indicators, and portfolio tracking tools. The service is provided \"as is\" and is intended for informational and educational purposes only. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without notice.",
  },
  {
    heading: "3. Not Financial Advice",
    body: "Nothing on QTI constitutes investment, financial, legal, or tax advice. All content, including BUY/SELL/HOLD signals, AI-generated analysis, technical indicators, news summaries, and any other information, is provided for educational and informational purposes only. You should not make any investment decision based solely on information from this platform. Always consult a qualified, licensed financial advisor before making investment decisions.",
  },
  {
    heading: "4. No Warranties",
    body: "QTI is provided on an \"as is\" and \"as available\" basis without any warranties of any kind, either express or implied. We do not warrant that: (a) the service will be uninterrupted or error-free; (b) market data will be accurate, complete, or up-to-date; (c) AI-generated analysis will be accurate or suitable for any purpose; (d) the platform will be free from bugs, viruses, or other harmful components.",
  },
  {
    heading: "5. Limitation of Liability",
    body: "To the maximum extent permitted by applicable law, QTI and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, or financial losses arising from your use of, or inability to use, the platform or any information contained therein.",
  },
  {
    heading: "6. Permitted Use",
    body: "You may use QTI for personal, non-commercial purposes. You agree not to: scrape or systematically download data from the platform; use the service to build competing products; attempt to reverse engineer any portion of the service; use automated tools to access the platform in a manner that places excessive load on our servers; or use the platform for any unlawful purpose.",
  },
  {
    heading: "7. Third-Party Data",
    body: "Market data is sourced from Finnhub and is subject to their terms of service. AI analysis is powered by Anthropic Claude. QTI is not responsible for the accuracy, completeness, or timeliness of data provided by these third parties.",
  },
  {
    heading: "8. Modifications",
    body: "We reserve the right to update these Terms of Use at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We will update the \"Last updated\" date at the top of this page when changes are made.",
  },
  {
    heading: "9. Governing Law",
    body: "These terms shall be governed by and construed in accordance with the laws of the Province of Ontario, Canada, without regard to its conflict of law provisions.",
  },
  {
    heading: "10. Contact",
    body: (
      <span>
        Questions about these terms? Contact us at{" "}
        <a href="mailto:legal@quantumtradeintelligence.com" style={{ color:"var(--gold)" }}>
          legal@quantumtradeintelligence.com
        </a>
      </span>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      eyebrow="Legal · Terms"
      lastUpdated="April 2025"
      sections={sections}
    />
  );
}
