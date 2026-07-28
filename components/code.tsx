import { codeToHtml } from 'shiki';

/**
 * Build-time syntax highlighting. Renders during static export, so the
 * highlighted HTML ships with zero client-side JavaScript. The theme's
 * background is overridden in globals.css to match the site's terminal
 * surface.
 */
export async function Code({
  children,
  lang = 'js',
}: {
  children: string;
  lang?: string;
}) {
  const html = await codeToHtml(children.trim(), {
    lang,
    theme: 'one-dark-pro',
  });
  return (
    <div
      className="code-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
