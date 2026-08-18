import { stories } from "@/lib/placeholder-data";

export function LatestStories() {
  return (
    <section className="section-space bg-[var(--surface-low)]">
      <div className="editorial-shell">
        <p className="eyebrow text-[var(--blue)]">Stories</p>
        <h2 className="headline-lg mt-6 max-w-3xl">Ideas, discoveries and people from SRIS.</h2>
        <div className="mt-20 grid gap-12 md:grid-cols-12">
          {stories.map((story, index) => (
            <article key={story.title} className={index === 0 ? "md:col-span-7" : "md:col-span-5"}>
              <div className="placeholder aspect-[16/9] min-h-0"><span className="placeholder-label">Editorial story image</span></div>
              <p className="eyebrow mt-6 text-[var(--blue)]">{story.type} · {story.date}</p>
              <h3 className="headline-md mt-3">{story.title}</h3>
              <a className="ghost-link mt-6 text-[var(--blue)]" href="#">Read story <span>→</span></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
