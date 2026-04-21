interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
}

export default function MetricCard({ label, value, delta, deltaPositive }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && (
        <div className="metric-delta" style={{ color: deltaPositive ? "var(--green)" : "var(--red)" }}>
          {deltaPositive ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}
