const CatiLogo = ({ size = 30, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) => {
  // dark variant: for use on light backgrounds (deep green hex)
  // light variant: for use on dark green backgrounds (lime hex)
  const outer = variant === "light" ? "#9CCC4A" : "#1A4731";
  const inner = variant === "light" ? "#1A4731" : "#F5F6F0";
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill={outer} stroke={outer} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="24" y1="60" x2="96" y2="60" stroke={inner} strokeWidth="3"/>
      <line x1="60" y1="20" x2="60" y2="100" stroke={inner} strokeWidth="3"/>
      <circle cx="60" cy="60" r="11" fill={inner}/>
      <circle cx="60" cy="60" r="5" fill={outer}/>
      <circle cx="24" cy="60" r="5" fill={inner}/>
      <circle cx="96" cy="60" r="5" fill={inner}/>
      <circle cx="60" cy="20" r="5" fill={inner}/>
      <circle cx="60" cy="100" r="5" fill={inner}/>
    </svg>
  );
};

const BrandLogo = ({ size = 30 }: { size?: number }) => (
  <div className="flex items-center gap-2.5">
    <CatiLogo size={size} />
    <div className="flex flex-col">
      <span className="text-sm font-semibold leading-tight" style={{ color: '#1C1F1A' }}>E&amp;M CMS</span>
      <span className="text-[10px] leading-tight" style={{ color: '#64748B' }}>CATI · Hyderabad</span>
    </div>
  </div>
);

export { CatiLogo };
export default BrandLogo;
