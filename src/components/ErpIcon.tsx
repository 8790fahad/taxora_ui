interface ErpIconProps {
  type: string;
  className?: string;
}

export default function ErpIcon({ type, className = 'h-10 w-10' }: ErpIconProps) {
  // Branded monogram tile for connectors that don't have a bespoke vector logo.
  const tile = (label: string, bg: string, fg = '#ffffff', fontSize = 13) => (
    <svg viewBox="0 0 48 48" className={className} aria-label={type} role="img">
      <rect width="48" height="48" rx="10" fill={bg} />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing="-0.5"
        fill={fg}
      >
        {label}
      </text>
    </svg>
  );

  switch (type) {
    case 'quickbooks':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="QuickBooks" role="img">
          <circle cx="24" cy="24" r="22" fill="#2CA01C" />
          <path
            d="M19.5 13.5a10.5 10.5 0 0 0 0 21h1.6V30.6h-1.6a6.6 6.6 0 0 1 0-13.2h1.4V13.5z"
            fill="#fff"
          />
          <path
            d="M28.5 34.5a10.5 10.5 0 0 0 0-21h-1.6V17.4h1.6a6.6 6.6 0 0 1 0 13.2h-1.4v3.9z"
            fill="#fff"
          />
        </svg>
      );
    case 'zoho':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="Zoho" role="img">
          <g transform="rotate(45 24 24)">
            <rect x="5" y="5" width="18" height="18" rx="5" fill="#E42527" />
            <rect x="25" y="5" width="18" height="18" rx="5" fill="#089949" />
            <rect x="5" y="25" width="18" height="18" rx="5" fill="#F9B21D" />
            <rect x="25" y="25" width="18" height="18" rx="5" fill="#226DB4" />
            <rect x="15" y="15" width="18" height="18" rx="5" fill="#fff" />
          </g>
        </svg>
      );
    case 'odoo':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="Odoo" role="img">
          <rect width="48" height="48" rx="10" fill="#714B67" />
          <circle cx="16" cy="27" r="5.5" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="30" cy="27" r="5.5" fill="#fff" />
          <circle cx="30" cy="27" r="2.4" fill="#714B67" />
        </svg>
      );
    case 'tally':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="TallyPrime" role="img">
          <rect width="48" height="48" rx="10" fill="#1F49E0" />
          <text
            x="24"
            y="31"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="20"
            fontWeight="700"
            fill="#ffffff"
          >
            T
          </text>
        </svg>
      );
    case 'sage':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="Sage" role="img">
          <circle cx="24" cy="24" r="22" fill="#00D639" />
          <text
            x="24"
            y="30"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="13"
            fontWeight="700"
            letterSpacing="-0.5"
            fill="#ffffff"
          >
            sage
          </text>
        </svg>
      );
    case 'flowbooks':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="FlowBooks" role="img">
          <image
            href="/brand/flowbooks-icon.png"
            x="0"
            y="0"
            width="48"
            height="48"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      );
    case 'erpnext':
      return tile('ERP', '#2490EF');
    case 'dynamics365bc':
      return tile('D365', '#0B53CE', '#ffffff', 11);
    case 'dynamics365':
      return tile('D365', '#0078D4', '#ffffff', 11);
    case 'sapb1':
      return tile('SAP', '#0FAAFF', '#003366');
    case 'saps4hana':
      return tile('SAP', '#003366');
    case 'netsuite':
      return tile('NS', '#2E4D6B', '#ffffff', 16);
    case 'oraclefusion':
      return tile('O', '#C74634', '#ffffff', 20);
    case 'sage200':
      return tile('200', '#00872B', '#ffffff', 14);
    case 'sagex3':
      return tile('X3', '#00723F', '#ffffff', 16);
    case 'xero':
      return tile('xero', '#13B5EA', '#ffffff', 11);
    case 'acumatica':
      return tile('Acu', '#00B0F0', '#ffffff', 13);
    case 'epicor':
      return tile('EPI', '#1B1B3A', '#ffffff', 13);
    case 'infor':
      return tile('Infor', '#D6002A', '#ffffff', 10);
    case 'syspro':
      return tile('SYS', '#0072CE', '#ffffff', 13);
    case 'ifs':
      return tile('IFS', '#0C1B2A', '#ffffff', 14);
    case 'katana':
      return tile('Kat', '#7C3AED', '#ffffff', 13);
    case 'mrpeasy':
      return tile('MRP', '#16A34A', '#ffffff', 13);
    case 'fishbowl':
      return tile('Fish', '#0EA5E9', '#ffffff', 11);
    case 'manual':
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} aria-label="Manual entry" role="img">
          <rect width="48" height="48" rx="10" fill="#E2E8F0" />
          <path
            d="M18 14h9l5 5v15a1 1 0 0 1-1 1H18a1 1 0 0 1-1-1V15a1 1 0 0 1 1-1z"
            fill="#fff"
            stroke="#64748B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M27 14v5h5" fill="none" stroke="#64748B" strokeWidth="1.6" strokeLinejoin="round" />
          <path
            d="M20.5 24.5h7M20.5 28h7M20.5 31.5h4"
            stroke="#0f766e"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
