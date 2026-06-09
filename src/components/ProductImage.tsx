import type { Product } from '../types';
import { BRAND_INFO } from '../data/products';

interface ProductImageProps {
  product: Product;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  imageUrlOverride?: string;
}

// SVG-based product visualization with proper containment
export function ProductImage({ product, size = 'md', className = '', imageUrlOverride }: ProductImageProps) {
  // Fixed aspect ratio box so images never overflow or get cropped weirdly
  const sizeMap = {
    xs: { box: 'w-10 h-10', svg: 40 },
    sm: { box: 'w-16 h-16', svg: 60 },
    md: { box: 'w-28 h-28 sm:w-32 sm:h-32', svg: 110 },
    lg: { box: 'w-44 h-44 sm:w-52 sm:h-52', svg: 180 },
    xl: { box: 'w-64 h-64 sm:w-80 sm:h-80', svg: 260 },
    full: { box: 'w-full h-full', svg: 180 },
  };
  const { box, svg } = sizeMap[size];

  const displayUrl = imageUrlOverride || product.imageUrl;

  // Use a real image if available
  if (displayUrl) {
    return (
      <div className={`${box} relative overflow-hidden rounded-lg ${className}`}>
        <img
          src={displayUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    );
  }

  return <FallbackImage product={product} svg={svg} className={`${box} ${className}`} />;
}

function FallbackImage({ product, svg, className }: { product: Product; svg: number; className: string }) {
  const primaryColor = product.colors[0]?.hex || '#1A1A1A';
  const secondaryColor = product.colors[1]?.hex || '#3A3A3A';
  const brandInfo = BRAND_INFO[product.brand];

  const hasHandle = product.category === 'Con asa' || ['Stanley', 'YETI', 'Lululemon'].includes(product.brand);
  const hasStraw = product.category === 'Con tapa y popote' || ['Owala', 'Disney'].includes(product.brand);
  const isKids = product.category === 'Kids / Disney';
  const isAccessory = product.category === 'Accesorios';

  return (
    <div className={`${className} relative overflow-hidden rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900`}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" className="block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`body-grad-${product.id}-${svg}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightenColor(primaryColor, 20)} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={darkenColor(primaryColor, 15)} />
          </linearGradient>
          <linearGradient id={`highlight-${product.id}-${svg}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shadow under cup/accessory */}
        {!isAccessory ? (
          <ellipse cx="100" cy="180" rx="42" ry="5" fill="black" opacity="0.12" />
        ) : (
          <ellipse cx="100" cy="150" rx="28" ry="4" fill="black" opacity="0.08" />
        )}

        {isAccessory ? (
          <g>
            {/* Draw a beautiful accessory representation: a straw with a silicone cap */}
            <circle cx="100" cy="95" r="45" fill={primaryColor} opacity="0.1" />
            
            {/* Straw */}
            <rect x="96" y="55" width="8" height="85" fill="#CBD5E1" rx="2" />
            
            {/* Straw tip cap */}
            <rect x="92" y="45" width="16" height="24" fill={`url(#body-grad-${product.id}-${svg})`} rx="4" />
            {/* Cap connection loop */}
            <path d="M 108 57 Q 124 57 124 69 Q 124 81 108 81" fill="none" stroke={secondaryColor} strokeWidth="4" />
            <circle cx="108" cy="81" r="4" fill={secondaryColor} />
            
            {/* Brand text badge */}
            <rect x="70" y="110" width="60" height="20" fill="white" opacity="0.95" rx="4" />
            <text x="100" y="124" textAnchor="middle" fontSize="9" fontWeight="950" fill={brandInfo.color}>
              {brandInfo.logo.toUpperCase().slice(0, 8)}
            </text>
          </g>
        ) : isKids ? (
          <g>
            {hasStraw && <rect x="125" y="20" width="6" height="50" fill={secondaryColor} rx="2" />}
            <rect x="78" y="50" width="44" height="16" fill={darkenColor(primaryColor, 30)} rx="3" />
            <rect x="82" y="66" width="36" height="115" fill={`url(#body-grad-${product.id}-${svg})`} rx="3" />
            <rect x="86" y="110" width="28" height="24" fill="white" opacity="0.9" rx="2" />
            <text x="100" y="127" textAnchor="middle" fontSize="9" fontWeight="900" fill={brandInfo.color}>
              {brandInfo.logo.toUpperCase().slice(0, 6)}
            </text>
          </g>
        ) : hasHandle ? (
          <g>
            {hasStraw && <rect x="120" y="15" width="5" height="40" fill={secondaryColor} rx="2" />}
            <ellipse cx="100" cy="55" rx="34" ry="5" fill={darkenColor(primaryColor, 40)} />
            <rect x="66" y="48" width="68" height="10" fill={darkenColor(primaryColor, 30)} rx="2" />
            <path d="M 134 90 Q 158 115 158 130 Q 158 155 134 175" fill="none" stroke={darkenColor(primaryColor, 20)} strokeWidth="9" strokeLinecap="round" />
            <path d="M 134 90 Q 152 115 152 130 Q 152 155 134 175" fill="none" stroke={`url(#body-grad-${product.id}-${svg})`} strokeWidth="5" strokeLinecap="round" />
            <path d="M 64 58 L 136 58 L 136 178 Q 136 182 132 182 L 68 182 Q 64 182 64 178 Z" fill={`url(#body-grad-${product.id}-${svg})`} />
            <path d="M 70 62 L 76 62 L 74 175 L 68 175 Z" fill={`url(#highlight-${product.id}-${svg})`} />
            <rect x="78" y="110" width="44" height="26" fill="white" opacity="0.95" rx="2" />
            <text x="100" y="127" textAnchor="middle" fontSize="10" fontWeight="900" fill={brandInfo.color}>
              {brandInfo.logo.toUpperCase().slice(0, 6)}
            </text>
          </g>
        ) : (
          <g>
            {hasStraw && <rect x="125" y="15" width="5" height="40" fill={secondaryColor} rx="2" />}
            <ellipse cx="100" cy="50" rx="30" ry="4" fill={darkenColor(primaryColor, 40)} />
            <rect x="70" y="44" width="60" height="10" fill={darkenColor(primaryColor, 30)} rx="2" />
            <path d="M 70 54 L 130 54 L 130 178 Q 130 182 126 182 L 74 182 Q 70 182 70 178 Z" fill={`url(#body-grad-${product.id}-${svg})`} />
            <path d="M 76 58 L 82 58 L 80 175 L 74 175 Z" fill={`url(#highlight-${product.id}-${svg})`} />
            <rect x="80" y="100" width="40" height="30" fill="white" opacity="0.95" rx="2" />
            <text x="100" y="120" textAnchor="middle" fontSize="10" fontWeight="900" fill={brandInfo.color}>
              {brandInfo.logo.toUpperCase().slice(0, 6)}
            </text>
          </g>
        )}

        {/* Capacity badge */}
        {product.capacity && (
          <g>
            <rect x="62" y="162" width="76" height="16" fill="white" opacity="0.9" rx="8" />
            <text x="100" y="173" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0A1B2A">
              {product.capacity}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function lightenColor(hex: string, percent: number): string {
  return adjustColor(hex, percent);
}

function darkenColor(hex: string, percent: number): string {
  return adjustColor(hex, -percent);
}

function adjustColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
