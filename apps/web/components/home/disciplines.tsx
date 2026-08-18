import { disciplines } from "@/lib/placeholder-data";

export function Disciplines() {
  return (
    <section className="section-space bg-[var(--blue)] text-white">
      <div className="editorial-shell">
        <div className="editorial-grid">
          <div className="md:col-span-6">
            <p className="eyebrow text-white/70">Explore</p>
            <h2 className="headline-lg mt-6">Different fields.<br />Shared curiosity.</h2>
          </div>
          <div className="mt-12 md:col-span-6 md:mt-0">
            {disciplines.map((name, index) => (
              <a key={name} href="#" className="group flex items-center gap-6 border-t border-white/30 py-6 last:border-b">
                <span className="eyebrow w-8 text-white/50">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-[family-name:var(--font-geist)] text-xl font-medium">{name}</span>
                <span className="transition-transform group-hover:translate-x-1 group-hover:text-[var(--orange)]">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
