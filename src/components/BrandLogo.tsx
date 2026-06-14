import { Link } from 'react-router-dom';

type BrandLogoProps = {
  variant?: 'light' | 'dark';
  compact?: boolean;
  markSize?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
  /** When set, logo + wordmark link to this route (e.g. `/` for home). */
  to?: string;
};

const sizeClass = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
};

export default function BrandLogo({
  variant = 'dark',
  compact = false,
  markSize = 'md',
  align = 'left',
  to,
}: BrandLogoProps) {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-secondary-900';
  const subTextColor = isLight ? 'text-secondary-200' : 'text-slate-500';

  const inner = (
    <>
      <LogoMark className={sizeClass[markSize]} />
      {!compact && (
        <div className={align === 'center' ? 'text-left' : ''}>
          <p className={`text-lg font-bold leading-tight tracking-tight ${textColor}`}>Taxora</p>
          <p className={`text-[11px] font-medium leading-tight ${subTextColor}`}>
            E-Invoicing Compliance
          </p>
        </div>
      )}
    </>
  );

  const className = `flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''} ${
    to ? 'transition opacity-100 hover:opacity-90' : ''
  }`;

  if (to) {
    return (
      <Link to={to} className={className} aria-label="Taxora home">
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

function LogoMark({ className }: { className: string }) {
  return (
    <svg
      className={`${className} shrink-0 drop-shadow-sm`}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Taxora"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="512" height="512" rx="112" fill="#0f766e" />
      <rect x="106" y="130" width="300" height="76" rx="18" fill="#ffffff" />
      <rect x="218" y="206" width="76" height="200" rx="18" fill="#ffffff" />
    </svg>
  );
}
