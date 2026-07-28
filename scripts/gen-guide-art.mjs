// Generates the engraving-style art for every guide.
//
//   node scripts/gen-guide-art.mjs            # generate anything missing
//   node scripts/gen-guide-art.mjs --slug=... # regenerate one guide
//   node scripts/gen-guide-art.mjs --process  # re-cut from cached raws, no spend
//
// Each guide gets one base image from FLUX Schnell via Zero, cached in the
// gitignored scratchpad so re-cropping and restyling never re-pays. The raw
// generation is then forced into the site's two colors: it becomes an alpha
// mask, navy is painted through it onto cream paper, and the category glyph
// is stamped as a corner seal. The model's own palette never reaches a page,
// which is what keeps fifteen separately generated images looking like a set.
import sharp from 'sharp';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const SITE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = join(SITE_DIR, 'scratchpad/guide-art-raw');
const HERO_DIR = join(SITE_DIR, 'public/guide-art');
const THUMB_DIR = join(SITE_DIR, 'public/guide-thumbs');

const CAPABILITY = 'fal-ai-schnell-4412b32c';
const ENDPOINT = 'https://fal.mpp.tempo.xyz/fal-ai/flux/schnell';
const MAX_PAY = '0.02';

// Generate tall, then keep the central band. FLUX writes plausible-looking
// garbage lettering into the margins of anything drawn in a plate style, and
// no amount of "no text" in the prompt stops it. Cropping the margins off is
// what actually removes it, so the generation is deliberately taller than the
// banner and loses its top and bottom.
const GEN_WIDTH = 1216;
const GEN_HEIGHT = 768;
const KEEP_BAND = 0.72;
// The finished plate is art plus a caption strip. The strip is added to the
// canvas rather than painted over the art, so the caption can never cover the
// subject and a subject-aware crop can never be pushed out of frame.
const ART_H = 422;
const BAND_H = 58;

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
    glyph:
      '<circle cx="12" cy="12" r="9"/><path d="M16.5 7.5 L13.5 13.5 L7.5 16.5 L10.5 10.5 Z" fill="CURRENT" stroke="none"/>',
  },
  'mcp-development': {
    label: 'MCP DEVELOPMENT',
    glyph:
      '<path d="M9 7 V4.5 M15 7 V4.5" stroke-linecap="round"/><rect x="6" y="7" width="12" height="8" rx="2"/><path d="M12 15 V19 M8 19 H16" stroke-linecap="round"/>',
  },
  'ai-agent-enablement': {
    label: 'AI-AGENT ENGINEERING',
    glyph:
      '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M7 9.5 L10 12 L7 14.5 M12 15 H16.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
};

// Every prompt describes the article's central idea as a thing that can be
// engraved. Subjects are mechanical and physical on purpose: the model draws
// apparatus far more reliably than it draws abstraction, and apparatus is
// what survives the duotone conversion with its linework intact.
const STYLE =
  'antique 19th-century patent-drawing engraving, fine cross-hatched linework, ' +
  'copperplate scientific-plate style, plain white background, monochrome ink, ' +
  'a single small subject centred in a large empty field, wide bare margins, ' +
  'no text, no lettering, no numerals, no labels, ' +
  'no watermark, no signature, no border frame';

