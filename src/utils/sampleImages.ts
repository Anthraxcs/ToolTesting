// Helper to generate sample receipt image data URLs for quick testing

export const generateSampleReceiptSvg = (vendor: string, amount: string, date: string, items: string[]): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550" style="background:#fcfbf9; font-family: monospace; color: #1e293b;">
    <rect width="400" height="550" fill="#fcfbf9"/>
    <path d="M 0,0 L 400,0 L 400,550 L 0,550 Z" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Jagged edge bottom visual -->
    <path d="M 0 540 Q 10 550, 20 540 T 40 540 T 60 540 T 80 540 T 100 540 T 120 540 T 140 540 T 160 540 T 180 540 T 200 540 T 220 540 T 240 540 T 260 540 T 280 540 T 300 540 T 320 540 T 340 540 T 360 540 T 380 540 T 400 540 L 400 550 L 0 550 Z" fill="#e2e8f0"/>

    <g transform="translate(40, 50)">
      <!-- Header -->
      <text x="160" y="20" font-size="20" font-weight="bold" text-anchor="middle" fill="#0f172a">${vendor.toUpperCase()}</text>
      <text x="160" y="40" font-size="12" text-anchor="middle" fill="#64748b">123 BUSINESS PARK, SUITE 400</text>
      <text x="160" y="55" font-size="12" text-anchor="middle" fill="#64748b">TEL: (555) 019-2834</text>

      <line x1="0" y1="75" x2="320" y2="75" stroke="#cbd5e1" stroke-dasharray="4 4"/>
      
      <!-- Receipt info -->
      <text x="0" y="95" font-size="12">DATE: ${date}</text>
      <text x="0" y="110" font-size="12">REF #: RCT-${Math.floor(Math.random() * 89999 + 10000)}</text>
      <text x="0" y="125" font-size="12">PAYMENT: VISA **** 4821</text>

      <line x1="0" y1="140" x2="320" y2="140" stroke="#cbd5e1" stroke-dasharray="4 4"/>
      
      <!-- Items -->
      <text x="0" y="160" font-size="13" font-weight="bold">ITEM DESCRIPTION</text>
      <text x="320" y="160" font-size="13" font-weight="bold" text-anchor="end">PRICE</text>

      ${items.map((item, idx) => `
        <text x="0" y="${185 + idx * 25}" font-size="12">${item.split(':')[0]}</text>
        <text x="320" y="${185 + idx * 25}" font-size="12" text-anchor="end">${item.split(':')[1]}</text>
      `).join('')}

      <line x1="0" y1="${190 + items.length * 25}" x2="320" y2="${190 + items.length * 25}" stroke="#94a3b8"/>

      <!-- Totals -->
      <g transform="translate(0, ${210 + items.length * 25})">
        <text x="160" y="0" font-size="12" text-anchor="end">SUBTOTAL:</text>
        <text x="320" y="0" font-size="12" text-anchor="end">$${(parseFloat(amount) * 0.9).toFixed(2)}</text>

        <text x="160" y="20" font-size="12" text-anchor="end">TAX (10%):</text>
        <text x="320" y="20" font-size="12" text-anchor="end">$${(parseFloat(amount) * 0.1).toFixed(2)}</text>

        <line x1="160" y1="30" x2="320" y2="30" stroke="#0f172a" stroke-width="2"/>

        <text x="160" y="50" font-size="16" font-weight="bold" text-anchor="end">TOTAL:</text>
        <text x="320" y="50" font-size="18" font-weight="bold" fill="#2563eb" text-anchor="end">$${amount}</text>
      </g>

      <!-- Footer -->
      <text x="160" y="${300 + items.length * 25}" font-size="11" text-anchor="middle" fill="#64748b">THANK YOU FOR YOUR BUSINESS!</text>
      <text x="160" y="${315 + items.length * 25}" font-size="10" text-anchor="middle" fill="#94a3b8">KEEP FOR YOUR EXPENSE RECORDS</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
