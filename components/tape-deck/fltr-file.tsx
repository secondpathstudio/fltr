interface FltrFileProps {
  fileName: string;
  contents: string;
}

export function FltrFile({ fileName, contents }: FltrFileProps) {
  return (
    <section id="format" aria-labelledby="format-heading" className="container-page scroll-mt-6 py-16">
      <div className="grid items-start gap-x-12 gap-y-8 [grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))]">
        <div className="max-w-[60ch]">
          <h2 id="format-heading" className="h2-display">
            Every FLTR is a plain .fltr file.
          </h2>
          <p className="mt-5 text-xl">
            Read it, fork it, and run it on fltr.world or any app that reads the open .fltr format. Your
            algorithm belongs to you, not to the platform.
          </p>
          <p className="mt-4 text-base text-muted">Move a dial on the deck above and watch this file change.</p>
        </div>
        <div className="min-w-0">
          <div className="file-tab">{fileName}</div>
          <pre className="code-block" role="region" tabIndex={0} aria-label="The current FLTR as a .fltr file">
            <code>{contents}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
