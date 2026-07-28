// Generates the branded headline card for every guide in lib/guides.ts.
// Each card is written to app/<slug>/opengraph-image.png (1200x630) and
// doubles as the guide's thumbnail. Rerun after adding or retitling guides:
//   node scripts/gen-headline-cards.mjs
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const SITE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(SITE_DIR, 'lib/guides.ts'), 'utf8');

const entries = [...src.matchAll(
  /slug:\s*'([^']+)',\s*title:\s*(?:'((?:[^'\\]|\\')*)'|"((?:[^"\\]|\\")*)")[\s\S]*?topic:\s*'([^']+)'/g,
)].map((m) => ({
  slug: m[1],
  title: (m[2] ?? m[3]).replace(/\\'/g, "'").replace(/\\"/g, '"'),
  topic: m[4],
}));
console.log('guides found:', entries.length);

const PALETTE = {
  paper: '#faf9f6',
  ink: '#1c1e21',
  navy: '#24418e',
  amber: '#c8860a',
  rule: '#e4e1da',
};

const TOPIC_META = {
  'safari-extensions': {
    label: 'SAFARI & IOS EXTENSIONS',
    // compass
    glyph:
      '<circle cx="12" cy="12" r="9"/><path d="M16.5 7.5 L13.5 13.5 L7.5 16.5 L10.5 10.5 Z" fill="CURRENT" stroke="none"/>',
  },
  'mcp-development': {
    label: 'MCP DEVELOPMENT',
    // plug
    glyph:
      '<path d="M9 7 V4.5 M15 7 V4.5" stroke-linecap="round"/><rect x="6" y="7" width="12" height="8" rx="2"/><path d="M12 15 V19 M8 19 H16" stroke-linecap="round"/>',
  },
  'ai-agent-enablement': {
    label: 'AI-AGENT ENGINEERING',
    // terminal
    glyph:
      '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M7 9.5 L10 12 L7 14.5 M12 15 H16.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
};

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(title, max = 24) {
  const words = title.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

async function makeCard({ slug, title, topic }) {
  const meta = TOPIC_META[topic];
  const lines = wrap(title);
  const titleSize = lines.length > 3 ? 54 : 62;
  const lineHeight = titleSize * 1.18;
  const titleY = 250;
  const glyph = meta.glyph.replaceAll('CURRENT', PALETTE.navy);

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${PALETTE.paper}"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="${PALETTE.rule}" stroke-width="2"/>
  <rect x="24" y="24" width="1152" height="8" fill="${PALETTE.amber}"/>
  <text x="72" y="120" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="6" fill="${PALETTE.amber}">${esc(meta.label)}</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="72" y="${titleY + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" font-weight="700" fill="${PALETTE.ink}">${esc(line)}</text>`,
    )
    .join('\n  ')}
  <g transform="translate(960, 380) scale(7)" fill="none" stroke="${PALETTE.navy}" stroke-width="1.4" opacity="0.9">${glyph}</g>
  <text x="72" y="552" font-family="Georgia, serif" font-size="30" font-weight="700" fill="${PALETTE.ink}">Zack Babtkis</text>
  <text x="72" y="584" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="${PALETTE.navy}">zacharybabtkis.com</text>
</svg>`;

  const out = join(SITE_DIR, 'app', slug.replace(/^\/|\/$/g, ''), 'opengraph-image.png');
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(out);

  // The guides-index thumbnail used to be generated here. It is now the
  // engraving plate from gen-guide-art.mjs, which writes the same path, so
  // this script must not touch public/guide-thumbs.

  console.log('card:', slug);
}

for (const entry of entries) {
  await makeCard(entry);
}
