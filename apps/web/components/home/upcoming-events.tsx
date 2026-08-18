import { events } from "@/lib/placeholder-data";

export function UpcomingEvents() {
  return (
    <section id="community" className="section-space bg-white">
      <div className="editorial-shell">
        <div className="editorial-grid">
          <div className="md:col-span-5">
            <p className="eyebrow text-[var(--blue)]">Upcoming events</p>
            <h2 className="headline-lg mt-6">What&apos;s happening at SRIS.</h2>
          </div>
          <div className="mt-12 md:col-span-7 md:mt-0">
            {events.map((event) => (
              <a href="#" key={`${event.day}-${event.title}`} className="grid grid-cols-[64px_1fr_auto] gap-5 border-t border-[var(--outline-soft)] py-7 last:border-b">
                <div>
                  <p className="font-[family-name:var(--font-geist)] text-3xl font-medium">{event.day}</p>
                  <p className="eyebrow mt-1">{event.month}</p>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-geist)] text-xl font-medium">{event.title}</h3>
                  <p className="muted mt-2 text-sm">{event.place} · {event.time}</p>
                </div>
                <span>→</span>
              </a>
            ))}
            <a className="ghost-link mt-8 text-[var(--blue)]" href="#">All events <span>→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
