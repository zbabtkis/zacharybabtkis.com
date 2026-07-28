import type { Metadata } from 'next';
import { CtaBand } from '@/components/sections';
import { GUIDES, TOPIC_LABELS, type Guide } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Engineering guides on Safari extension porting, MCP development, and AI-agent engineering, written from shipping the work at Honey, Pie, and ZeroClick.',
};

export default function GuidesPage() {
  const topics = [...new Set(GUIDES.map((guide) => guide.topic))];

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Guides</h1>
          <p className="lede">
            Written from shipping the work, not from the docs. If a guide
            answers your question completely, take the answer and go.
            There is no gate and no email wall. If it tells you that your
            problem is bigger than an afternoon, that&rsquo;s what
            I&rsquo;m for.
          </p>
        </div>
      </section>

      {topics.map((topic) => (
        <section className="section" key={topic}>
          <div className="wrap">
            <h2>{TOPIC_LABELS[topic]}</h2>
            <ul className="guide-cards">
              {GUIDES.filter((guide: Guide) => guide.topic === topic).map(
                (guide) => (
                  <li key={guide.slug}>
                    <a href={guide.slug}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/guide-thumbs/${guide.slug
                          .replace(/^\/|\/$/g, '')
                          .replace(/\//g, '--')}.png`}
                        alt=""
                        width={600}
                        height={240}
                        loading="lazy"
                      />
                      <strong>{guide.title}</strong>
                      <span>{guide.blurb}</span>
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      ))}

      <CtaBand
        title="Reading because something's broken?"
        body="Tell me what you're building and where it's stuck. Every engagement starts with a fixed-price assessment, and the guides above are a fair preview of how I think."
        emailSubject="Project inquiry"
        source="guides"
      />
    </>
  );
}
