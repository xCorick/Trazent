const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Genera una "foto" simulada (SVG) para el prototipo, sin depender de imágenes externas.
 */
export function photoPlaceholder(label: string, hue = 218): string {
  const windows = Array.from({ length: 12 }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return `<rect x="${305 + col * 55}" y="${205 + row * 60}" width="34" height="38" rx="4"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},62%,64%)"/><stop offset="1" stop-color="hsl(${hue + 18},64%,30%)"/>
</linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<circle cx="640" cy="120" r="56" fill="#ffffff" fill-opacity="0.22"/>
<g fill="#ffffff" fill-opacity="0.16">
<rect x="90" y="260" width="170" height="340" rx="6"/><rect x="280" y="170" width="210" height="430" rx="6"/><rect x="515" y="300" width="200" height="300" rx="6"/>
</g>
<g fill="#ffffff" fill-opacity="0.3">${windows}</g>
<rect x="0" y="468" width="800" height="132" fill="#071D47" fill-opacity="0.45"/>
<text x="40" y="530" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="600" fill="#ffffff">${escapeXml(label)}</text>
<text x="40" y="568" font-family="Inter, Arial, sans-serif" font-size="22" fill="#ffffff" fill-opacity="0.8">Foto simulada · Trazent</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