const SUBJECTS = {
  '/safari-extensions/convert-chrome-extension-to-safari/':
    'a precision machine translating a mechanism from one housing into a second differently-shaped housing, gears meshing partway, some teeth not aligning',
  '/safari-extensions/webrequest-alternative/':
    'a river with an inspector standing mid-current beside a second river with a pre-built stone sluice gate doing the same work unattended',
  '/safari-extensions/converter-not-working/':
    'four intact wax seals on a closed door, and beyond the doorway an unlit workshop of stopped machinery',
  '/safari-extensions/app-store-rejection/':
    'a sealed gate with an official examining a document through a magnifying glass, a queue of crates waiting behind him',
  '/safari-extensions/dynamic-dnr-rules/':
    'a brass apothecary cabinet of small drawers, nearly every drawer wedged open by old contents, a hand trying to close one more',
  '/safari-extensions/spa-page-identity/':
    'two cast medallions of the same building struck from different dies, held side by side in a pair of calipers',
  '/safari-extensions/main-world-scripts/':
    'two sealed glass chambers sharing one floor, a specimen visible in both, no passage between the chambers',
  '/mcp-development/stateful-mcp-servers/':
    'a telephone switchboard where one cord must return to one specific numbered jack, other jacks dark',
  '/mcp-development/mcp-stateless-migration/':
    'a mail sorting hall where every clerk can serve any letter, the old pigeonhole wall dismantled and stacked aside',
  '/mcp-development/mcp-elicitation/':
    'an hourglass laid on its side beside a stopped pendulum, a ribbon marking one position on a blank dial',
  '/mcp-development/tool-design-for-agents/':
    'a surgical instrument tray where a hand has removed the unusable instruments before presenting it',
  '/mcp-development/sandboxing-untrusted-code/':
    'a laboratory glovebox containing a specimen, with far more hoses and conduits entering it than the operator appears to notice',
  '/ai-agent-enablement/detect-ai-traffic/':
    'an automaton reading in an empty library, and separately a person arriving at a door carrying a note',
  '/ai-agent-enablement/oauth-for-agents/':
    'one key lifted from a rack of identical hanging keys, leaving a single empty hook, an hourglass standing beside the rack',
  '/ai-agent-enablement/integration-config-vs-code/':
    'a cabinet of standardised interchangeable parts beside a workbench holding three hand-filed one-off pieces',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function guides() {
  const src = readFileSync(join(SITE_DIR, 'lib/guides.ts'), 'utf8');
  return [
    ...src.matchAll(
      /slug:\s*'([^']+)',\s*title:\s*(?:'((?:[^'\\]|\\')*)'|"((?:[^"\\]|\\")*)")[\s\S]*?topic:\s*'([^']+)'/g,
    ),
  ].map((m) => ({
    slug: m[1],
    title: (m[2] ?? m[3]).replace(/\\'/g, "'").replace(/\\"/g, '"'),
    topic: m[4],
  }));
}

const fileKey = (slug) => slug.replace(/^\/|\/$/g, '').replace(/\//g, '--');

async function generateRaw(guide) {
  const rawPath = join(RAW_DIR, `${fileKey(guide.slug)}.png`);
  if (existsSync(rawPath)) {
    console.log(`  cached: ${guide.slug}`);
    return rawPath;
  }

  const subject = SUBJECTS[guide.slug];
  if (!subject) throw new Error(`no subject prompt for ${guide.slug}`);

  const payload = JSON.stringify({
    prompt: `${subject}, ${STYLE}`,
    image_size: { width: GEN_WIDTH, height: GEN_HEIGHT },
    num_images: 1,
    num_inference_steps: 4,
  });
  console.log(`  generating: ${guide.slug}`);

  const { stdout } = await execFileAsync(
    'zero',
    ['fetch', ENDPOINT, '--capability', CAPABILITY, '--json', '--max-pay', MAX_PAY,
     '-H', 'Content-Type:application/json', '-d', payload],
    { maxBuffer: 64 * 1024 * 1024 },
  );

  const env = JSON.parse(stdout);
  if (!env.ok) throw new Error(`generation failed (${env.status}): ${String(env.bodyRaw).slice(0, 300)}`);

  // The capability returns an images array; entries are either a URL or
  // inline base64 depending on the model backend, so handle both.
  const first = env.body?.images?.[0];
  const url = typeof first === 'string' ? first : first?.url ?? first?.image;
  if (!url) throw new Error(`no image in response: ${JSON.stringify(env.body).slice(0, 300)}`);

  mkdirSync(RAW_DIR, { recursive: true });
  if (url.startsWith('data:') || !url.startsWith('http')) {
    const b64 = url.includes(',') ? url.split(',')[1] : url;
    writeFileSync(rawPath, Buffer.from(b64, 'base64'));
  } else {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download failed: ${res.status}`);
    writeFileSync(rawPath, Buffer.from(await res.arrayBuffer()));
  }
  return rawPath;
}

// Force the generation into exactly two colors. The image becomes an alpha
// mask (dark linework -> opaque), navy is painted through that mask onto
// cream, so no color the model chose can reach the page.
async function duotone(rawPath, width, height) {
  // Drop the plate margins, where FLUX writes its garbage lettering, then let
  // sharp pick the crop window so the subject survives whatever its position.
  const meta = await sharp(rawPath).metadata();
  const keep = Math.round(meta.height * KEEP_BAND);
  const top = Math.round((meta.height - keep) / 2);
  const cropped = await sharp(rawPath)
    .extract({ left: 0, top, width: meta.width, height: keep })
    .toBuffer();

  const mask = await sharp(cropped)
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .greyscale()
    .normalise()
    .linear(1.35, -28) // deepen the lines, drop paper grain toward white
    .negate() // ink becomes opaque, paper becomes transparent
    .toBuffer();

  const inkLayer = await sharp({
    create: { width, height, channels: 3, background: PALETTE.navy },
  })
    .joinChannel(mask)
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 3, background: PALETTE.paper },
  })
    .composite([{ input: inkLayer, blend: 'over' }])
    .png()
    .toBuffer();
}

function sealSvg(topic, width, height) {
  const meta = TOPIC_META[topic];
  const glyph = meta.glyph.replaceAll('CURRENT', PALETTE.navy);
  const seal = 96;
  const cx = width - seal - 28;
  const cy = height - BAND_H - seal - 20;
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${width}" height="10" fill="${PALETTE.amber}"/>
  <g>
    <circle cx="${cx + seal / 2}" cy="${cy + seal / 2}" r="${seal / 2}" fill="${PALETTE.paper}" opacity="0.94"/>
    <circle cx="${cx + seal / 2}" cy="${cy + seal / 2}" r="${seal / 2}" fill="none" stroke="${PALETTE.navy}" stroke-width="2"/>
    <g transform="translate(${cx + seal / 2 - 24}, ${cy + seal / 2 - 24}) scale(2)" fill="none" stroke="${PALETTE.navy}" stroke-width="1.4">${glyph}</g>
  </g>
  <rect x="0" y="${height - BAND_H}" width="${width}" height="1.5" fill="${PALETTE.rule}"/>
  <text x="28" y="${height - 22}" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="5" fill="${PALETTE.amber}">${esc(meta.label)}</text>
</svg>`);
}

async function cut(guide, rawPath) {
  mkdirSync(HERO_DIR, { recursive: true });
  mkdirSync(THUMB_DIR, { recursive: true });

  // Compose once at full size. sharp resizes before it composites no matter
  // what order the calls are written in, so the thumbnail has to be a second
  // pass over the finished image rather than a resize chained onto the first.
  const art = await duotone(rawPath, 1200, ART_H);
  const base = await sharp(art)
    .extend({ bottom: BAND_H, background: PALETTE.paper })
    .png()
    .toBuffer();
  const composed = await sharp(base)
    .composite([{ input: sealSvg(guide.topic, 1200, 480), blend: 'over' }])
    .png()
    .toBuffer();

  // hero banner
  await sharp(composed).toFile(join(HERO_DIR, `${fileKey(guide.slug)}.png`));

  // index thumbnail, same art so the card and the article agree
  await sharp(composed)
    .resize(600, 240)
    .png()
    .toFile(join(THUMB_DIR, `${fileKey(guide.slug)}.png`));

  console.log(`  cut: ${guide.slug}`);
}

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--slug='))?.split('=')[1];
const processOnly = args.includes('--process');

let spent = 0;
for (const guide of guides()) {
  if (only && guide.slug !== only) continue;
  const rawPath = join(RAW_DIR, `${fileKey(guide.slug)}.png`);

  if (processOnly) {
    if (!existsSync(rawPath)) {
      console.log(`  skip (no cached raw): ${guide.slug}`);
      continue;
    }
  } else {
    const had = existsSync(rawPath);
    await generateRaw(guide);
    if (!had) spent += 0.003;
  }
  await cut(guide, rawPath);
}

console.log(`\ndone. paid generations this run: $${spent.toFixed(3)}`);
