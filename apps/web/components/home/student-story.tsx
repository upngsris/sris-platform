export function StudentStory() {
  return (
    <section className="relative min-h-[720px] bg-[var(--blue-dark)] text-white">
      <div className="absolute inset-0">
        <div className="placeholder h-full min-h-[720px] border-0"><span className="placeholder-label">Future documentary student portrait / project environment</span></div>
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="editorial-shell relative flex min-h-[720px] items-end py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Student stories</p>
          <blockquote className="headline-lg mt-6">&ldquo;Research changed how I think about science.&rdquo;</blockquote>
          <p className="body-lg mt-8">Student Name · Environmental Science</p>
          <a className="ghost-link mt-6" href="#">Read their story <span>→</span></a>
        </div>
      </div>
    </section>
  );
}
