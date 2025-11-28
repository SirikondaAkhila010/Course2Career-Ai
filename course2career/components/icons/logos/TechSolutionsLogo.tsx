import React from 'react';

export const TechSolutionsLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="currentColor">
      <rect x="5" y="10" width="5" height="20" />
      <rect x="5" y="10" width="15" height="5" />
      <rect x="25" y="10" width="5" height="5" />
      <rect x="25" y="20" width="5" height="5" />
      <rect x="25" y="30" width="5" height="5" />
      <rect x="20" y="20" width="5" height="5" />
      <rect x="30" y="20" width="5" height="5" />
      <text x="45" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">TechSolutions</text>
    </g>
  </svg>
);
