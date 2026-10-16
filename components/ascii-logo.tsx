export const LOGO = String.raw`  __   _   _
 / _| | | | |_   _ _
|  _| | | |  _| | '_|
|_|   |_|  \__| |_|`;

export function AsciiLogo() {
  return (
    <pre aria-hidden="true" className="font-mono text-[14px] leading-[1.15] text-muted">
      {LOGO}
    </pre>
  );
}
