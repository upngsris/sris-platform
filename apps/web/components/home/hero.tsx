export function Hero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[var(--blue-dark)] text-white">
      <div className="absolute inset-0">
        <div className="placeholder h-full min-h-[760px] border-0 bg-[var(--surface-container)] text-[var(--ink)]">
          <span className="placeholder-label">Future SRIS documentary photograph · students actively conducting scientific or project work</span>
        </div>
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="editorial-shell relative flex min-h-[760px] items-end py-20 md:py-24">
        <div className="editorial-grid w-full">
          <div className="md:col-span-8">
            <p className="eyebrow">Science · Research · Innovation</p>
            <h1 className="display mt-6 max-w-[900px]">GO BEYOND<br />THE CLASSROOM.</h1>
            <p className="opening mt-8 max-w-xl text-white/85">
              Explore ideas. Test them. Build things. Share what you discover.
            </p>
            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <a className="btn-primary" href="#research">Explore projects <span>→</span></a>
              <a className="ghost-link" href="#membership">Become a member <span>→</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
