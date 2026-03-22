export function getFallbackProductImage(label: string) {
  const safeLabel = encodeURIComponent(label || "DermEase Product");

  return `data:image/svg+xml;utf8,
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
      <rect width='600' height='600' fill='%23f7efe6'/>
      <circle cx='300' cy='220' r='88' fill='%23dcb7a2'/>
      <rect x='214' y='300' width='172' height='132' rx='28' fill='%23b56a4c'/>
      <rect x='246' y='166' width='108' height='54' rx='18' fill='%23fff7f0'/>
      <text x='300' y='490' text-anchor='middle' font-size='30' font-family='Arial, sans-serif' fill='%2365463e'>
        ${safeLabel}
      </text>
    </svg>`.replace(/\n/g, "");
}

