/**
 * The one arrow allowed on the site: a drawn SVG for pure "X → Y" headings.
 * Never use a unicode arrow in copy.
 */
export function Arrow() {
  return (
    <svg
      className="h-arrow"
      viewBox="0 0 40 12"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M1 6 H37 M31 1.5 L37.5 6 L31 10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
