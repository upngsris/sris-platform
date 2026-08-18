export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)]">
      <div className="h-3 bg-[var(--blue)]" />
      <div className="editorial-shell">
        <div className="flex min-h-24 items-center justify-between border-b border-[var(--outline-soft)]">
          <a href="#" className="font-[family-name:var(--font-geist)] text-xl font-semibold tracking-[-0.02em]">
            UPNG SRIS
          </a>
          <nav className="hidden items-center gap-8 font-[family-name:var(--font-geist)] text-sm font-medium md:flex">
            <a href="#about">About</a>
            <a href="#research">Research</a>
            <a href="#learn">Learn &amp; Do</a>
            <a href="#community">Community</a>
          </nav>
          <div className="hidden items-center gap-6 md:flex">
            <button className="text-sm">Search</button>
            <a href="#membership" className="btn-primary">Join SRIS <span>→</span></a>
          </div>
          <button aria-label="Open menu" className="font-[family-name:var(--font-geist)] text-sm font-semibold md:hidden">
            MENU
          </button>
        </div>
      </div>
    </header>
  );
}
