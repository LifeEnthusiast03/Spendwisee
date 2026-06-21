

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: number;
  theme?: 'dark' | 'light';
  className?: string;
}

export default function Logo({
  variant = 'full',
  size = 32,
  theme = 'dark',
  className = '',
}: LogoProps) {
  // Theme colors matching the App.css design tokens
  const isDark = theme === 'dark';
  
  // The badge background (outer squircle)
  const badgeFill = isDark ? 'var(--sw-accent)' : 'var(--sw-text)';
  
  // The interior elements (arrow/line cutouts)
  const strokeColor = isDark ? '#060d1c' : '#ffffff';

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="sw-logo-svg"
      style={{ flexShrink: 0 }}
    >
      {/* Background Badge */}
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill={badgeFill} />
      
      {/* Upward Trend Line */}
      <polyline
        points="6,16 10,12 13,14 17,9"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow Head */}
      <polyline
        points="13,9 17,9 17,13"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`sw-logo-container ${className}`}>{icon}</div>;
  }

  // Full Wordmark
  const textColor = isDark ? 'var(--sw-text)' : 'var(--sw-text)'; // Assuming text is dark navy on both mostly, but let's inherit.
  
  return (
    <div
      className={`sw-logo-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${size * 0.25}px`,
        textDecoration: 'none',
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: `${size * 0.7}px`,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: textColor,
          // Add the subtle gradient from the chat page header for extra pop if we want,
          // but solid is safer for logo. Let's stick to solid text by default.
        }}
      >
        SpendWise
      </span>
    </div>
  );
}
