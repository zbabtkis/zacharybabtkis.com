'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { SERVICE_GROUPS, calLink } from '@/lib/site';
import { ServiceIcon } from '@/components/service-icons';
import { useAutoClose } from '@/components/use-auto-close';

// Phone-only replacement for the full nav: one Menu button, one panel.
export function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  useAutoClose(ref);

  return (
    <details className="mobile-menu" ref={ref}>
      <summary>
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
        </svg>
        Menu
      </summary>
      <div
        className="nav-dropdown menu-panel"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) {
            ref.current?.removeAttribute('open');
          }
        }}
      >
        <div className="menu-scroll">
          {SERVICE_GROUPS.map((group) => (
            <div className="nav-group" key={group.key}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className="nav-icon">
                    <ServiceIcon name={item.icon} size={18} />
                  </span>
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
          <div className="menu-links">
            <Link href="/guides/">Guides</Link>
            <Link href="/tools/safari-manifest-checker/">
              Manifest Checker
            </Link>
            <Link href="/about/">About</Link>
            <Link href="/contact/">Contact</Link>
          </div>
          <a className="button menu-cta" href={calLink('nav')}>
            Book a call
          </a>
        </div>
      </div>
    </details>
  );
}
