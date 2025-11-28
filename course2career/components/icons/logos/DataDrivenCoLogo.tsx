import React from 'react';

export const DataDrivenCoLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 170 40" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="currentColor">
      <rect x="5" y="25" width="8" height="10" />
      <rect x="15" y="18" width="8" height="17" />
      <rect x="25" y="10" width="8" height="25" />
      <text x="45" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">DataDriven</text>
    </g>
  </svg>
);
