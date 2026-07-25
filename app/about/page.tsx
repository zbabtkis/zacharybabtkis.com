import type { Metadata } from 'next';
import { CtaBand } from '@/components/sections';
import { RECEIPTS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Zack Babtkis — independent software engineering consultant. Ex-PayPal/Honey Senior Staff engineer, ex-Pie. Twelve years shipping production software.',
};

export default function AboutPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>I&rsquo;ve been shipping production software since 2012.</h1>
        </div>
      </section>

      <section className="section">
        <div className="wrap about-layout">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-photo"
            src="/zack-portrait.jpg"
            alt="Zack Babtkis in Bilbao, in front of the Guggenheim"
            width={640}
            height={800}
          />
          <div className="prose">
            <p>
              I started in 2012 building real-time seismic data visualizations
              at UC Santa Barbara&rsquo;s Earth Research Institute — web apps
              scientists depended on for their research. From there I spent four
              years at Gimbal building location-intelligence advertising
              infrastructure: real-time microservices handling campaign
              tracking at scale, and the client-facing UIs on top of them. I
              led engineering on ProducePay&rsquo;s produce-financing platform
              before joining Honey in 2019.
            </p>
            <p>
              At <a href={RECEIPTS.paypalHoney}>Honey</a>
              {' — through its $4 billion acquisition by PayPal — '}I spent
              five years as a Senior Staff engineer on a browser extension
              used by 20 million people across 30,000+ retailers, on
              products generating hundreds of millions of dollars a year. I designed and built Honey&rsquo;s
              first iOS browser extension, ported the legacy Safari extension
              to Apple&rsquo;s modern extension API, led the effort to break
              up and test the extension monolith, and built the A/B testing
              platform that every Honey development team adopted. I also led
              integrations with PayPal&rsquo;s credit and checkout products
              through the acquisition.
            </p>
            <p>
              In 2024 one of Honey&rsquo;s co-founders invited me to help
              start <a href={RECEIPTS.pieStore}>Pie</a>, a free ad blocker
              that grew past two million users.
              I led the Creator Network — a system letting YouTube creators
              partner with Pie so supporters could choose to unblock their
              ads — and owned the iOS and Safari extensions end to end:
              Swift, Xcode Cloud deployment, and Safari&rsquo;s
              content-blocking APIs. When the company became ZeroClick and
              pivoted to building infrastructure for AI-agent commerce, I
              built agent-facing APIs and MCP servers, and shipped the
              company&rsquo;s first product built entirely through AI-agent
              development — <a href={RECEIPTS.pieYt}>pie.yt</a>, an ad-free
              YouTube viewer I owned from conception to launch.
            </p>
            <p>
              I&rsquo;ve also built products of my own. TrueRate was a
              Chrome extension that exposed the hidden fees — resort, wifi,
              parking — buried in hotel listings on Expedia, Hotels.com,
              Travelocity, and Orbitz; I built it solo, from the extension
              to the scraping API behind it to an iOS app.{' '}
              <a href="https://unhabit.en.softonic.com/iphone">Unhabit</a>{' '}
              is an iOS Safari extension that blocks distracting sites with
              cooldowns and scheduling, all on-device. I designed, built,
              and shipped both alone.
            </p>
            <p>
              Now I consult independently from Los Angeles. Most of my career
              has been platform work — extension APIs, Apple&rsquo;s
              toolchain, agent protocols — built into products that millions
              of people use. I like small teams, clear scopes, and shipping.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Want the longer version?"
        body="My LinkedIn has the full history, and I'm happy to walk through any of it on a call. If you're evaluating me for a project, ask me anything, including for references."
        emailSubject="Hello from your About page"
        source="about"
      />
    </>
  );
}
