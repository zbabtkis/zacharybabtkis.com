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

  // Title-less thumbnail for the guides index (the text title renders
  // beside it in HTML, so the art must not repeat it). Composition varies
  // deterministically per slug so cards within a topic don't look cloned.
  const seed = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const motifs = ['rings', 'dots', 'rules', 'none'];
  const motif = motifs[seed % motifs.length];
  const glyphX = [430, 620, 810][(seed >> 2) % 3];
  const glyphScale = 9 + ((seed >> 4) % 4); // 9-12
  const accentX = [0, 1190][(seed >> 6) % 2];

  let motifSvg = '';
  if (motif === 'rings') {
    motifSvg = [90, 150, 210]
      .map((r) => `<circle cx="${glyphX + glyphScale * 12}" cy="240" r="${r}" fill="none" stroke="${PALETTE.rule}" stroke-width="2"/>`)
      .join('');
  } else if (motif === 'dots') {
    const dots = [];
    for (let dx = 0; dx < 6; dx++)
      for (let dy = 0; dy < 4; dy++)
        dots.push(`<circle cx="${880 + dx * 52}" cy="${70 + dy * 52}" r="4" fill="${PALETTE.rule}"/>`);
    motifSvg = dots.join('');
  } else if (motif === 'rules') {
    motifSvg = [0, 1, 2, 3]
      .map((i) => `<line x1="${900 + i * 64}" y1="480" x2="${1100 + i * 64}" y2="280" stroke="${PALETTE.rule}" stroke-width="2"/>`)
      .join('');
  }

  const thumbSvg = `<svg width="1200" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="480" fill="${PALETTE.paper}"/>
  ${motifSvg}
  <rect x="0" y="0" width="1200" height="10" fill="${PALETTE.amber}"/>
  <rect x="${accentX}" y="0" width="10" height="480" fill="${PALETTE.amber}" opacity="0.5"/>
  <text x="64" y="110" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="7" fill="${PALETTE.amber}">${esc(meta.label)}</text>
  <g transform="translate(${glyphX}, ${290 - glyphScale * 12}) scale(${glyphScale})" fill="none" stroke="${PALETTE.navy}" stroke-width="1.3" opacity="0.9">${glyph}</g>
  <line x1="64" y1="410" x2="400" y2="410" stroke="${PALETTE.rule}" stroke-width="2"/>
  <text x="64" y="446" font-family="Georgia, serif" font-size="26" font-weight="700" fill="${PALETTE.ink}" opacity="0.75">Zack Babtkis</text>
</svg>`;
  const thumbOut = join(
    SITE_DIR,
    'public/guide-thumbs',
    slug.replace(/^\/|\/$/g, '').replace(/\//g, '--') + '.png',
  );
  mkdirSync(dirname(thumbOut), { recursive: true });
  await sharp(Buffer.from(thumbSvg)).resize(600, 240).png().toFile(thumbOut);
  console.log('card:', slug);
}

for (const entry of entries) {
  await makeCard(entry);
}
