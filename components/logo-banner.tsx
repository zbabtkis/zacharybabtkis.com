/**
 * Faint sliding banner of employer/product logos. Real logo assets,
 * normalized to semi-opaque monochrome in CSS (brightness(0) turns any
 * color to ink; opacity keeps it quiet). The track is duplicated for a
 * seamless loop; the copy is aria-hidden.
 */
const LOGOS: { src: string; alt: string; height: number }[] = [
  { src: '/logos/ucsb.svg', alt: 'UC Santa Barbara', height: 30 },
  { src: '/logos/infillion.png', alt: 'Infillion', height: 22 },
  { src: '/logos/producepay.svg', alt: 'ProducePay', height: 24 },
  { src: '/logos/honey.svg', alt: 'Honey', height: 26 },
  { src: '/logos/pie.svg', alt: 'Pie', height: 30 },
  { src: '/logos/zeroclick.svg', alt: 'ZeroClick', height: 22 },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="logo-row" aria-hidden={hidden || undefined}>
      {LOGOS.map((logo) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={logo.src + (hidden ? '-copy' : '')}
          src={logo.src}
          alt={hidden ? '' : logo.alt}
          style={{ height: logo.height }}
          loading="lazy"
        />
      ))}
    </div>
  );
}

export function LogoBanner() {
  return (
    <div className="logo-banner" role="img" aria-label="Companies I've worked with: UC Santa Barbara, Infillion, ProducePay, Honey, Pie, and ZeroClick">
      <div className="logo-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
