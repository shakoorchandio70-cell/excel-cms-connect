const CatiLogo = ({ size = 30 }: { size?: number }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M101.6,84 L60,108 L18.4,84 L18.4,36 L60,12 L101.6,36 Z" fill="#65A30D" stroke="#65A30D" strokeWidth="2" strokeLinejoin="round"/>
    <line x1="24" y1="60" x2="96" y2="60" stroke="#F7F8F4" strokeWidth="3"/>
    <line x1="60" y1="20" x2="60" y2="100" stroke="#F7F8F4" strokeWidth="3"/>
    <circle cx="60" cy="60" r="11" fill="#F7F8F4"/>
    <circle cx="60" cy="60" r="5" fill="#65A30D"/>
    <circle cx="24" cy="60" r="5" fill="#F7F8F4"/>
    <circle cx="96" cy="60" r="5" fill="#F7F8F4"/>
    <circle cx="60" cy="20" r="5" fill="#F7F8F4"/>
    <circle cx="60" cy="100" r="5" fill="#F7F8F4"/>
  </svg>
);

const BrandLogo = ({ size = 30 }: { size?: number }) => (
  <div className="flex items-center gap-2.5">
    <CatiLogo size={size} />
    <div className="flex flex-col">
      <span className="text-sm font-semibold leading-tight" style={{ color: '#0F1F17' }}>E&amp;M CMS</span>
      <span className="text-[10px] leading-tight" style={{ color: '#94A3B8' }}>CATI · Hyderabad</span>
    </div>
  </div>
);

export { CatiLogo };
export default BrandLogo;
