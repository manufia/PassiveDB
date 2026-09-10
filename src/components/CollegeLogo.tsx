import React, { useState } from 'react';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dim = sizeClasses[size] || sizeClasses.md;

  if (!imgError) {
    return (
      <div className={`relative shrink-0 rounded-full overflow-hidden bg-white shadow-md border-2 border-amber-400/60 ring-1 ring-amber-500/30 ${dim} ${className}`}>
        <img
          src="/pvc-logo.jpg"
          alt="วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // High-fidelity SVG vector fallback with official Phrae Vocational College emblem motifs
  return (
    <div className={`relative shrink-0 rounded-full overflow-hidden shadow-md border-2 border-amber-400/60 ring-1 ring-amber-500/30 ${dim} ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring */}
        <circle cx="100" cy="100" r="97" fill="#ffffff" stroke="#1d4ed8" strokeWidth="4" />
        <circle cx="100" cy="100" r="91" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1.5" />

        {/* Inner Deep Blue Circle */}
        <circle cx="100" cy="100" r="68" fill="#172554" stroke="#d97706" strokeWidth="2" />

        {/* Curved Text Path */}
        <defs>
          <path
            id="topCurve"
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
          />
          <path
            id="bottomCurve"
            d="M 178 100 A 78 78 0 0 1 22 100"
            fill="none"
          />
          {/* Gold Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Top Thai Text */}
        <text fontSize="14" fontWeight="bold" fill="#1e3a8a" textAnchor="middle">
          <textPath href="#topCurve" startOffset="50%">
            วิทยาลัยอาชีวศึกษาแพร่
          </textPath>
        </text>

        {/* Bottom English Text */}
        <text fontSize="9.5" fontWeight="bold" fill="#1e3a8a" textAnchor="middle">
          <textPath href="#bottomCurve" startOffset="50%">
            PHRAE VOCATIONAL COLLEGE
          </textPath>
        </text>

        {/* Side Ornaments */}
        <circle cx="20" cy="100" r="3.5" fill="#f59e0b" />
        <circle cx="180" cy="100" r="3.5" fill="#f59e0b" />

        {/* Center Sacred Pediment and Wheel */}
        <g transform="translate(100, 100) scale(0.65)">
          {/* Outer Flame Arch */}
          <path
            d="M -35 40 C -45 10 -40 -35 0 -65 C 40 -35 45 10 35 40 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="5"
          />
          <path
            d="M -25 38 C -32 15 -28 -20 0 -45 C 28 -20 32 15 25 38 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="2.5"
          />

          {/* Dharmachakra (Wheel of Dhamma) */}
          <circle cx="0" cy="-5" r="20" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
          <circle cx="0" cy="-5" r="7" fill="url(#goldGrad)" />
          {/* Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="0"
              y1="-5"
              x2={20 * Math.cos((angle * Math.PI) / 180)}
              y2={-5 + 20 * Math.sin((angle * Math.PI) / 180)}
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
            />
          ))}

          {/* Pediment Base */}
          <rect x="-42" y="38" width="84" height="8" rx="2" fill="url(#goldGrad)" />
          <path d="M -46 46 L 46 46 L 38 56 L -38 56 Z" fill="url(#goldGrad)" />
          <rect x="-35" y="56" width="70" height="7" rx="1.5" fill="url(#goldGrad)" />

          {/* Thai Sacred Letters ส นิ ทุ ม */}
          <text x="-46" y="-15" fill="#fef08a" fontSize="16" fontWeight="bold" textAnchor="middle">ส</text>
          <text x="46" y="-15" fill="#fef08a" fontSize="16" fontWeight="bold" textAnchor="middle">นิ</text>
          <text x="-46" y="25" fill="#fef08a" fontSize="16" fontWeight="bold" textAnchor="middle">ทุ</text>
          <text x="46" y="25" fill="#fef08a" fontSize="16" fontWeight="bold" textAnchor="middle">ม</text>
        </g>
      </svg>
    </div>
  );
};
