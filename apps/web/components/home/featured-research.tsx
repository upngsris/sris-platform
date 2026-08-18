export function FeaturedResearch() {
  return (
    <section id="research" className="section-space bg-white">
      <div className="editorial-shell">
        <p className="eyebrow text-[var(--blue)]">Featured research</p>
        <h2 className="headline-lg mt-6 max-w-3xl">Research isn&apos;t something students only read about.</h2>

        <article className="editorial-grid mt-20 items-stretch">
          <div className="placeholder md:col-span-8"><span className="placeholder-label">Project photograph · 16:9</span></div>
          <div className="flex flex-col justify-between bg-[var(--blue)] p-8 text-white md:col-span-4 md:p-10">
            <div>
              <p className="eyebrow text-white/70">Environmental Science · Research · 2026</p>
              <h3 className="headline-md mt-6">Understanding our environment through practical research.</h3>
              <p className="body-lg mt-6 text-white/75">A placeholder feature demonstrating how a student-led research story will be presented.</p>
            </div>
            <a className="ghost-link mt-12" href="#">Explore project <span>→</span></a>
          </div>
        </article>

        <article className="editorial-grid mt-8 items-stretch">
          <div className="order-2 flex flex-col justify-between bg-[var(--surface-low)] p-8 md:order-1 md:col-span-4 md:p-10">
            <div>
              <p className="eyebrow text-[var(--blue)]">Physics · Project · 2026</p>
              <h3 className="headline-md mt-6">Testing ideas beyond the lecture theatre.</h3>
              <p className="body-lg muted mt-6">Placeholder copy for a second featured student project.</p>
            </div>
            <a className="ghost-link mt-12 text-[var(--blue)]" href="#">Explore project <span>→</span></a>
          </div>
          <div className="placeholder order-1 md:order-2 md:col-span-8"><span className="placeholder-label">Project photograph · 16:9</span></div>
        </article>
      </div>
    </section>
  );
}
