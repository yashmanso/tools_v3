export function FooterRibbon() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Logos */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <a
              href="https://www.chalmers.se"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:opacity-70 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chalmers-logo.jpg"
                alt="Chalmers University of Technology"
                className="h-12 w-auto dark:invert"
                style={{ borderRadius: 0 }}
              />
            </a>
            <a
              href="https://enhanceuniversity.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:opacity-70 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/enhance-logo.png"
                alt="ENHANCE – European Universities of Technology Alliance"
                className="h-10 w-auto dark:invert"
                style={{ borderRadius: 0 }}
              />
            </a>
          </div>

          {/* Attribution text */}
          <p className="text-center text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            This toolbox is created by{' '}
            <a
              href="https://scholar.google.com/citations?user=CqKfy8MAAAAJ&hl=en&oi=ao"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors"
            >
              Yashar Mansoori
            </a>{' '}
            as part of an EU-funded Erasmus+ project (
            <a
              href="https://enhanceuniversity.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors"
            >
              ENHANCE+
            </a>
            ).
          </p>
        </div>
      </div>
    </footer>
  );
}
