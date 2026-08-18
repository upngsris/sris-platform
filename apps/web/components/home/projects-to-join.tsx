import { opportunities } from "@/lib/placeholder-data";

export function ProjectsToJoin() {
  return (
    <section className="section-space">
      <div className="editorial-shell">
        <div className="editorial-grid">
          <div className="md:col-span-5">
            <p className="eyebrow text-[var(--blue)]">Projects to join</p>
            <h2 className="headline-lg mt-6">Don&apos;t just read about the work.<br /><br />Take part.</h2>
          </div>
          <div className="mt-12 md:col-span-6 md:col-start-7 md:mt-0">
            {opportunities.map((item) => (
              <article key={item.title} className="border-t border-[var(--outline-soft)] py-8 last:border-b">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <p className="eyebrow text-[var(--blue)]">{item.discipline}</p>
                  <p className="eyebrow muted">{item.meta}</p>
                </div>
                <h3 className="headline-md mt-5">{item.title}</h3>
                <p className="body-lg muted mt-4">{item.description}</p>
                <p className="eyebrow mt-6 text-[var(--red)]">{item.status}</p>
                <a href="#" className="ghost-link mt-6 text-[var(--blue)]">View opportunity <span>→</span></a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
