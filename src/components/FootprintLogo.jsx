import React from 'react';

/**
 * Custom CarbonIQ Logo — Footprint with CO₂ 
 * A carbon footprint icon with a small CO₂ label
 */
export default function FootprintLogo({ size = 24, glowColor = 'hsl(186, 94%, 62%)' }) {
  const scale = size / 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 4px ${glowColor}44)` }}
    >
      {/* Footprint shape */}
      <path
        d="M12 2C10.5 2 9.5 3.2 9.5 4.8C9.5 6.4 10.5 7.5 12 7.5C13.5 7.5 14.5 6.4 14.5 4.8C14.5 3.2 13.5 2 12 2Z"
        fill={glowColor}
        opacity="0.9"
      />
      {/* Left toe */}
      <path
        d="M8.5 3.5C7.8 3.5 7.2 4 7.2 4.8C7.2 5.6 7.8 6 8.5 6C9.2 6 9.5 5.5 9.5 4.8C9.5 4.1 9.2 3.5 8.5 3.5Z"
        fill={glowColor}
        opacity="0.7"
      />
      {/* Right toe */}
      <path
        d="M15.5 3.5C14.8 3.5 14.5 4.1 14.5 4.8C14.5 5.5 14.8 6 15.5 6C16.2 6 16.8 5.6 16.8 4.8C16.8 4 16.2 3.5 15.5 3.5Z"
        fill={glowColor}
        opacity="0.7"
      />
      {/* Foot sole */}
      <path
        d="M8 8.5C7 8.5 6 9.5 6 11.5C6 14 7.5 16.5 9 17.5C10 18.2 11 18.5 12 18.5C13 18.5 14 18.2 15 17.5C16.5 16.5 18 14 18 11.5C18 9.5 17 8.5 16 8.5C14.5 8.5 13.5 9 12 9C10.5 9 9.5 8.5 8 8.5Z"
        fill={glowColor}
        opacity="0.85"
      />
      {/* CO₂ text */}
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fontSize="4.5"
        fontWeight="800"
        fontFamily="var(--font-heading), sans-serif"
        fill="hsl(210, 60%, 4%)"
        letterSpacing="-0.3"
      >
        CO₂
      </text>
      {/* Small cloud wisps */}
      <circle cx="5" cy="20" r="1.2" fill={glowColor} opacity="0.3" />
      <circle cx="7.5" cy="21" r="1.5" fill={glowColor} opacity="0.25" />
      <circle cx="10" cy="20.5" r="1" fill={glowColor} opacity="0.2" />
    </svg>
  );
}
