import React from 'react';

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  score,
  size = 56,
  strokeWidth = 4.5,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const gradientId = `matchGradient-${Math.floor(Math.random() * 10000)}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 origin-center" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B7F36B" />
            <stop offset="100%" stopColor="#A5E653" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2B322A"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>

      {/* Percentage Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-xs text-[#F4F6F1] tracking-tighter">
          {score}%
        </span>
      </div>
    </div>
  );
};
