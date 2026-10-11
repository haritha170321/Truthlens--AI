import React from 'react';

export const ConfidenceGauge = ({ score = 85, level = 'High Confidence', size = 'md' }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine color theme based on score and requirements:
  // 90-100% Very High
  // 75-89% High
  // 50-74% Uncertain
  // 25-49% Likely Misleading
  // 0-24% Likely Fake
  let strokeColor = '#6366F1'; // Brand
  let textColor = 'text-indigo-600 dark:text-indigo-400';

  if (normalizedScore >= 90) {
    strokeColor = '#10B981'; // Emerald
    textColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (normalizedScore >= 75) {
    strokeColor = '#3B82F6'; // Blue
    textColor = 'text-blue-600 dark:text-blue-400';
  } else if (normalizedScore >= 50) {
    strokeColor = '#F59E0B'; // Amber
    textColor = 'text-amber-600 dark:text-amber-400';
  } else {
    strokeColor = '#EF4444'; // Rose
    textColor = 'text-rose-600 dark:text-rose-400';
  }

  const radius = size === 'lg' ? 56 : 40;
  const strokeWidth = size === 'lg' ? 9 : 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg
          className={`transform -rotate-90 ${size === 'lg' ? 'w-36 h-36' : 'w-28 h-28'}`}
          viewBox="0 0 130 130"
        >
          {/* Background circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-2xl'} ${textColor}`}>
            {normalizedScore}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Confidence
          </span>
        </div>
      </div>

      {level && (
        <span className={`mt-2 text-xs md:text-sm font-semibold text-center ${textColor}`}>
          {level}
        </span>
      )}
    </div>
  );
};

export default ConfidenceGauge;
