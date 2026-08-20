import React from 'react';

export default function SunstoneLogo({ size = 32, color = 'currentColor', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Official Sunstone Stepped Logo Geometry */}
      <path d="M12 52H64V80H12V52Z" fill={color} />
      <path d="M36 24H88V52H36V24Z" fill={color} />
      <path d="M36 48H64V56H36V48Z" fill={color} />
    </svg>
  );
}
