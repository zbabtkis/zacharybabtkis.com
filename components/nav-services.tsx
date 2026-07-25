'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { SERVICE_GROUPS } from '@/lib/site';
import { ServiceIcon } from '@/components/service-icons';
import { useAutoClose } from '@/components/use-auto-close';

export function NavServices() {
  const ref = useRef<HTMLDetailsElement>(null);
  useAutoClose(ref);

  return (
    <details className="nav-services" ref={ref}>
      <summary>Services</summary>
      <div
        className="nav-dropdown nav-mega"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) {
            ref.current?.removeAttribute('open');
          }
        }}
      >
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
      </div>
    </details>
  );
}
