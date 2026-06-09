interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact';
  light?: boolean;
  className?: string;
}

export function Logo({ size = 'md', variant = 'full', light = false, className = '' }: LogoProps) {
  const sizes = {
    sm: { circle: 36, text: 'C3', sub: 'text-[9px]', slogan: false },
    md: { circle: 56, text: 'C3', sub: 'text-xs', slogan: true },
    lg: { circle: 80, text: 'C3', sub: 'text-sm', slogan: true },
    xl: { circle: 120, text: 'C3', sub: 'text-base', slogan: true },
  };
  const s = sizes[size];
  const subColor = light ? 'text-white/80' : 'text-[#0A1B2A]/80';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 120 120" width={s.circle} height={s.circle} className="shrink-0">
        <defs>
          <linearGradient id={`logo-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="20%" stopColor="#F09819" />
            <stop offset="45%" stopColor="#00BFA6" />
            <stop offset="70%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke={`url(#logo-grad-${size})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="240 70"
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="74"
          textAnchor="middle"
          fontFamily="Arial Black, sans-serif"
          fontSize="40"
          fontWeight="900"
          fill={light ? '#FFFFFF' : '#0A1B2A'}
        >
          C3
        </text>
      </svg>
      {variant === 'full' && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold tracking-tight ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-2xl'} ${light ? 'text-white' : 'text-[#0A1B2A]'}`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            C3
          </span>
          {s.slogan && (
            <span className={`${s.sub} font-medium ${subColor}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              Tu idea, tu estilo.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
