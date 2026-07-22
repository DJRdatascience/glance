interface WeatherIconProps {
  icon: string;
  isDay?: boolean;
  className?: string;
}

function Sun({ className }: { className?: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    return {
      x1: 32 + Math.cos(angle) * 20,
      y1: 32 + Math.sin(angle) * 20,
      x2: 32 + Math.cos(angle) * 27,
      y2: 32 + Math.sin(angle) * 27,
    };
  });

  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle cx="32" cy="32" r="14" fill="currentColor" />
      {rays.map((r, i) => (
        <line
          key={i}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M40 12a20 20 0 1 0 12 32 16 16 0 0 1-12-32z" fill="currentColor" />
    </svg>
  );
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <g fill="currentColor">
        <circle cx="24" cy="34" r="12" />
        <circle cx="36" cy="28" r="16" />
        <circle cx="46" cy="36" r="10" />
        <rect x="16" y="34" width="38" height="16" rx="8" />
      </g>
    </svg>
  );
}

function Lightning({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M34 40 L26 52 L32 52 L28 60 L40 46 L33 46 Z" fill="#facc15" />
    </svg>
  );
}

function Drops({ count, color }: { count: number; color: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex translate-y-1 justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`block h-3 w-1.5 rounded-full ${color}`} />
      ))}
    </div>
  );
}

export default function WeatherIcon({ icon, isDay = true, className = "h-16 w-16" }: WeatherIconProps) {
  switch (icon) {
    case "clear":
      return isDay ? (
        <Sun className={`text-amber-400 ${className}`} />
      ) : (
        <Moon className={`text-slate-200 ${className}`} />
      );

    case "partly-cloudy":
      return (
        <div className={`relative ${className}`}>
          <div className="absolute inset-0 -translate-x-2 -translate-y-2 scale-75">
            {isDay ? <Sun className="text-amber-400 h-full w-full" /> : <Moon className="text-slate-200 h-full w-full" />}
          </div>
          <div className="absolute inset-0 translate-x-2 translate-y-3 scale-90">
            <Cloud className="text-slate-300 h-full w-full" />
          </div>
        </div>
      );

    case "cloudy":
      return <Cloud className={`text-slate-300 ${className}`} />;

    case "fog":
      return (
        <div className={`flex flex-col justify-center gap-1.5 ${className}`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-slate-300/80"
              style={{ width: `${80 - i * 15}%` }}
            />
          ))}
        </div>
      );

    case "drizzle":
    case "rain":
    case "freezing-rain":
      return (
        <div className={`relative ${className}`}>
          <Cloud className="text-slate-300 h-full w-full" />
          <Drops count={3} color="bg-sky-400" />
        </div>
      );

    case "snow":
      return (
        <div className={`relative ${className}`}>
          <Cloud className="text-slate-300 h-full w-full" />
          <div className="absolute bottom-0 left-0 right-0 flex translate-y-1 justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-1.5 w-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>
      );

    case "thunderstorm":
      return (
        <div className={`relative ${className}`}>
          <Cloud className="text-slate-400 h-full w-full" />
          <Lightning className="absolute inset-0 h-full w-full" />
        </div>
      );

    default:
      return <Cloud className={`text-slate-300 ${className}`} />;
  }
}
