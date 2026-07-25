'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { SERVICE_GROUPS } from '@/lib/site';
import { ServiceIcon } from '@/components/service-icons';

export function NavServices() {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => ref.current?.removeAttribute('open');
    const onPointerDown = (event: PointerEvent) => {
      if (
        ref.current?.open &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        close();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

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
