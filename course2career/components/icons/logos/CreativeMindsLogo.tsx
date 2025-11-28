import React from 'react';

export const CreativeMindsLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="currentColor">
      <path d="M15 25 C 10 35, 30 35, 25 25 C 20 10, 20 10, 15 25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="18" r="3" />
      <text x="40" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">CreativeMinds</text>
    </g>
  </svg>
);
