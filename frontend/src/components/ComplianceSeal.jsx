const STATUS_COPY = {
  not_started: { label: 'Not started', color: 'var(--color-slate)' },
  in_progress: { label: 'In progress', color: 'var(--color-brass)' },
  compliant: { label: 'Certified', color: 'var(--color-moss)' },
  needs_attention: { label: 'Needs attention', color: 'var(--color-rust)' },
};

export default function ComplianceSeal({ score = 0, status = 'not_started' }) {
  const statusInfo = STATUS_COPY[status] || STATUS_COPY.not_started;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  // Notched seal edge: generate a scalloped circle path using small notches
  const notchCount = 24;
  const notches = Array.from({ length: notchCount }, (_, i) => {
    const angle = (i / notchCount) * 2 * Math.PI;
    const x = 64 + 62 * Math.cos(angle);
    const y = 64 + 62 * Math.sin(angle);
    return { x, y };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          {/* Notched outer seal ring */}
          <g className="rotate-90" style={{ transformOrigin: '64px 64px' }}>
            {notches.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r="2.5" fill="var(--color-brass)" opacity="0.5" />
            ))}
          </g>
          {/* Base track */}
          <circle cx="64" cy="64" r="54" fill="none" stroke="var(--color-line)" strokeWidth="6" />
          {/* Progress ring */}
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke={statusInfo.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold" style={{ color: 'var(--color-ink)' }}>
            {score}%
          </span>
          <span className="text-[10px] tracking-widest uppercase mt-1" style={{ color: 'var(--color-slate)' }}>
            Compliant
          </span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-medium tracking-wide"
        style={{
          backgroundColor: `color-mix(in srgb, ${statusInfo.color} 15%, transparent)`,
          color: statusInfo.color,
        }}
      >
        {statusInfo.label}
      </div>
    </div>
  );
}
