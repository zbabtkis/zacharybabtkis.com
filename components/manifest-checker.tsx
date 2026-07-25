'use client';

import { useState } from 'react';
import {
  analyzeManifest,
  verdict,
  type Report,
  type Severity,
} from '@/lib/safari-compat';
import { SITE, mailto, calLink } from '@/lib/site';

const EXAMPLE = `{
  "manifest_version": 3,
  "name": "Example Shopping Helper",
  "permissions": ["storage", "activeTab", "webRequestBlocking", "identity", "offscreen"],
  "host_permissions": ["<all_urls>"],
  "background": { "persistent": true },
  "chrome_url_overrides": { "newtab": "newtab.html" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"], "world": "MAIN" }]
}`;

const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  blocker: { label: 'Does not exist in Safari', className: 'sev-blocker' },
  redesign: { label: 'Needs a redesign', className: 'sev-redesign' },
  partial: { label: 'Verify against your target versions', className: 'sev-partial' },
  note: { label: 'Worth knowing', className: 'sev-note' },
};

const SEVERITY_ORDER: Severity[] = ['blocker', 'redesign', 'partial', 'note'];

export function ManifestChecker() {
  const [input, setInput] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (text: string) => {
    setError(null);
    setReport(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError(
        'That isn’t valid JSON. Paste the contents of your manifest.json. Comments and trailing commas need to come out first.',
      );
      return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setError('That JSON isn’t a manifest object.');
      return;
    }
    setReport(analyzeManifest(parsed as Record<string, unknown>));
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setInput(text);
    run(text);
  };

  return (
    <div className="checker">
      <label className="checker-label" htmlFor="manifest-input">
        Paste your manifest.json
      </label>
      <textarea
        id="manifest-input"
        className="checker-input"
        value={input}
        spellCheck={false}
        placeholder='{ "manifest_version": 3, "name": "…", "permissions": ["…"] }'
        onChange={(event) => setInput(event.target.value)}
        onDrop={(event) => {
          event.preventDefault();
          onFile(event.dataTransfer.files[0]);
        }}
        onDragOver={(event) => event.preventDefault()}
      />
      <div className="checker-actions">
        <button className="button" type="button" onClick={() => run(input)}>
          Check it
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setInput(EXAMPLE);
            run(EXAMPLE);
          }}
        >
          Try an example
        </button>
        <span className="form-note">
          Runs in your browser. Nothing is uploaded or stored.
        </span>
      </div>

      {error ? <p className="checker-error">{error}</p> : null}

      {report ? (
        <div className="checker-report">
          <h2>
            {report.name ? `${report.name}: ` : ''}the manifest read
          </h2>
          <p className="checker-verdict">{verdict(report)}</p>

          {SEVERITY_ORDER.map((severity) => {
            const items = report.findings.filter(
              (finding) => finding.severity === severity,
            );
            if (items.length === 0) return null;
            const meta = SEVERITY_META[severity];
            return (
              <div className="checker-group" key={severity}>
                <h3 className={meta.className}>{meta.label}</h3>
                <ul>
                  {items.map((finding) => (
                    <li key={finding.title}>
                      <strong>{finding.title}</strong>
                      <span className="checker-evidence">
                        {finding.evidence}
                      </span>
                      <p>{finding.detail}</p>
                      {finding.ios ? (
                        <p className="checker-ios">iOS: {finding.ios}</p>
                      ) : null}
                      {finding.guide ? (
                        <p>
                          <a href={finding.guide}>
                            I wrote a guide on this problem
                          </a>
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {report.supported.length > 0 ? (
            <div className="checker-group">
              <h3 className="sev-ok">Expected to carry over</h3>
              <p className="checker-supported">
                {report.supported.join(' · ')}
              </p>
            </div>
          ) : null}

          <div className="checker-cta">
            <p>
              This is the manifest layer only. The paid assessment runs your
              actual codebase: every API call checked, a
              DeclarativeNetRequest migration plan if you need one, App
              Store review risks, and a fixed-bid quote. It takes one week,
              costs $2,500, and is credited toward the port.
            </p>
            <div className="offer-actions">
              <a
                className="button"
                href={
                  SITE.calUsername
                    ? calLink('manifest-checker')
                    : mailto('Safari Port Assessment')
                }
              >
                Book a free intro call
              </a>
              <a
                className="button secondary"
                href={mailto('Safari Port Assessment')}
              >
                Email me instead
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
