import { cn } from '../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact';
  light?: boolean;
  className?: string;
}

export function Logo({ size = 'md', variant = 'full', light = false, className = '' }: LogoProps) {
  const sizes = {
    sm: { circle: 48, text: 'C3', sub: 'text-[10px]', slogan: false },
    md: { circle: 68, text: 'C3', sub: 'text-xs', slogan: true },
    lg: { circle: 80, text: 'C3', sub: 'text-sm', slogan: true },
    xl: { circle: 120, text: 'C3', sub: 'text-base', slogan: true },
  };
  const s = sizes[size];
  const subColor = light ? 'text-white/80' : 'text-[#0A1B2A]/80 dark:text-slate-300';

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: s.circle, height: s.circle }}>
        <img
          src="/C3 logo.png"
          alt="C3 Logo"
          width={s.circle}
          height={s.circle}
          className={cn(
            "absolute inset-0 object-contain transition-opacity duration-200",
            light ? "opacity-0 pointer-events-none" : "opacity-100 dark:opacity-0"
          )}
        />
        <img
          src="/Logo Blanco C3.png"
          alt="C3 Logo"
          width={s.circle}
          height={s.circle}
          className={cn(
            "absolute inset-0 object-contain transition-opacity duration-200",
            light ? "opacity-100" : "opacity-0 dark:opacity-100"
          )}
        />
      </div>
      {variant === 'full' && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold tracking-tight ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-2xl'} ${light ? 'text-white' : 'text-[#0A1B2A] dark:text-white'}`}
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
