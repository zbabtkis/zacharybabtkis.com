import { RECEIPTS } from '@/lib/site';

type WorkItem = {
  name: string;
  role: string;
  scale: string;
  href?: string;
  image?: { src: string; alt: string };
};

const WORK: WorkItem[] = [
  {
    name: 'PayPal Honey',
    role: 'Senior Staff engineer · designed and built its first iOS browser extension · $4B exit to PayPal',
    scale: '20M+ users',
    href: RECEIPTS.paypalHoney,
    image: {
      src: '/work-honey.jpg',
      alt: 'PayPal Honey marketing banner',
    },
  },
  {
    name: 'Pie Adblock',
    role: 'Founding engineer · owned the Safari and iOS extensions, led the Creator Network',
    scale: '2M+ users · 4.9★',
    href: RECEIPTS.pieStore,
    image: {
      src: '/work-pie.jpg',
      alt: 'Pie Adblock marketing banner',
    },
  },
  {
    name: 'pie.yt',
    role: 'Built and shipped it solo. AI agents I directed wrote the entire codebase.',
    scale: 'Live · try it',
    href: RECEIPTS.pieYt,
    image: {
      src: '/work-pieyt.jpg',
      alt: 'pie.yt, an ad-free YouTube viewer',
    },
  },
  {
    name: 'ZeroClick',
    role: 'Agent-commerce infrastructure: APIs and MCP servers where AI agents are the customer',
    scale: '2 years in production',
    href: RECEIPTS.zeroclick,
    image: {
      src: '/work-zeroclick.jpg',
      alt: 'ZeroClick marketing site',
    },
  },
  {
    name: 'Gimbal (Infillion)',
    role: 'Built the DSP dashboard that won a 2015 UX Award and the dashboard merchants used to manage in-store beacons. Worked on mapping human networks (friends, family, shared audiences) from beacon and geofence signals in a graph database.',
    scale: 'Location intelligence · 4 years',
    href: 'https://infillion.com/products/infillion-gimbal/',
    image: {
      src: '/work-gimbal.jpg',
      alt: 'Infillion Gimbal store-visit and beacon analytics report',
    },
  },
  {
    name: 'TrueRate',
    role: 'Chrome extension that revealed hidden hotel fees (resort, wifi, parking) on Expedia, Hotels.com, Travelocity, and Orbitz, with a scraping API and an iOS app behind it',
    scale: 'Built solo · 2019–2020',
    image: { src: '/truerate.png', alt: 'TrueRate showing hidden fees on a hotel listing' },
  },
  {
    name: 'Unhabit',
    role: 'iOS Safari extension that blocks distracting sites with cooldowns and scheduling, all on-device',
    scale: 'iOS App Store · 2023',
    href: 'https://www.tapsmart.com/features/content-blockers-guide/',
    image: {
      src: '/work-unhabit.jpg',
      alt: 'Unhabit blocking a distracting site on iPhone',
    },
  },
];

export function WorkWall({ bare = false }: { bare?: boolean }) {
  const inner = (
    <>
      <div className="work-wall">
        {WORK.map((item) => {
          const body = (
            <>
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="work-shot"
                  src={item.image.src}
                  alt={item.image.alt}
                  width={1100}
                  height={539}
                  loading="lazy"
                />
              ) : null}
              <h3>{item.name}</h3>
              <span className="work-role">{item.role}</span>
              <span className="work-scale">{item.scale}</span>
            </>
          );

          return item.href ? (
            <a className="work-tile" key={item.name} href={item.href}>
              {body}
            </a>
          ) : (
            <div className="work-tile" key={item.name}>
              {body}
            </div>
          );
        })}
      </div>
      <p className="work-wall-minor">
        Earlier:{' '}
        <a href="https://producepay.com/pre-season-financing/">
          ProducePay&rsquo;s Pre-Season financing platform
        </a>{' '}
        and the NEES@UCSB real-time seismic data portal at{' '}
        <a href="https://www.eri.ucsb.edu">
          UC Santa Barbara&rsquo;s Earth Research Institute
        </a>
        .
      </p>
    </>
  );

  if (bare) return inner;

  return (
    <section className="section">
      <div className="wrap">
        <h2>Where I&rsquo;ve shipped</h2>
        {inner}
      </div>
    </section>
  );
}
