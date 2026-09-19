import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'white';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'dark',
}) => {
  const uniqueId = useId().replace(/:/g, '');

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const textColor =
    variant === 'white'
      ? 'text-white'
      : variant === 'light'
      ? 'text-emerald-100'
      : 'text-slate-900 dark:text-white';

  const primaryGradId = `primaryGrad_${uniqueId}`;
  const accentGradId = `accentGrad_${uniqueId}`;
  const bridgeGradId = `bridgeGrad_${uniqueId}`;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Premium Multi-Leaf & Agricultural Bridge Emblem */}
      <div
        className={`${iconSizes[size]} flex items-center justify-center shrink-0 drop-shadow-xs transition-transform duration-200 hover:scale-105`}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={primaryGradId} x1="6" y1="38" x2="38" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B5428" />
              <stop offset="55%" stopColor="#0D6832" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id={accentGradId} x1="14" y1="36" x2="36" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="50%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>
            <linearGradient id={bridgeGradId} x1="4" y1="38" x2="40" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B5428" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#0B5428" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Foundation / 'Setu' Bridge Curve */}
          <path
            d="M5 37C11 31.5 33 31.5 39 37"
            stroke={`url(#${bridgeGradId})`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Central Vital Stem */}
          <path
            d="M22 35V16C22 10.5 26.5 5 35 5C35 13 29.5 17.5 22 17.5"
            stroke={`url(#${primaryGradId})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Main Agricultural Leaf */}
          <path
            d="M22 24C13.5 24 8 18 8 10.5C15.5 10.5 22 16.5 22 24Z"
            fill={`url(#${primaryGradId})`}
          />

          {/* Right Sprouting Leaf */}
          <path
            d="M22 17.5C22 10.5 27.5 5 35 5C35 12 30 17.5 22 17.5Z"
            fill={`url(#${accentGradId})`}
          />

          {/* Left Lower Sprout */}
          <path
            d="M22 30.5C15.5 30.5 11.5 26 11.5 21C16.5 21 22 25 22 30.5Z"
            fill={`url(#${primaryGradId})`}
            fillOpacity="0.88"
          />

          {/* Golden Seed / Sun Spark */}
          <circle cx="22" cy="11.5" r="2.2" fill="#F59E0B" />
        </svg>
      </div>

      {showText && (
        <div
          className={`font-black tracking-tight ${textSizes[size]} ${textColor} font-['Public_Sans'] flex items-center gap-0.5`}
        >
          <span className="font-extrabold tracking-tight">Agri</span>
          <span className="text-[#0D6832] dark:text-emerald-400 font-black">Setu</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D6832] dark:bg-emerald-400 ml-0.5 self-end mb-1.5" />
        </div>
      )}
    </div>
  );
};


