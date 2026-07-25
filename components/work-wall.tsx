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
      alt: 'PayPal Honey — cash back, no hunting needed',
    },
  },
  {
    name: 'Pie Adblock',
    role: 'Founding engineer · owned the Safari and iOS extensions, led the Creator Network',
    scale: '2M+ users · 4.9★',
    href: RECEIPTS.pieStore,
    image: {
      src: '/work-pie.jpg',
      alt: 'Pie Adblock — premium ad blocking, for free',
    },
  },
  {
    name: 'pie.yt',
    role: 'Built and shipped it solo — the entire codebase written by AI agents I directed',
    scale: 'Live — go try it',
    href: RECEIPTS.pieYt,
    image: {
      src: '/work-pieyt.jpg',
      alt: 'pie.yt — watch any YouTube video ad-free',
    },
  },
  {
    name: 'ZeroClick',
    role: 'Agent-commerce infrastructure: APIs and MCP servers where AI agents are the customer',
    scale: '2 years in production',
    href: RECEIPTS.zeroclick,
    image: {
      src: '/work-zeroclick.jpg',
      alt: 'ZeroClick — sell your product to AI agents',
    },
  },
  {
    name: 'TrueRate',
    role: 'Chrome extension that revealed hidden hotel fees (resort, wifi, parking) on Expedia, Hotels.com, Travelocity, and Orbitz — extension, scraping API, and iOS app',
    scale: 'Built solo · 2019–2020',
    image: { src: '/truerate.png', alt: 'TrueRate showing hidden fees on a hotel listing' },
  },
  {
    name: 'Unhabit',
    role: 'iOS Safari extension that blocks distracting sites — cooldowns, scheduling, on-device privacy',
    scale: 'iOS App Store · 2023',
    href: 'https://www.tapsmart.com/features/content-blockers-guide/',
    image: {
      src: '/work-unhabit.jpg',
      alt: 'Unhabit — it hurts to be addicted; the app blocking a distracting site',
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
        Earlier: the{' '}
        <a href="https://web.archive.org/web/20260510201534/https://userexperienceawards.com/2015-submissions/mobile-majoritys-end-to-end-mobile-advertising-platform/">
          2015 UX Award–winning DSP dashboard
        </a>{' '}
        at The Mobile Majority (now Infillion),{' '}
        <a href="https://producepay.com/pre-season-financing/">
          ProducePay&rsquo;s Pre-Season financing platform
        </a>
        , and the NEES@UCSB real-time seismic data portal at{' '}
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
