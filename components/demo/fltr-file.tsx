import { Term } from "../term";

interface FltrFileProps {
  fileName: string;
  contents: string;
}

export function FltrFile({ fileName, contents }: FltrFileProps) {
  return (
    <section id="format" aria-labelledby="format-heading" className="scroll-mt-4 border-t border-line">
      <div className="container-page grid items-start gap-x-12 gap-y-8 py-16 md:grid-cols-2">
        <div className="max-w-[60ch]">
          <h2 id="format-heading" className="h2-display">
            A fltr is just a file.
          </h2>
          <p className="mt-5 text-[19px] text-muted">
            No black box. The whole algorithm is a short, readable <Term>.fltr</Term> file. Share it with a friend,
            build on publicly shared <Term>fltrs</Term>, or take yours to any app that reads the format.
          </p>
          <p className="mt-4 text-[15px] text-muted">
            <span aria-hidden="true" className="mr-2 font-mono text-[18px] text-fg md:hidden">
              ↓
            </span>
            This example updates as you change the <Term>fltr</Term> above.
            <span aria-hidden="true" className="ml-2 hidden font-mono text-[18px] text-fg md:inline">
              →
            </span>
          </p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-md border border-line">
          <div className="border-b border-line bg-surface px-4 py-2 font-mono text-[13px] text-muted">{fileName}</div>
          <pre
            role="region"
            tabIndex={0}
            aria-label="The current fltr as a .fltr file"
            className="m-0 overflow-x-auto bg-bg p-4 font-mono text-[14px] leading-[1.65] text-fg"
          >
            <code>{contents}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
