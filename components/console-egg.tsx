'use client';

import { useEffect } from 'react';

const MARK = [
  '  ███████╗',
  '  ╚══███╔╝',
  '    ███╔╝ ',
  '  ███╔╝   ',
  '  ███████╗',
  '  ╚══════╝',
].join('\n');

export function ConsoleEgg() {
  useEffect(() => {
    if (sessionStorage.getItem('egg')) return;
    sessionStorage.setItem('egg', '1');

    console.log(
      `%c${MARK}\n%cYou read consoles. I like you already.\n%cI build extensions, MCP servers, and agent harnesses for a living — and this site's source is public: https://github.com/zbabtkis/zacharybabtkis.com\nSay hi → https://zacharybabtkis.com/contact/`,
      'color: #24418e; font-weight: bold;',
      'color: #c8860a; font-size: 14px; font-weight: bold;',
      'color: #4b4f55;',
    );
  }, []);

  return null;
}
