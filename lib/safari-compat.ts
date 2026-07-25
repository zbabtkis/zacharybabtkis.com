/**
 * Safari Web Extension compatibility rules, evaluated against a Chrome
 * extension's manifest.json. Written from shipping Safari ports at Honey
 * and ZeroClick — the same checks the paid assessment starts with.
 *
 * Severities:
 *  - blocker:  the capability does not exist in Safari; the feature needs
 *              a redesign or has to be cut
 *  - redesign: works in Safari, but through a different model — plan
 *              real engineering time
 *  - partial:  supported with meaningful differences; verify against the
 *              Safari versions you target
 *  - note:     worth knowing; usually cheap
 * Everything not flagged is listed as expected-to-carry-over.
 */

export type Severity = 'blocker' | 'redesign' | 'partial' | 'note';

export type Finding = {
  severity: Severity;
  title: string;
  detail: string;
  evidence: string;
  guide?: string;
  ios?: string;
};

export type Manifest = Record<string, unknown>;

export type Report = {
  findings: Finding[];
  supported: string[];
  manifestVersion: number | null;
  name: string | null;
};

const KNOWN_SUPPORTED = [
  'storage',
  'tabs',
  'activeTab',
  'scripting',
  'alarms',
  'cookies',
  'contextMenus',
  'menus',
  'unlimitedStorage',
  'webNavigation',
  'clipboardWrite',
];

function perms(manifest: Manifest): string[] {
  const a = Array.isArray(manifest.permissions) ? manifest.permissions : [];
  const b = Array.isArray(manifest.optional_permissions)
    ? manifest.optional_permissions
    : [];
  return [...a, ...b].filter((p): p is string => typeof p === 'string');
}

function hostPerms(manifest: Manifest): string[] {
  const fromKey = Array.isArray(manifest.host_permissions)
    ? manifest.host_permissions
    : [];
  const fromPerms = perms(manifest).filter(
    (p) => p.includes('://') || p === '<all_urls>',
  );
  return [...fromKey, ...fromPerms].filter(
    (p): p is string => typeof p === 'string',
  );
}

