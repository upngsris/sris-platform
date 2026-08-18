export function LearnAndDo() {
  return (
    <section id="learn" className="section-space bg-[var(--surface-low)]">
      <div className="editorial-shell">
        <p className="eyebrow text-[var(--blue)]">Learn &amp; Do</p>
        <h2 className="headline-lg mt-6 max-w-3xl">Learn something.<br />Then do something with it.</h2>

        <div className="editorial-grid mt-20 items-start">
          <article className="md:col-span-7">
            <div className="placeholder aspect-[4/3]"><span className="placeholder-label">Skills track photograph · 4:3</span></div>
            <p className="eyebrow mt-6 text-[var(--blue)]">Skills track</p>
            <h3 className="headline-md mt-3">Python for Data Analysis</h3>
            <p className="body-lg muted mt-4 max-w-xl">Build practical skills for analysing scientific datasets.</p>
            <a className="ghost-link mt-6 text-[var(--blue)]" href="#">Explore <span>→</span></a>
          </article>
          <article className="mt-16 md:col-span-4 md:col-start-9 md:mt-40">
            <div className="placeholder aspect-[4/3] min-h-0"><span className="placeholder-label">Lab practical photograph · 4:3</span></div>
            <p className="eyebrow mt-6 text-[var(--blue)]">Lab practical</p>
            <h3 className="headline-md mt-3">Introduction to Microscopy</h3>
            <a className="ghost-link mt-6 text-[var(--blue)]" href="#">Explore <span>→</span></a>
          </article>
        </div>
      </div>
    </section>
  );
}
