'use client';

import { useEffect, type RefObject } from 'react';

// Closes a <details> menu on outside pointerdown or Escape.
export function useAutoClose(ref: RefObject<HTMLDetailsElement | null>) {
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
  }, [ref]);
}
