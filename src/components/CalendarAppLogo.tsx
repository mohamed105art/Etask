import React from 'react';

interface CalendarAppLogoProps {
  size?: number;
  className?: string;
}

export const CalendarAppLogo: React.FC<CalendarAppLogoProps> = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M16 2V6M8 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" 
      stroke="#59718A" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <rect x="7" y="14" width="4" height="4" rx="1" fill="#E07A47" />
    <rect x="13" y="14" width="4" height="4" rx="1" fill="#D4A72C" />
  </svg>
);
