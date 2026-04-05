const CatiLogo = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M 101.6,84 L 60,108 L 18.4,84 L 18.4,36 L 60,12 L 101.6,36 Z" fill="#111111" stroke="#111111" strokeWidth="2" strokeLinejoin="round"/>
    <line x1="24" y1="60" x2="96" y2="60" stroke="#ffffff" strokeWidth="2"/>
    <line x1="60" y1="20" x2="60" y2="100" stroke="#ffffff" strokeWidth="2"/>
    <circle cx="60" cy="60" r="11" fill="#ffffff"/>
    <circle cx="60" cy="60" r="5" fill="#111111"/>
    <circle cx="24" cy="60" r="5" fill="#ffffff"/>
    <circle cx="96" cy="60" r="5" fill="#ffffff"/>
    <circle cx="60" cy="20" r="5" fill="#ffffff"/>
    <circle cx="60" cy="100" r="5" fill="#ffffff"/>
  </svg>
);

const BrandLogo = ({ size = 36 }: { size?: number }) => (
  <div className="flex items-center gap-3">
    <CatiLogo size={size} />
    <div className="flex flex-col">
      <span className="text-sm font-semibold leading-tight">E&amp;M CMS</span>
      <span className="text-[10px] leading-tight text-muted-foreground">CATI · Hyderabad</span>
    </div>
  </div>
);

export { CatiLogo };
export default BrandLogo;
