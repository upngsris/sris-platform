const stats = [
  ["6", "Disciplines", "Science disciplines working together."],
  ["XX", "Projects", "Research and practical activities."],
  ["XX", "Members", "Students exploring beyond lectures."],
];

export function Stats() {
  return (
    <section className="pb-40">
      <div className="editorial-shell">
        <div className="rule pt-8">
          <p className="eyebrow">SRIS at a glance</p>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {stats.map(([value, label, description]) => (
              <div key={label}>
                <p className="font-[family-name:var(--font-geist)] text-6xl font-medium tracking-[-0.04em]">{value}</p>
                <p className="eyebrow mt-5">{label}</p>
                <p className="body-lg muted mt-3 max-w-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
