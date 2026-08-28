type TrendPoint = {
  label: string;
  value: number;
};

export function AnalyticsTrendChart({ data }: { data: TrendPoint[] }) {
  const width = 680;
  const height = 250;
  const padding = { top: 20, right: 18, bottom: 38, left: 42 };
  const max = Math.max(...data.map((point) => point.value), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const x = (index: number) => padding.left + (chartWidth * index) / Math.max(data.length - 1, 1);
  const y = (value: number) => padding.top + chartHeight - (value / max) * chartHeight;
  const line = data.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const area = `${padding.left},${padding.top + chartHeight} ${line} ${x(data.length - 1)},${padding.top + chartHeight}`;
  const gridValues = [0, 0.5, 1];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">Évolution des lectures</h2>
          <p className="mt-1 text-sm text-lp-gray">Lectures enregistrées sur les 14 derniers jours.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Mise à jour en direct</span>
      </div>

      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Graphique des lectures des 14 derniers jours" className="h-auto w-full">
          <defs>
            <linearGradient id="traffic-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e5242a" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#e5242a" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {gridValues.map((fraction) => {
            const gridY = padding.top + chartHeight - chartHeight * fraction;
            return (
              <g key={fraction}>
                <line x1={padding.left} x2={width - padding.right} y1={gridY} y2={gridY} stroke="#e5e7eb" strokeDasharray="4 4" />
                <text x={padding.left - 9} y={gridY + 4} textAnchor="end" fill="#6b7280" fontSize="11">{Math.round(max * fraction)}</text>
              </g>
            );
          })}
          <polygon points={area} fill="url(#traffic-area)" />
          <polyline points={line} fill="none" stroke="#e5242a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          {data.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle cx={x(index)} cy={y(point.value)} fill="white" r="4" stroke="#e5242a" strokeWidth="2.5">
                <title>{`${point.label} : ${point.value.toLocaleString("fr-FR")} lectures`}</title>
              </circle>
              {(index === 0 || index === data.length - 1 || index % 3 === 0) && (
                <text x={x(index)} y={height - 12} textAnchor="middle" fill="#6b7280" fontSize="11">{point.label}</text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-xs text-lp-gray">{data.reduce((total, point) => total + point.value, 0).toLocaleString("fr-FR")} lectures enregistrées sur cette période.</p>
    </section>
  );
}
