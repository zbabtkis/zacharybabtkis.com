import { RECEIPTS } from '@/lib/site';

const WORK = [
  {
    name: 'PayPal Honey',
    role: 'Senior Staff engineer · designed and built its first iOS browser extension · $4B exit to PayPal',
    scale: '20M+ users',
    href: RECEIPTS.paypalHoney,
  },
  {
    name: 'Pie Adblock',
    role: 'Founding engineer · owned the Safari and iOS extensions, led the Creator Network',
    scale: '2M+ users · 4.9★',
    href: RECEIPTS.pieStore,
  },
  {
    name: 'pie.yt',
    role: 'Built and shipped it solo — the entire codebase written by AI agents I directed',
    scale: 'Live — go try it',
    href: RECEIPTS.pieYt,
  },
  {
    name: 'ZeroClick',
    role: 'Agent-commerce infrastructure: APIs and MCP servers where AI agents are the customer',
    scale: '2 years in production',
    href: RECEIPTS.zeroclick,
  },
];

export function WorkWall() {
  return (
    <section className="section">
      <div className="wrap">
        <h2>Where I&rsquo;ve shipped</h2>
        <div className="work-wall">
          {WORK.map((item) => (
            <a className="work-tile" key={item.name} href={item.href}>
              <h3>{item.name}</h3>
              <span className="work-role">{item.role}</span>
              <span className="work-scale">{item.scale} ↗</span>
            </a>
          ))}
        </div>
        <p className="work-wall-minor">
          Earlier: real-time location advertising infrastructure at Gimbal,
          produce-supply-chain financing at ProducePay, and seismic data
          visualization at UC Santa Barbara&rsquo;s Earth Research Institute.
        </p>
      </div>
    </section>
  );
}