export function analyzeManifest(manifest: Manifest): Report {
  const findings: Finding[] = [];
  const p = perms(manifest);
  const hosts = hostPerms(manifest);
  const mv =
    typeof manifest.manifest_version === 'number'
      ? manifest.manifest_version
      : null;
  const background = (manifest.background ?? {}) as Record<string, unknown>;

  const has = (perm: string) => p.includes(perm);

  // --- Request interception ---
  if (has('webRequestBlocking')) {
    findings.push({
      severity: 'blocker',
      title: 'Blocking webRequest does not exist in Safari',
      detail:
        'Safari never allowed extension code in the request path. Blocking and rewriting move to declarativeNetRequest: rules the browser applies itself. Logic that inspects requests at runtime needs a redesign; anything deciding from response content needs a different approach entirely.',
      evidence: 'permissions: webRequestBlocking',
      guide: '/safari-extensions/webrequest-alternative/',
    });
  } else if (has('webRequest')) {
    findings.push({
      severity: 'partial',
      title: 'webRequest is observation-only at best',
      detail:
        'Non-blocking webRequest support in Safari is limited and version-dependent. If you only use it for telemetry, plan to rebuild those signals from content scripts or DNR feedback instead.',
      evidence: 'permissions: webRequest',
      guide: '/safari-extensions/webrequest-alternative/',
    });
  }

  if (
    has('declarativeNetRequest') ||
    has('declarativeNetRequestWithHostAccess')
  ) {
    findings.push({
      severity: 'note',
      title: 'DNR carries over, but budget for rule limits',
      detail:
        'Safari enforces its own rule-count limits, and they differ from Chrome’s and by Safari version. Large or dynamic rule sets need a compilation and prioritization strategy.',
      evidence: 'permissions: declarativeNetRequest',
      guide: '/safari-extensions/dynamic-dnr-rules/',
    });
  }

  // --- Background lifecycle ---
  // Chrome MV2 backgrounds are persistent BY DEFAULT: an omitted
  // `persistent` key means persistent, and `background.page` counts too.
  const hasLegacyBackground =
    Array.isArray(background.scripts) || typeof background.page === 'string';
  if (
    background.persistent === true ||
    (mv === 2 && hasLegacyBackground && background.persistent !== false)
  ) {
    findings.push({
      severity: 'redesign',
      title: 'Persistent background pages are not supported',
      detail:
        'Safari suspends background scripts aggressively. In-memory state, long-lived timers, and open sockets evaporate between events. Move state into storage and make everything event-driven. Chrome’s MV3 forced the same discipline.',
      evidence:
        background.persistent === true
          ? 'background.persistent: true'
          : 'background page (persistent by default in manifest v2)',
      guide: '/safari-extensions/converter-not-working/',
    });
  } else if (typeof background.service_worker === 'string') {
    findings.push({
      severity: 'note',
      title: 'Service-worker background: test the lifecycle',
      detail:
        'Modern Safari runs MV3 service workers, but suspension timing differs from Chrome. Bugs show up as flakiness after idle. Add handshakes around the first message after wake.',
      evidence: 'background.service_worker',
      guide: '/safari-extensions/converter-not-working/',
    });
  }

  // --- Messaging & native ---
  if (has('nativeMessaging')) {
    findings.push({
      severity: 'redesign',
      title: 'Native messaging goes through your containing app',
      detail:
        'There is no standalone native host in Safari. The extension ships inside a Mac/iOS app, and native messaging talks to that app. Different packaging, different lifecycle, different review surface.',
      evidence: 'permissions: nativeMessaging',
    });
  }

  if (manifest.externally_connectable) {
    findings.push({
      severity: 'partial',
      title: 'externally_connectable behaves differently',
      detail:
        'Messaging from web pages into the extension is more restricted in Safari. If your site talks to your extension, plan an alternative channel and verify on your target versions.',
      evidence: 'externally_connectable',
    });
  }

  // --- Identity / accounts ---
  if (has('identity')) {
    findings.push({
      severity: 'redesign',
      title: 'chrome.identity is not available',
      detail:
        'OAuth flows built on chrome.identity need rebuilding on web-based auth flows (and careful redirect handling inside the extension context).',
      evidence: 'permissions: identity',
    });
  }

  // --- Flat unsupported surfaces ---
  const unsupported: Array<[string, string]> = [
    ['gcm', 'Push via GCM/FCM has no Safari-extension equivalent.'],
    ['proxy', 'Proxy control is not exposed to Safari extensions.'],
    ['privacy', 'The privacy API is not exposed to Safari extensions.'],
    ['history', 'The history API is not available in Safari.'],
    ['bookmarks', 'The bookmarks API is not available in Safari.'],
    ['topSites', 'topSites is not available in Safari.'],
    ['browsingData', 'browsingData is not available in Safari.'],
    ['tabGroups', 'tabGroups is not available in Safari.'],
    ['offscreen', 'Offscreen documents are a Chrome-only construct.'],
    ['sidePanel', 'Chrome’s sidePanel API has no Safari equivalent.'],
    ['management', 'The management API is not available in Safari.'],
  ];
  for (const [perm, why] of unsupported) {
    if (has(perm)) {
      findings.push({
        severity: 'blocker',
        title: `${perm} is not available in Safari`,
        detail: `${why} Features built on it need a redesign or get cut. The assessment weighs which.`,
        evidence: `permissions: ${perm}`,
      });
    }
  }

  // --- Manifest surfaces ---
  const overrides = manifest.chrome_url_overrides as
    | Record<string, unknown>
    | undefined;
  if (overrides && Object.keys(overrides).length > 0) {
    findings.push({
      severity: 'blocker',
      title: 'Page overrides (new tab, history, bookmarks) don’t exist',
      detail:
        'Safari does not let extensions replace built-in pages. A new-tab product needs a different form on Safari, usually a popover or a standalone surface.',
      evidence: `chrome_url_overrides: ${Object.keys(overrides).join(', ')}`,
    });
  }

  if (manifest.omnibox) {
    findings.push({
      severity: 'blocker',
      title: 'Omnibox keywords are not supported',
      detail: 'Safari’s address bar is closed to extensions.',
      evidence: 'omnibox',
    });
  }

  if (manifest.devtools_page) {
    findings.push({
      severity: 'partial',
      title: 'Web Inspector extensions: verify your panel APIs',
      detail:
        'Safari 16 and later load extension panels in Web Inspector, but the devtools API surface is a subset of Chrome’s. Verify every devtools.* call you make against the Safari versions you target.',
      evidence: 'devtools_page',
    });
  }

  if (manifest.commands) {
    findings.push({
      severity: 'partial',
      title: 'Keyboard commands: verify, and forget them on iOS',
      detail:
        'Command support varies by Safari version, and iOS has no keyboard-shortcut surface for extensions.',
      evidence: 'commands',
      ios: 'No keyboard commands on iOS.',
    });
  }

  // --- Content scripts ---
  const contentScripts = Array.isArray(manifest.content_scripts)
    ? (manifest.content_scripts as Array<Record<string, unknown>>)
    : [];
  if (contentScripts.some((cs) => cs.world === 'MAIN')) {
    findings.push({
      severity: 'partial',
      title: 'MAIN-world content scripts need version care',
      detail:
        'Main-world injection support and registration ordering differ across Safari versions. The isolated/main boundary is where converted extensions get subtle bugs.',
      evidence: "content_scripts[].world: 'MAIN'",
      guide: '/safari-extensions/main-world-scripts/',
    });
  }

  // --- Permission UX ---
  if (
    hosts.includes('<all_urls>') ||
    hosts.some((h) => h.startsWith('*://*/'))
  ) {
    findings.push({
      severity: 'note',
      title: 'All-sites access means a Safari permission prompt',
      detail:
        'Safari asks users per-site (or “always allow on every website”) with deliberately scary wording. Expect a first-run drop-off Chrome never showed you, and design onboarding for it. App Review also wants the breadth justified.',
      evidence: 'host access: <all_urls>',
      guide: '/safari-extensions/app-store-rejection/',
      ios: 'The same prompts appear on iOS, on a smaller screen.',
    });
  }

  if (manifest.theme) {
    findings.push({
      severity: 'blocker',
      title: 'Browser themes are not a Safari concept',
      detail: 'Theme extensions have no Safari form.',
      evidence: 'theme',
    });
  }

  // Supported list (what we recognized and expect to carry over)
  const supported = p.filter((perm) => KNOWN_SUPPORTED.includes(perm));

  return {
    findings,
    supported,
    manifestVersion: mv,
    name: typeof manifest.name === 'string' ? manifest.name : null,
  };
}

export function verdict(report: Report): string {
  const blockers = report.findings.filter((f) => f.severity === 'blocker');
  const redesigns = report.findings.filter((f) => f.severity === 'redesign');

  if (blockers.length > 0) {
    return `${blockers.length} ${blockers.length === 1 ? 'capability' : 'capabilities'} in this manifest ${blockers.length === 1 ? 'does' : 'do'} not exist in Safari. A port means redesigning around ${blockers.length === 1 ? 'it' : 'them'}. That is possible more often than teams expect, but it is engineering, not conversion.`;
  }
  if (redesigns.length > 0) {
    return `No hard blockers in the manifest, but ${redesigns.length} ${redesigns.length === 1 ? 'area needs' : 'areas need'} a redesign around Safari's model. A port looks feasible with real engineering in those spots.`;
  }
  if (report.findings.length > 0) {
    return 'No blockers and no redesigns in the manifest. Verify the flagged items against the Safari versions you target, and this port looks straightforward.';
  }
  return 'Nothing in this manifest fights Safari. The remaining risk lives in the code: background lifecycle assumptions and API behavior differences.';
}
