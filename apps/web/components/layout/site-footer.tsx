const groups = [
  ["About", "About SRIS", "Mission & Vision", "Our People", "Contact"],
  ["Research", "Projects", "Publications", "Student Showcase", "Projects to Join"],
  ["Community", "Events", "Membership", "Collaborations", "News"],
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--blue-dark)] py-20 text-white">
      <div className="editorial-shell">
        <div className="editorial-grid">
          <div className="md:col-span-5">
            <p className="eyebrow text-white/70">Science · Research · Innovation</p>
            <h2 className="mt-6 font-[family-name:var(--font-geist)] text-4xl font-medium tracking-[-0.02em]">
              UPNG SRIS
            </h2>
            <p className="mt-5 max-w-sm text-lg text-white/75">Go beyond the classroom.</p>
          </div>
          <div className="grid gap-10 md:col-span-7 md:grid-cols-3">
            {groups.map(([title, ...links]) => (
              <div key={title}>
                <p className="eyebrow text-white/60">{title}</p>
                <div className="mt-5 grid gap-3">
                  {links.map((link) => <a key={link} href="#" className="text-sm text-white/85">{link}</a>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-20 border-t border-white/20 pt-8 text-sm text-white/60">
          <p>Science, Research &amp; Innovation Society · University of Papua New Guinea</p>
        </div>
      </div>
    </footer>
  );
}
